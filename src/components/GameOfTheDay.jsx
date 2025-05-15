import { useEffect, useState, useRef } from "react";
import axios from "axios";
import ImageOverlay from "../components/ImageOverlay";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useAuth } from "../useAuth";
import { useNavigate } from "react-router-dom";
import React from "react";
import { slugify } from "../services/slugify.js";
import GameCard from "./GameCard.jsx";

// Helper functions
function getStoredRandomGameId() {
  const stored = localStorage.getItem("dailyRandomGameId");
  if (!stored) return null;
  const parsed = JSON.parse(stored);
  const today = new Date().toISOString().split("T")[0];
  return parsed.date === today ? parsed.id : null;
}

function storeRandomGameId(id) {
  const today = new Date().toISOString().split("T")[0];
  localStorage.setItem("dailyRandomGameId", JSON.stringify({ id, date: today }));
}

async function fetchRandomBacklogGame(user) {
  if (!user) return null;
  try {
    const userGameStatusesRef = collection(db, "users", user.uid, "gameStatuses");
    const backlogQuery = query(userGameStatusesRef, where("status", "==", "Backlog"));
    const querySnapshot = await getDocs(backlogQuery);
    const docs = querySnapshot.docs;
    if (docs.length === 0) return null;
    const randomDoc = docs[Math.floor(Math.random() * docs.length)];
    return { id: randomDoc.id, ...randomDoc.data() };
  } catch (err) {
    console.error("Error fetching backlog game:", err);
    return null;
  }
}

