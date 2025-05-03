import { useEffect, useState, useRef } from "react";
import axios from "axios";
import ImageOverlay from "../components/ImageOverlay";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useAuth } from "../useAuth";
import { useNavigate } from "react-router-dom";
import React from "react";
import { slugify } from "../services/slugify.js";
import GameCard from "./GameCard.jsx";

// Helper functions…
async function fetchBacklogGames(user) {
  if (!user) {
    console.error("User is not logged in or user object not available");
    return [];
  }
  try {
    const userGameStatusesRef = collection(
      db,
      "users",
      user.uid,
      "gameStatuses"
    );
    const backlogQuery = query(
      userGameStatusesRef,
      where("status", "==", "Backlog")
    );
    const querySnapshot = await getDocs(backlogQuery);
    const backlogGames = [];
    querySnapshot.forEach((docSnapshot) => {
      backlogGames.push({ id: docSnapshot.id, ...docSnapshot.data() });
    });
    return backlogGames;
  } catch (error) {
    console.error("Error fetching backlog games:", error);
    return [];
  }
}

function getStoredRandomGame() {
  const stored = localStorage.getItem("dailyRandomGame");
  if (!stored) return null;
  const parsed = JSON.parse(stored);
  const today = new Date().toISOString().split("T")[0];
  return parsed.dateString === today ? parsed.game : null;
}

function storeRandomGame(game) {
  const today = new Date().toISOString().split("T")[0];
  const payload = { game, dateString: today };
  localStorage.setItem("dailyRandomGame", JSON.stringify(payload));
}

const defaultOptions = {
  reverse: false,
  max: 20,
  perspective: 1000,
  scale: 1.05,
  speed: 500,
  transition: true,
  axis: null,
  reset: true,
  easing: "cubic-bezier(.03,.98,.52,.99)",
};

