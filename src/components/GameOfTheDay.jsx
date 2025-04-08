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
import GameCard from "./GameCard";
import { useNavigate } from "react-router-dom";
import React from "react";
import DynamicLogo from "./DynamicLogo";

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
    name: "Fragpunk",
    releaseYear: "2024",
    heroes: {
      url: "https://cdn2.steamgriddb.com/hero/3bd7875f994b1dd763d668f8d4816575.png",
    },
    coverUrl: "//images.igdb.com/igdb/image/upload/t_720p/co9gmx.jpg",
    logos: {
      url: "https://cdn2.steamgriddb.com/logo/79167346cb707b193dadbd67ab20855e.png",
    },
    genres: ["Shooter"],
    platforms: ["Xbox Series X|S", "PC (Microsoft Windows)", "PlayStation 5"],
    summary:
      "FragPunk is the new free-to-play 5v5 hero shooter poised to break the rules of combat. What makes FragPunk different is the introduction of Shard Cards that can affect the playing field for all players...",
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
        console.log("Fetched Game Data:", gameResponse.data);
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

  const navigateToGamePage = () => {
    if (!gameOfDay || !gameOfDay.id) {
      console.log("Random game is still loading...");
      return;
    }
    navigate(`/game/${gameOfDay.id}`);
  };

  if (loading) {
    return <div>Loading game data...</div>;
  }


  return (
    <div className="relative">
      <div>
        {gameOfDay?.heroes && (
          <div
            className="absolute inset-0 bg-cover z-0 bg-center bg-no-repeat opacity-70"
            style={{ backgroundImage: `url(${gameOfDay.heroes.url})` }}
          />
        )}
        <h1 className="relative text-2xl font-bold pb-4 z-20">
        Backlog Spotlight
        </h1>

        <div
          className="absolute top-0 h-full w-[103%] pointer-events-none z-10 right-0"
          style={{
            background: "linear-gradient(to left, #121212 0%, transparent 65%)",
          }}
        ></div>
        <div
          className="absolute top-0 -mt-[1px] h-full w-[101%] pointer-events-none z-10 left-50"
          style={{
            background:
              "linear-gradient(to right, #121212 50%, transparent 65%)",
          }}
        ></div>
        <div
          className="absolute top-0 h-[50vh] w-[101%] pointer-events-none z-10"
          style={{
            background:
              "linear-gradient(to bottom, #121212 0%, transparent 15%)",
          }}
        ></div>
        <div
          className="absolute bottom-0 -mb-[1px] h-[50vh] w-[101%] pointer-events-none z-10"
          style={{
            background: "linear-gradient(to top,#121212 0%, transparent 15%)",
          }}
        ></div>
      </div>

      <div className="bg-cover bg-center bg-no-repeat relative z-10 pb-10">
        <div className="grid lg:grid-cols-[20%_40%_auto] md:grid-cols-[40%_auto] sm:grid-rows-[auto_auto] z-10">
          <div className="relative z-50 flex items-center hidden sm:hidden md:block lg:block">
            {gameOfDay?.coverUrl && (
              <div>
                <GameCard
                  ref={imgRef}
                  src={gameOfDay.coverUrl}
                  alt={`${gameOfDay.name} Logo`}
                  gameId={gameOfDay.id}
                  className="object-contain h-auto sm:h-96 rounded"
                />
              </div>
            )}
          </div>

          <div className="flex flex-col ml-2 rounded bg-customGray-900/50 p-2 relative">
            <div>
              {gameOfDay?.logos ? (
                <DynamicLogo
                url={gameOfDay.logos.url}
                gameName={gameOfDay.name}
                maxSize={"w-[50%]"}
                minSize={"w-[35%]"}
                marginLeft={"ml-0"}
                />
              ) : (
                <h1 className="font-semibold text-2xl">
                  {gameOfDay?.name}{" "}
                  <span className="italic">({gameOfDay?.releaseYear})</span>
                </h1>
              )}
            </div>

            <div className="flex pt-4 pb-2">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <svg
                    key={i}
                    className={`h-6 w-6 ${
                      i < Math.round(gameOfDay?.totalRating / 20)
                        ? "text-yellow-400"
                        : "text-gray-300"
                    } fill-current`}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2l2.7 8H22l-6.9 5 2.7 8L12 18l-6.9 5 2.7-8L2 10h7.3L12 2z" />
                  </svg>
                ))}
              <div className="text-sm italic text-gray-500 mt-auto pl-1">
                {gameOfDay?.totalRating
                  ? `(${(gameOfDay.totalRating /20).toFixed(1)}/5)`
                  : "No ratings available"}
              </div>
            </div>

            <p className="pt-2 text">
              {gameOfDay?.genres?.length > 0
                ? gameOfDay.genres.join(", ")
                : "No genres available"}
            </p>

            <p className="font-light">
              {gameOfDay?.platforms?.length > 0
                ? gameOfDay.platforms.join(", ")
                : "No platforms available"}
            </p>

            {gameOfDay?.summary ? (
              <p className="font-light pt-2 line-clamp-6 mr-20 pb-4">
                {gameOfDay.summary}
              </p>
            ) : (
              <p className="font-light">No summary available</p>
            )}

            <div className=" font-light text-xs text-right pt-2 absolute bottom-2 right-2">
              Added to backlog:{" "}
              <span className="italic">
                {backlogDate?.toLocaleDateString()}
              </span>
              <span className="mt-auto ml-4 cursor-pointer font-semibold text-primaryPurple-500">
                Remove Title
              </span>
              
            </div>


            
          </div>
          
          <div className="flex flex-col pl-2 h-full hidden md:hidden lg:block">
            {/* Screenshots and other UI elements */}
            <div className="relative h-full overflow-hidden">
              <div className="flex flex-col h-full">
                {/* Main Screenshot Container */}
                <div className="flex-1 relative rounded aspect-video overflow-hidden flex justify-center items-center">
                   {/* Background layer (blurred) */}
                   <img
                    src={gameOfDay?.screenshots?.[mainScreenshotIndex]}
                    alt=""
                      className="absolute inset-0 w-full h-full object-cover blur-md scale-110 opacity-50"
                      aria-hidden="true"
                    />
                  {/* Foreground image */}
                  <img
                    src={gameOfDay?.screenshots?.[mainScreenshotIndex]}
                    alt="Game Screenshot"
                      className="relative w-full h-full object-contain"
                      onClick={() => setOverlayOpen(true)}
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
                <div className="h-20 relative mt-2">
                  <div className="flex items-center h-full gap-2">
                    {gameOfDay?.screenshots?.slice(0, 5).map((url, index) => (
                      <img
                        key={index}
                        src={url}
                        onClick={(e) => {
                          e.stopPropagation()
                          setMainScreenshotIndex(index)
                        }}
                        className={`h-full object-contain rounded cursor-pointer transition-opacity duration-300 ${
                          mainScreenshotIndex === index
                            ? "brightness-100"
                            : "brightness-50 hover:brightness-100"
                        }`}
                        alt={`Screenshot ${index}`}
                      />
                    ))}
                  </div>
                  {/* Optional gradient overlay */}
                  <div
                    className="absolute top-0 h-full w-full pointer-events-none z-10"
                    style={{
                      background:
                        "linear-gradient(to left, #121212 0%, transparent 10%)",
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameOfTheDay;
