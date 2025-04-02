import Header from "../components/Header";
import HorizontalLine from "../components/HorizontalLine";
import TrendingGames from "../components/TrendingGames";
import Event from "../components/Events";
import Footer from "../components/Footer";
import CenterMode from "../components/CenterMode";
import {
  fetchTrendingGames,
  fetchEvents,
  fetchScreenshotsCached,
} from "../services/helperFunctions";
import { useEffect, useState, useRef } from "react";
import {
  collection,
  query,
  where,
  doc,
  getDoc,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebaseConfig"; // Your Firebase config file
import { useAuth } from "../useAuth";
import GameCard from "../components/GameCard";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Tilt } from "react-tilt";

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

  if (parsed.dateString === today) {
    return parsed.game;
  } else {
    return null;
  }
}


function storeRandomGame(game) {
  const today = new Date().toISOString().split("T")[0];
  const payload = { game, dateString: today };
  localStorage.setItem("dailyRandomGame", JSON.stringify(payload));
}

const HomePage = () => {
  const { user } = useAuth();
  const [backlogGames, setBacklogGames] = useState([]);
  const [trendingGames, setTrendingGames] = useState([]);
  const [currentEvents, setEvents] = useState([]);
  const [randomGame, setRandomGame] = useState(null);
  const [randomGameDetails, setGameDetails] = useState(null);
  const [screenshots, setScreenshots] = useState([]); // Store artworks separately
  const [loading, setLoading] = useState(true); // Tracks if data is being fetched
  const [heroes, setHeroes] = useState([]); // Store heroes
  const [logos, setLogos] = useState([]); // Store SteamGridDB logos
  const imgRef = useRef(null);
  const [imgHeight, setImgHeight] = useState(0);
  const [backlogDate, setBacklogDate] = useState(null);
  const [platforms, setPlatforms] = useState([]);
  const [recommendedGames, setRecommendedGames] = useState([]);
  
  useEffect(() => {
    const loadRecommendations = async () => {
      // Example array of IDs
      const gameIds = [7346, 1020, 1234, 4567, 7890];
  
      try {
        // Send all IDs together in one request
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/games/ids`, {
          ids: gameIds,
        });
  
        console.log("Recommended games:", response.data);
        setRecommendedGames(response.data);
      } catch (err) {
        console.error("Error loading recommended games:", err.message);
      }
    };
  
    loadRecommendations();
  }, []);
  
  // Fetch random game for the days platforms
  useEffect(() => {
    const fetchPlatforms = async () => {
      if (!randomGame || !randomGame.id) return;
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/platforms`,
          {
            gameId: randomGame.id,
          }
        );
        setPlatforms(response.data);
      } catch (error) {
        console.error("Error fetching platforms:", error);
      }
    };

    fetchPlatforms();
  }, [randomGame]);

  // Fetch trending games and events
  useEffect(() => {
    const fetchGames = async () => {
      try {
        const trendingData = await fetchTrendingGames(6);
        const currentEvents = await fetchEvents(4);
        setTrendingGames(Array.isArray(trendingData) ? trendingData : []);
        setEvents(Array.isArray(currentEvents) ? currentEvents : []);
      } catch (error) {
        console.error("Error fetching trending games/events:", error);
        setTrendingGames([]);
        setEvents([]);
      }
    };

    fetchGames();
  }, []);

  // Fetch the users backlog
  useEffect(() => {
    async function getData() {
      if (user) {
        const games = await fetchBacklogGames(user);
        setBacklogGames(games);
      }
    }
    getData();
  }, [user]);

  // Check local storage if theres already a random game for today
  // If none, or old date, select a new game
  // Store in local storage
  useEffect(() => {
    if (backlogGames.length > 0) {
      // Checking local storage
      const storedGame = getStoredRandomGame();
      if (storedGame) {
        // If we already have a random game
        setRandomGame(storedGame);
      } else {
        // Selecting a new random game
        const randomIndex = Math.floor(Math.random() * backlogGames.length);
        const selectedGame = backlogGames[randomIndex];

        //Update state and store in local storage
        setRandomGame(selectedGame);
        storeRandomGame(selectedGame);
      }
    }
  }, [backlogGames]);

  //Fetch the details of the random game
  useEffect(() => {
    if (!randomGame || !randomGame.id) return;

    fetchGameData();
  }, [randomGame]);

  // Fetch date backlog game was added
  useEffect(() => {
    const fetchAddedDate = async () => {
      if (!user) return;
      if (!randomGame || !randomGame.id) return;

      try {
        const userGameRef = doc(
          db,
          "users",
          user.uid,
          "gameStatuses",
          randomGame.id
        );
        const docSnap = await getDoc(userGameRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.updatedAt) {
            // Convert Firestore Timestamp to JS Date object
            setBacklogDate(data.updatedAt.toDate());
          } else {
            setBacklogDate(null);
          }
        } else {
          setBacklogDate(null);
        }
      } catch (error) {
        console.error("Error fetching game added date:", error);
      }
    };

    fetchAddedDate();
  }, [user, randomGame?.id]);

  // Fetch details of backlog game of the day
  const fetchGameData = async () => {
    if (!randomGame?.id) return;

    setLoading(true);

    try {
      const gameResponse = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/game`,
        {
          id: randomGame.id,
        }
      );

      setGameDetails(gameResponse.data);

      // Fetch screenshots using the cached function
      const sortedScreenshots = await fetchScreenshotsCached(randomGame.id);

      // Fetch heroes and logos (keeping your current logic)
      let heroesResponse = { data: { heroes: [] } };
      let logosResponse = { data: { logos: [] } };

      try {
        heroesResponse = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/steamgriddb/heroes`,
          { gameName: gameResponse.data.name }
        );
      } catch (err) {
        console.warn("Error fetching heroes:", err.message);
      }

      try {
        logosResponse = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/steamgriddb/logos`,
          { gameName: gameResponse.data.name }
        );
      } catch (err) {
        console.warn("Error fetching logos:", err.message);
      }

      // Update states
      setScreenshots(sortedScreenshots);
      setHeroes(
        Array.isArray(heroesResponse.data.heroes)
          ? heroesResponse.data.heroes
          : []
      );
      setLogos(
        Array.isArray(logosResponse.data.logos) ? logosResponse.data.logos : []
      );
    } catch (err) {
      console.error("Error fetching game data:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const navigate = useNavigate();

  const navigateToGamePage = () => {
    if (!randomGame || !randomGame.id) {
      console.log("Random game is still loading...");
      return;
    }

    navigate(`/game/${randomGame.id}`);
  };
  const {
    name,
    summary,
    genres,
    cover,
    releaseYear,
    involvedCompanies,
    developerLogo,
  } = randomGameDetails ?? {};

  useEffect(() => {
    const updateHeight = () => {
      if (imgRef.current) {
        setImgHeight(imgRef.current.clientHeight);
      }
    };

    // Initial measurement
    updateHeight();

    // Update on window resize
    window.addEventListener("resize", updateHeight);

    return () => {
      window.removeEventListener("resize", updateHeight);
    };
  }, [cover]);

  return (
    <div>
      <div className="mx-[5%]">
        <Header
          showSearchBar={true}
          showNavButtons={true}
          showLoginButtons={true}
          zIndex={1000}
        />

        <div className="mx-[10%]">
          <div className="flex justify-between mt-28">
            <div>
              <h1 className="text-4xl font-bold">Hello Name, Welcome Back!</h1>
              <p className="font-light text-lg pt-2">
                Discover trending games, track your progress,
                <br />
                and explore your collection
              </p>
            </div>

            <div>Second Section</div>
          </div>

          <HorizontalLine width="full" marginBottom="0" marginTop="mt-28" />

          <div>
            <h1 className="text-2xl font-bold py-4">Currently Trending</h1>
            <TrendingGames slides={trendingGames} />
          </div>

          <HorizontalLine width="full" marginBottom="mb-4" marginTop="mt-4" />

          <div className=" relative ">
            {/* Background Image */}
            {screenshots?.[0] && (
              <div
                className="absolute inset-0 bg-cover z-0 bg-center bg-no-repeat opacity-70"
                style={{ backgroundImage: `url(${screenshots[0].imageUrl})` }}
              />
            )}
            <h1 className="relative text-2xl font-bold pb-4 z-20">
              Your Backlog Game of the Day
            </h1>

            {/* Right Gradient */}
            <div
              className="absolute top-0 h-full w-[103%] pointer-events-none z-10 right-0"
              style={{
                background:
                  "linear-gradient(to left, #121212 5%, transparent 50%)",
              }}
            ></div>

            {/* Left Gradient */}
            <div
              className="absolute top-0 h-full w-[101%] pointer-events-none z-10 left-50"
              style={{
                background:
                  "linear-gradient(to right, #121212 50%, transparent 70%)",
              }}
            ></div>

            {/* Top Gradient */}
            <div
              className="absolute top-0 h-[50vh] w-[101%] pointer-events-none z-10"
              style={{
                background:
                  "linear-gradient(to bottom, #121212 0%, transparent 20%)",
              }}
            ></div>

            {/* Bottom Gradient */}
            <div
              className="absolute bottom-0 h-[50vh] w-[101%] pointer-events-none z-10"
              style={{
                background:
                  "linear-gradient(to top,#121212 0%, transparent 20%)",
              }}
            ></div>

            <div className="bg-cover bg-center bg-no-repeat relative z-10 pb-10">
              <div
                className="grid grid-cols-[20%_40%_auto] z-10"
                style={{ height: imgHeight || "auto" }}
              >
                <div className="relative z-50">
                  {cover && (
                    <GameCard
                      ref={imgRef}
                      onLoad={() => setImgHeight(imgRef.current.clientHeight)}
                      src={`https://images.igdb.com/igdb/image/upload/t_1080p/${cover.image_id}.jpg`}
                      alt={`${name} Logo`}
                      gameId={randomGame.id}
                      className="object-contain h-[auto] rounded"
                    />
                  )}
                </div>

                <div
                  className="flex flex-col pl-6 "
                  style={{ height: imgHeight }}
                >
                  <div className="h-[75%] overflow-hidden">
                    <h1 className="font-semibold text-2xl">
                      {name} <span className="italic">({releaseYear})</span>
                    </h1>

                    {involvedCompanies &&
                      (() => {
                        const mainDeveloper = involvedCompanies.find(
                          (c) => c.developer
                        );
                        if (!mainDeveloper) return null;
                        return (
                          <ul className="italic font-light text-xl text-left">
                            <li
                              key={mainDeveloper.company.id}
                              className="text-left"
                            >
                              <button
                                className="italic hover:underline hover:text-primaryPurple-500 text-left inline-block whitespace-normal"
                                onClick={() =>
                                  handleDeveloperClick(mainDeveloper.company.id)
                                }
                              >
                                {mainDeveloper.company.name}
                              </button>
                            </li>
                          </ul>
                        );
                      })()}

                    <p className="pt-2 text-lg font-light ">
                      {genres?.length > 0
                        ? genres.map((genre) => genre.name).join(", ")
                        : "No genres available"}
                    </p>

                    <p className=" font-light text-lg">
                      {platforms?.length > 0
                        ? platforms.map((platform) => platform.name).join(", ")
                        : "No genres available"}
                    </p>

                    {/* {platforms?.length > 0 && (
                      <div className="gap-2 w-auto">
                        {platforms.map((platform, index) => (
                          <img
                            key={index}
                            src={platform.platformIcon}
                            alt={`${platform.name} icon`}
                            className="w-auto h-auto rounded shadow-md transition duration-300 group-hover:brightness-50"
                          />
                        ))}
                      </div>
                    )} */}

                    <p className="pt-4 pr-2 text-xl font-light overflow-hidden text-ellipsis line-clamp-5 text-md max-w-[100%]">
                      {summary}
                    </p>
                  </div>

                  <div className="h-auto flex mt-auto">
                    <div className="mt-auto font-light text-xs hidden lg:block">
                      Added to backlog:{" "}
                      <span className="italic">
                        {backlogDate?.toLocaleDateString()}
                      </span>
                      <span className="mt-auto ml-4 cursor-pointer font-semibold text-primaryPurple-500">
                        Remove Title
                      </span>
                    </div>

                    {/* <div className="flex ml-auto">
                      <button
                        onClick={navigateToGamePage}
                        className="bg-primaryPurple-500 rounded-lg w-24 h-6 "
                      >
                        See More
                      </button>
                    </div> */}
                  </div>
                </div>

                <div
                  className="flex flex-col pl-2"
                  style={{ height: imgHeight }}
                >
                  <div className="relative h-[80%] overflow-hidden">
                    {screenshots?.[0] && (
                      <img
                        src={screenshots[0].imageUrl}
                        alt={`${name} Screenshot`}
                        className="absolute inset-0 pb-2 w-full h-full object-cover object-center rounded"
                      />
                    )}
                  </div>

                  <div className=" flex h-[20%] w-full justify-between mt-auto ">
                    {screenshots?.[0] && (
                      <div className="pr-2">
                        <img
                          src={screenshots[0].imageUrl}
                          alt={`${name} Screenshot`}
                          className="rounded cursor-pointer border-2"
                        />
                      </div>
                    )}
                    {screenshots?.[1] && (
                      <div className="pr-2">
                        <img
                          src={screenshots[1].imageUrl}
                          alt={`${name} Screenshot`}
                          className="rounded cursor-pointer"
                        />
                      </div>
                    )}
                    {screenshots?.[2] && (
                      <div className="pr-2">
                        <img
                          src={screenshots[2].imageUrl}
                          alt={`${name} Screenshot`}
                          className=" rounded cursor-pointer"
                        />
                      </div>
                    )}
                    {screenshots?.[3] && (
                      <div className="relative group cursor-pointer">
                        <img
                          src={screenshots[3].imageUrl}
                          alt={`${name} Screenshot`}
                          className="rounded rounded cursor-pointer"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <HorizontalLine width="full" marginBottom="mb-4" marginTop="mt-4" />

          <div className="min-h-[200px] flex justify-center items-center border border-4 rounded-lg border-dashed border-darkGray">
            <p className="font-bold">
              No reviews found.{" "}
              <a className="text-primaryPurple-500 cursor-pointer">
                {" "}
                Add a review{" "}
              </a>
            </p>
          </div>

          <HorizontalLine width="full" marginBottom="mb-4" marginTop="mt-4" />

          <h1 className="relative text-2xl font-bold pb-4 z-20">Events</h1>
          <Event events={currentEvents} />

          <HorizontalLine width="full" marginBottom="mb-4" marginTop="mt-4" />

          <div className="w-full">
            <h1 className="relative text-2xl font-bold pb-4 z-20">Discover</h1>
            <p className="font-light text-lg ">
              View handpicked titles based on your interests, and explore your collection
            </p>

            <CenterMode games={recommendedGames} />
            
          </div>

          <HorizontalLine width="full" marginBottom="mb-4" marginTop="mt-4" />
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default HomePage;