const GameOfTheDay = () => {
  const { user } = useAuth();
  const [backlogGames, setBacklogGames] = useState([]);
  const [gameOfDay, setGameOfDay] = useState(null);
  const [platforms, setPlatforms] = useState([]);
  const [backlogDate, setBacklogDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mainScreenshotIndex, setMainScreenshotIndex] = useState(0);
  const [detailsFetched, setDetailsFetched] = useState(false);
  const imgRef = useRef(null);
  const navigate = useNavigate();
  const [overlayOpen, setOverlayOpen] = useState(false);

  // Flag to control use of temporary data
  const useTempData = false;

  const tempGame = {
    id: 1,
    name: "Nintendo Land",
    releaseYear: "2012",
    heroes: {
      url: "https://cdn2.steamgriddb.com/hero/3bd7875f994b1dd763d668f8d4816575.png",
    },
    coverUrl: "https://images.igdb.com/igdb/image/upload/t_1080p/co1p9c.jpg",
    developers: [
      "Nintendo EAD Software Development Group No.2",
      "Nintendo",
      "Nintendo"
    ],
    logos: {
      url: "https://cdn2.steamgriddb.com/logo/79167346cb707b193dadbd67ab20855e.png",
    },
    genres: ["Shooter, Platform, Puzzle, Racing, Adventure, Arcade"],
    platforms: ["Xbox Series X|S", "PC (Microsoft Windows)", "PlayStation 5"],
    summary:
      "Nintendo Land is a fun and lively virtual theme park filled with attractions based on popular Nintendo game worlds. Explore the Nintendo Land Plaza as your Mii character, and play in park attractions featuring unique and innovative gameplay made possible by the Wii U GamePad controller. Enjoy team, competitive, and solo gameplay experiences for up to five players!",
    totalRating: 76.5,
    rating_count: 12,
    screenshots: [
      "//images.igdb.com/igdb/image/upload/t_1080p/scsoeo.jpg",
      "//images.igdb.com/igdb/image/upload/t_1080p/scsoep.jpg",
      "//images.igdb.com/igdb/image/upload/t_1080p/scsoer.jpg",
      "//images.igdb.com/igdb/image/upload/t_1080p/scsoes.jpg",
      "//images.igdb.com/igdb/image/upload/t_1080p/scsoeq.jpg",
    ],
    backlogDate: new Date(), // Temporary backlog date for testing
  };

  // When using temporary data, immediately set gameOfDay to tempGame.
  useEffect(() => {
    if (useTempData) {
      setGameOfDay(tempGame);
    }
  }, [useTempData]);

  // Only run the fetch calls if not using temporary data.
  useEffect(() => {
    if (useTempData) return;
    async function getData() {
      if (user) {
        const games = await fetchBacklogGames(user);
        setBacklogGames(games);
      }
    }
    getData();
  }, [user, useTempData]);

  useEffect(() => {
    if (useTempData) return;
    if (backlogGames.length > 0) {
      const storedGame = getStoredRandomGame();
      if (storedGame) {
        setGameOfDay(storedGame);
      } else {
        const randomIndex = Math.floor(Math.random() * backlogGames.length);
        const selectedGame = backlogGames[randomIndex];
        setGameOfDay(selectedGame);
        storeRandomGame(selectedGame);
      }
    }
  }, [backlogGames, useTempData]);

  useEffect(() => {
    if (useTempData) return;
    if (!gameOfDay || !gameOfDay.id || detailsFetched) return;

    const fetchGameData = async () => {
      setLoading(true);
      try {
        const gameResponse = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/games/ids`,
          { ids: [gameOfDay.id] }
        );

        setGameOfDay(gameResponse.data[0]);

        setDetailsFetched(true);
      } catch (err) {
        console.error("Error fetching game data:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGameData();
  }, [gameOfDay, detailsFetched, useTempData]);

  useEffect(() => {
    if (useTempData) return;
    const fetchPlatforms = async () => {
      if (!gameOfDay || !gameOfDay.id) return;
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/platforms`,
          { gameId: gameOfDay.id }
        );
        setPlatforms(response.data);
      } catch (error) {
        console.error("Error fetching platforms:", error);
      }
    };
    fetchPlatforms();
  }, [gameOfDay, useTempData]);

  useEffect(() => {
    if (useTempData) return;
    const fetchAddedDate = async () => {
      if (!user || !gameOfDay || !gameOfDay.id) return;
      try {
        const userGameRef = doc(
          db,
          "users",
          user.uid,
          "gameStatuses",
          String(gameOfDay.id)
        );
        const docSnap = await getDoc(userGameRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setBacklogDate(data.updatedAt ? data.updatedAt.toDate() : null);
        } else {
          setBacklogDate(null);
        }
      } catch (error) {
        console.error("Error fetching game added date:", error);
      }
    };
    fetchAddedDate();
  }, [user, gameOfDay, useTempData]);

  const navigateToGamePage = (gameId, gameName) => {
    const slug = slugify(gameName);
    navigate(`/game/${gameOfDay.id}/${gameOfDay.name}`);
  };

  const handleDeveloperClick = (developerId, developerName) => {
    const slug = slugify(developerName);
    navigate(`/company/${developerId}/${slug}`);
  }

  const handleGenreClick = (genreId, genreName) => {
    const slug = slugify(genreName);
    navigate(`/genre/${genreId}/${slug}`);
  }

  const handlePlatformClick = (platformId, platformName) => {
    const slug = slugify(platformName);
    navigate(`/platform/${platformId}/${slug}`);
  }

  if (loading) {
    return <div>Loading game data...</div>;
  }

  return (
    <div className="relative pb-8">
      {/* Gradient and background image */}
      <div>
        {gameOfDay?.heroes && (
          <div
            className="absolute left-0 inset-0 bg-cover z-0 bg-center bg-no-repeat opacity-50"
            style={{ backgroundImage: `url(${gameOfDay.heroes.url})` }}
          />
        )}
        <h1 className="mb-4 relative text-2xl font-bold z-20">
          Backlog Spotlight
        </h1>

        <div
          className="absolute top-0 h-full w-[103%] pointer-events-none z-10 right-0"
          style={{
            background: "linear-gradient(to left, #121212 2%, transparent 80%)",
          }}
        ></div>
        <div
          className="absolute top-0 -mt-[1px] h-full w-[101%] pointer-events-none z-10 left-50"
          style={{
            background:
              "linear-gradient(to right,rgba(18, 18, 18) 5%, transparent 100%)",
          }}
        ></div>
        <div
          className="absolute top-0 h-[50vh] -mt-[1px] w-[101%] pointer-events-none z-10"
          style={{
            background:
              "linear-gradient(to bottom, #121212 1%, transparent 50%)",
          }}
        ></div>
        <div
          className="absolute bottom-0 -mb-[1px] h-[50vh] w-[101%] pointer-events-none z-10"
          style={{
            background: "linear-gradient(to top,#121212 1%, transparent 50%)",
          }}
        ></div>
      </div>

      {/* Foreground */}
      <div className="bg-cover bg-center bg-no-repeat relative z-10 flex overflow-y-hidden overflow-x-visible" style={{ height: "18rem" }}>
        {/* Left: Image container that grows based on image aspect ratio */}
        <div className="h-full flex-shrink-0">
          <GameCard 
            src={gameOfDay?.coverUrl}
            alt={`Cover image of ${gameOfDay?.name}`}
            className="h-full object-contain rounded"
            gameId={gameOfDay?.id}
          />
        </div>

        {/* Right: Text/content container that shrinks if needed */}
        <div className="flex-shrink overflow-hidden px-4 relative">
          <div className="space-y-3">

            {/* Game Name + Release Year */}
            <p className="font-semibold text-2xl leading-tight hover:text-primaryPurple-500 cursor-pointer group"
              onClick={() => navigateToGamePage(gameOfDay.id, gameOfDay.name)}>
              {gameOfDay?.name}{" "}
              <span className="italic font-normal text-gray-300 group-hover:text-primaryPurple-500">
                ({gameOfDay?.releaseYear})
              </span>
            </p>

            {/* Developers */}
            {Array.isArray(gameOfDay?.developers) && gameOfDay?.developers.length > 0 ? (
              gameOfDay.developers.map((developer, index) => (
                <span key={developer.id}>
                  <span
                    onClick={() => handleDeveloperClick(developer.id, developer.name)}
                    className="italic font-light hover:underline hover:text-primaryPurple-500 cursor-pointer inline"
                  >
                    {developer.name}
                  </span>
                  {index < developer.length - 1 && ", "}
                </span>
              ))
            ) : (
              <span className="italic font-light">Unknown Developers</span>
            )}


            {/* Rating + Genres */}
            <div className="flex items-center ">
              <div className="flex items-center">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <svg
                      key={i}
                      className={`h-5 w-5 ${i < Math.round(gameOfDay?.totalRating / 20)
                        ? "text-yellow-400"
                        : "text-gray-500"
                        } fill-current`}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2l2.7 8H22l-6.9 5 2.7 8L12 18l-6.9 5 2.7-8L2 10h7.3L12 2z" />
                    </svg>
                  ))}
                <span className="pt-[1px] text-sm italic text-gray-400">
                  {gameOfDay?.totalRating
                    ? `(${(gameOfDay.totalRating / 20).toFixed(1)})`
                    : "No ratings available"}
                </span>
              </div>

              <div className="pl-2 whitespace-nowrap overflow-hidden text-ellipsis">
                {Array.isArray(gameOfDay?.genres) && gameOfDay.genres.length > 0 ? (
                  gameOfDay.genres.map((genre, index) => (
                    <span key={genre.id}>
                      <span
                        onClick={() => handleGenreClick(genre.id, genre.name)}
                        className="italic font-light hover:underline hover:text-primaryPurple-500 cursor-pointer"
                      >
                        {genre.name}
                      </span>
                      {index < gameOfDay.genres.length - 1 && ", "}
                    </span>
                  ))
                ) : (
                  <span className="italic font-light">Unknown Genres</span>
                )}
              </div>
            </div>


            {/* Summary */}
            <p className="text-med font-light text-gray-100 line-clamp-3">
              {gameOfDay?.summary || "No summary available"}
            </p>

            {/* Platforms */}
            <div className="pt-2">
            {Array.isArray(gameOfDay?.platforms) && gameOfDay?.platforms.length > 0 ? (
              gameOfDay.platforms.map((platform, index) => (
                <span key={platform.id}>
                  <span
                    onClick={() => handlePlatformClick(platform.id, platform.name)}
                    className="italic font-light hover:underline hover:text-primaryPurple-500 cursor-pointer"
                    >
                    {platform.name}
                  </span>
                  {index < gameOfDay.platforms.length - 1 && ", "}
                </span>
              ))
            ) : (
              <span className="italic font-light">Unknown Developers</span>
            )}
            </div>
          </div>

          {/* Footer */}
          <div className="text-xs text-gray-400 font-light absolute bottom-2 right-4 flex items-center space-x-2">
            <span>Added: <span className="italic">{backlogDate?.toLocaleDateString()}</span></span>
            <span className="cursor-pointer font-semibold text-primaryPurple-500 hover:underline">
              Remove Title
            </span>
          </div>
        </div>


        <div className="flex-shrink-0 h-full hidden xl:block">
          <img
            src={gameOfDay?.screenshots?.[mainScreenshotIndex]}
            alt="Game Screenshot"
            className="relative h-[18rem] cursor-pointer rounded"
            onClick={() =>
              setOverlayOpen(true)}
          />

          {/* Conditionally render the overlay */}
          {overlayOpen && (
            <ImageOverlay
              src={gameOfDay?.screenshots?.[mainScreenshotIndex]}
              alt={`Screenshot of ${name}`}
              onClose={() => setOverlayOpen(false)}
            />
          )}
        </div>

        {/* Thumbnails Container */}
        <div className="h-20 relative hidden xl:block">
          <div className="flex-shrink-0 h-auto flex flex-col gap-2 pl-2 overflow-y-auto">
            {gameOfDay?.screenshots?.slice(0, 5).map((url, index) => (
              <img
                key={index}
                src={url}
                onClick={(e) => {
                  e.stopPropagation()
                  setMainScreenshotIndex(index)
                }}
                className={`w-[400px] object-contain rounded cursor-pointer transition-opacity duration-300 ${mainScreenshotIndex === index
                  ? "brightness-100"
                  : "brightness-50 hover:brightness-100"
                  }`}
                alt={`Screenshot ${index}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameOfTheDay;
