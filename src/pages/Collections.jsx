import React, { useEffect, useState } from "react";
import { useAuth } from "../useAuth";
import { db } from "../firebaseConfig";
import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import GameCard from "../components/GameCard";
import axios from "axios";
import { Tilt } from "react-tilt";
import { useLocation, useNavigate } from "react-router-dom";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import ThumbsUpIcon from "../assets/icons/ThumbsUp";
import CommentIcon from "../assets/icons/CommentIcon";

// Placeholder components for future Reviews and Lists sections
const ReviewsSection = ({ userId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchReviews = async () => {
      try {
        const statusSnap = await getDocs(
          query(
            collection(db, "users", userId, "gameStatuses"),
            where("review", "!=", "")
          )
        );

        const reviewedGameIds = statusSnap.docs.map((doc) => doc.id);

        const reviewPromises = reviewedGameIds.map(async (gameId) => {
          const reviewRef = doc(db, "games", gameId, "reviews", userId);
          const snap = await getDoc(reviewRef);
          return snap.exists() ? { ...snap.data(), gameId } : null;
        });

        const allReviews = (await Promise.all(reviewPromises)).filter(Boolean);
        setReviews(allReviews);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [userId]);

  if (loading) {
    return <div className="text-white text-center mt-10">Loading reviews...</div>;
  }

  if (reviews.length === 0) {
    return <div className="text-white text-center mt-10">No reviews yet.</div>;
  }

  return (
    <div className="mt-10 relative">
      <ResponsiveMasonry
        columnsCountBreakPoints={{ 350: 1, 750: 2, 1024: 3 }}
        gutterBreakpoints={{ 350: "12px", 750: "16px", 1024: "24px" }}
      >
        <Masonry>
          {reviews.map((review, idx) => (
            <div
              key={idx}
              className="w-[900px] bg-customGray-900 rounded text-left shadow"
            >
              <div className="relative w-full border border-4 border-customGray-900 rounded-t">
                {/* Hero image as background */}
                <div className="w-full h-full bg-black absolute opacity-60" />
                <img
                  className="w-full h-[10rem] object-cover"
                  src={review.gameSnapshot?.heroImage || "/images/heroFallback.png"}
                  alt="Hero Image"
                />

                {/* Logo image positioned on top, constrained by container size */}
                {review.gameSnapshot?.logo ? (
                  <img
                    className="absolute top-0 ml-2 object-contain max-h-full max-w-full h-full px-4 py-6"
                    style={{ maxHeight: "100%", maxWidth: "100%" }}
                    src={review.gameSnapshot?.logo || "/images/logoFallback.png"}
                    alt="Game Logo"
                  />
                ) : (
                  // Center the game name both vertically and horizontally over the hero image
                  <div className="absolute px-2 inset-0 flex items-center justify-center pointer-events-none">
                    <p className="text-2xl font-bold text-white pl-2 drop-shadow-lg">
                      {review.gameSnapshot?.name}
                    </p>
                  </div>
                )}
              </div>


              <div className="px-4 pb-4 pt-2">
                <div className="text-yellow-400 font-bold text-sm mb-1 ">
                  {review.rating ? `Rating: ${review.rating} / 5` : `Rating: Unrated`}
                </div>

                <p className="text-white mb-2 font-light">{review.review}</p>

                <div className="text-sm w-full flex place-content-between items-center">
                  <div className="text-gray-500 italic">
                    Reviewed on: {review.createdAt?.toDate().toLocaleDateString()}
                  </div>

                  <div className="flex items-center gap-1 text-gray-300">
                    <ThumbsUpIcon className="w-4 h-4" disableHover />
                    <span>{review.likes ? Object.values(review.likes).filter(Boolean).length : 0}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Masonry>
      </ResponsiveMasonry>
    </div>
  );
};



const ListsSection = ({ userId }) => (
  <div className="text-white text-center mt-10">Lists feature coming soon.</div>
);

const Collections = ({ user, showProfile = true }) => {
  const { user: authUser, loading } = useAuth();
  const activeUser = user || authUser;
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);

  const initialSection = queryParams.get("section") || "games";
  const initialType = queryParams.get("type") || "played";
  const [section, setSection] = useState(initialSection);
  const [type, setType] = useState(initialType);
  const [games, setGames] = useState([]);
  const [preloadedGames, setPreloadedGames] = useState({});
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Small scroll nudge to fix rendering artifacts
    window.scrollBy(0, 1);
    window.scrollBy(0, -1);
  }, [type, section]);


  useEffect(() => {
    if (!activeUser) return;
    const fetchUserData = async () => {
      try {
        const userDocRef = doc(db, "users", activeUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setUserData(userDocSnap.data());
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserData();
  }, [activeUser]);

  useEffect(() => {
    const newSection = queryParams.get("section") || "games";
    const newType = queryParams.get("type") || "played";
    setSection(newSection);
    setType(newType);
  }, [location.search]);


  const fetchGameCovers = async (gamesList) => {
    try {
      const missingGames = gamesList.filter(
        (game) => !preloadedGames[game.id]
      );
      if (missingGames.length > 0) {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/gameDetails`,
          {
            ids: missingGames.map((game) => game.id),
          }
        );
        const fetchedGames = response.data;
        const newPreloadedGames = { ...preloadedGames };
        fetchedGames.forEach((game) => {
          newPreloadedGames[game.id] = {
            name: game.name,
            coverImage: game.coverImage,
          };
        });
        setPreloadedGames((prev) => ({
          ...prev,
          ...newPreloadedGames,
        }));
      }
      return gamesList.map((game) => ({
        ...game,
        name:
          preloadedGames[game.id]?.name || "Unknown Game",
        coverImage:
          preloadedGames[game.id]?.coverImage ||
          "/images/default_game_cover.png",
      }));
    } catch (error) {
      console.error("Error fetching game covers:", error);
      return gamesList;
    }
  };

  const fetchUserGames = async () => {
    if (!activeUser) return;
    try {
      const gamesCollectionRef = collection(
        db,
        "users",
        activeUser.uid,
        "gameStatuses"
      );
      const querySnapshot = await getDocs(gamesCollectionRef);
      let gamesList = [];
      querySnapshot.forEach((docSnapshot) => {
        gamesList.push({
          id: docSnapshot.id,
          ...docSnapshot.data(),
        });
      });
      const filteredGames = gamesList.filter(
        (game) =>
          game.status &&
          game.status.toLowerCase() === type.toLowerCase()
      );
      const updatedGames = await fetchGameCovers(filteredGames);
      setGames(updatedGames);
    } catch (error) {
      console.error("Error fetching games:", error);
    }
  };

  useEffect(() => {
    if (activeUser && section === "games") fetchUserGames();
  }, [activeUser, type, section]);

  useEffect(() => {
    if (games.length > 0) {
      setGames((prevGames) =>
        prevGames.map((game) => ({
          ...game,
          name:
            preloadedGames[game.id]?.name || "Unknown Game",
          coverImage:
            preloadedGames[game.id]?.coverImage ||
            "../images/coverFallback.png",
        }))
      );
    }
  }, [preloadedGames]);

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setType(newType);
    navigate(`?section=${section}&type=${newType}`, { replace: true });
  };


  return (
    <div className="min-h-screen">
      <div className="mt-8 w-full">
        {/* Top-level section buttons */}
        <div className="flex w-full border-b-2 border-darkGray">
          {["games", "reviews", "lists"].map((item) => (
            <button
              key={item}
              onClick={() => {
                setSection(item);
                navigate(`?section=${item}&type=${type}`, { replace: true });
              }}
              className={`text-sm font-semibold px-4 py-2 ${section === item
                ? "bg-primaryPurple-500 text-white rounded-t"
                : "hover:bg-primaryPurple-800 text-white rounded-t"
                }`}
            >
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </button>
          ))}
        </div>

        {/* Secondary filters for "games" section */}
        {section === "games" && (
          <>
            <div className="hidden sm:flex mt-8 border-2 rounded border-darkGray">
              {["played", "wishlist", "backlog", "dropped"].map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    setType(category);
                    navigate(`?section=${section}&type=${category}`, { replace: true });
                  }}
                  className={`text-sm font-semibold px-4 py-2 h-10 w-auto
                    ${type === category
                      ? "bg-primaryPurple-500 text-white cursor-default"
                      : "hover:bg-primaryPurple-800"
                    }`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
            <div className="sm:hidden relative ">
              <div className="flex items-center">
                <select
                  id="collectionType"
                  value={type}
                  onChange={handleTypeChange}
                  className="px-2 py-1 mt-2 bg-customBlack border md:border-b-0 text-white md:rounded-t rounded"
                >
                  <option value="played">Played</option>
                  <option value="wishlist">Wishlist</option>
                  <option value="backlog">Backlog</option>
                  <option value="dropped">Dropped</option>
                </select>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="md:mt-8 mt-4">
        {section === "games" && (
          <>
            {loading || games.length > 0 ? (
              <div className="grid xl:grid-cols-7 lg:grid-cols-5 md:grid-cols-5 grid-cols-3 md:gap-4 gap-2">
                {loading
                  ? Array.from({ length: games.length || 8 }).map((_, index) => (
                    <Tilt key={index} options={{ scale: 1.1 }}>
                      <GameCard isLoading={true} />
                    </Tilt>
                  ))
                  : games.map((game) => (
                    <Tilt key={game.id} options={{ scale: 1.1 }}>
                      <GameCard
                        gameId={game.id}
                        src={game.coverImage}
                        alt="../images/coverFallback.png"
                        isLoading={!game.coverImage}
                      />
                    </Tilt>
                  ))}
              </div>
            ) : (
              <div className="w-full h-64 border-2 border-dashed border-darkGray text-center text-sm text-muted-foreground rounded">
                <p className="h-full text-base items-center flex justify-center ">
                  No games found.
                </p>
              </div>
            )}
          </>
        )}

        {section === "reviews" && <ReviewsSection userId={activeUser?.uid} />}
        {section === "lists" && <ListsSection userId={activeUser?.uid} />}
      </div>
    </div>
  );
};

export default Collections;