const GameOfTheDay = () => {
  const { user } = useAuth();
  const [gameOfDay, setGameOfDay] = useState(null);
  const [backlogDate, setBacklogDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mainScreenshotIndex, setMainScreenshotIndex] = useState(0);
  const [platforms, setPlatforms] = useState([]);
  const imgRef = useRef(null);
  const navigate = useNavigate();
  const [overlayOpen, setOverlayOpen] = useState(false);

  const detailsFetchedRef = useRef(false);
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
      { id: 1, name: "Nintendo EAD Software Development Group No.2" },
      { id: 2, name: "Nintendo" },
    ],
    logos: {
      url: "https://cdn2.steamgriddb.com/logo/79167346cb707b193dadbd67ab20855e.png",
    },
    genres: [
      { id: 1, name: "Shooter" },
      { id: 2, name: "Platform" },
      { id: 3, name: "Puzzle" },
      { id: 4, name: "Racing" },
    ],
    platforms: [
      { id: 1, name: "Xbox Series X|S" },
      { id: 2, name: "PC (Microsoft Windows)" },
    ],
    summary:
      "Nintendo Land is a fun and lively virtual theme park...",
    totalRating: 76.5,
    rating_count: 12,
    screenshots: [
      "//images.igdb.com/igdb/image/upload/t_1080p/scsoeo.jpg",
      "//images.igdb.com/igdb/image/upload/t_1080p/scsoep.jpg",
    ],
    backlogDate: new Date(),
  };

  useEffect(() => {
    if (useTempData) {
      setGameOfDay(tempGame);
    }
  }, [useTempData]);

  useEffect(() => {
    if (useTempData || !user) return;

    const loadGameOfDay = async () => {
      const storedId = getStoredRandomGameId();
      let selectedGame;

      if (storedId) {
        const userGameRef = doc(db, "users", user.uid, "gameStatuses", storedId);
        const docSnap = await getDoc(userGameRef);
        if (docSnap.exists()) {
          selectedGame = { id: docSnap.id, ...docSnap.data() };
        }
      }

      if (!selectedGame) {
        selectedGame = await fetchRandomBacklogGame(user);
        if (selectedGame) storeRandomGameId(selectedGame.id);
      }

      if (selectedGame) {
        setGameOfDay(selectedGame);
        setBacklogDate(selectedGame.updatedAt?.toDate?.() || null);
      }
    };

    loadGameOfDay();
  }, [user, useTempData]);

  useEffect(() => {
    if (useTempData || !gameOfDay || !gameOfDay.id || detailsFetchedRef.current) return;

    const fetchGameDetails = async () => {
      setLoading(true);
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/games/ids`,
          { ids: [gameOfDay.id] }
        );
        if (response.data?.length) {
          setGameOfDay((prev) => ({
            ...prev,
            ...response.data[0],
          }));
          detailsFetchedRef.current = true;
        }
      } catch (err) {
        console.error("Error fetching game details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGameDetails();
  }, [gameOfDay, useTempData]);

  useEffect(() => {
    if (useTempData || !gameOfDay?.id) return;

    const fetchPlatforms = async () => {
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/platforms`,
          { gameId: gameOfDay.id }
        );
        setPlatforms(response.data);
      } catch (err) {
        console.error("Error fetching platforms:", err);
      }
    };

    fetchPlatforms();
  }, [gameOfDay, useTempData]);


  // if (loading || !gameOfDay) {
  //   return (
  //     <div className="relative pb-8 animate-pulse">
  //       <div className="absolute left-0 inset-0  opacity-40 z-0" />

  //       <h1 className="mb-4 relative text-2xl font-bold z-20 bg-gray-300 h-8 w-64 rounded" />

  //       {/* Hero + fade overlays */}
  //       <div className="absolute top-0 h-full w-full pointer-events-none z-10 right-0" />

  //       <div className="bg-cover bg-center bg-no-repeat relative z-10 flex overflow-y-hidden overflow-x-visible" style={{ height: "18rem" }}>
  //         {/* Left: Box art placeholder */}
  //         <div className="h-full flex-shrink-0 w-[200px] bg-gray-300 rounded" />

  //         {/* Right: text placeholders */}
  //         <div className="flex-shrink px-4 relative w-full">
  //           <div className="space-y-3">
  //             <div className="bg-gray-300 h-6 w-1/2 rounded" />
  //             <div className="bg-gray-300 h-4 w-1/3 rounded" />
  //             <div className="bg-gray-300 h-4 w-2/3 rounded" />
  //             <div className="bg-gray-300 h-4 w-3/4 rounded" />
  //             <div className="bg-gray-300 h-4 w-2/5 rounded" />
  //           </div>

  //           {/* Footer */}
  //           <div className="absolute bottom-2 right-4 flex items-center space-x-2">
  //             <div className="h-3 w-20 bg-gray-600 rounded" />
  //             <div className="h-3 w-16 bg-gray-600 rounded" />
  //           </div>
  //         </div>

  //         {/* Screenshot */}
  //         <div className="flex-shrink-0 h-full hidden xl:block w-[500px] bg-gray-300 rounded ml-4" />

  //         {/* Screenshot thumbnails */}
  //         <div className="h-20 hidden xl:block pl-2">
  //           <div className="flex flex-col gap-2">
  //             {Array(5).fill(0).map((_, index) => (
  //               <div key={index} className="w-[125px] h-20 bg-gray-800 rounded" />
  //             ))}
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  if (loading || !gameOfDay) {
    return (
      <div className="h-[18rem]"> </div>
    );
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
            <a className="mr-2 font-semibold text-2xl leading-tight hover:text-primaryPurple-500 cursor-pointer group"
              href={`/game/${gameOfDay.id}/${slugify(gameOfDay.name)}`}>
              {gameOfDay?.name}{" "}
              <span className="italic font-normal text-gray-300 group-hover:text-primaryPurple-500">
                ({gameOfDay?.releaseYear})
              </span>
            </a>

            {/* Developers */}
            {Array.isArray(gameOfDay?.developers) && gameOfDay?.developers.length > 0 ? (
              gameOfDay.developers.map((developer, index) => (
                <span key={developer.id}>
                  <a
                  href={`/company/${developer.id}/${slugify(developer.name)}`}
                  className="italic font-light hover:font-semibold hover:text-primaryPurple-500 cursor-pointer inline"
                  >
                    {developer.name}
                  </a>
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
                      xmlns="https://www.w3.org/2000/svg"
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
                      <a
                        href={`/genre/${genre.id}/${slugify(genre.name)}`}
                        className="italic font-light hover:font-semibold hover:text-primaryPurple-500 cursor-pointer"
                      >
                        {genre.name}
                      </a>
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
                    <a
                    href={`platform/${platform.id}/${slugify(platform.name)}`}
                      onClick={() => handlePlatformClick(platform.id, platform.name)}
                      className="italic font-light hover:font-semibold hover:text-primaryPurple-500 cursor-pointer"
                    >
                      {platform.name}
                    </a>
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
            <span className="cursor-pointer font-semibold text-primaryPurple-500 hover:font-semibold">
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
