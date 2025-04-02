import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useAuth } from "../useAuth";
import GameCard from "./GameCard";
import { useNavigate } from "react-router-dom";

// Helper functions...
async function fetchBacklogGames(user) {
  if (!user) {
    console.error("User is not logged in or user object not available");
    return [];
  }
  try {
    const userGameStatusesRef = collection(db, "users", user.uid, "gameStatuses");
    const backlogQuery = query(userGameStatusesRef, where("status", "==", "Backlog"));
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
  const [imgHeight, setImgHeight] = useState(0);
  const [platforms, setPlatforms] = useState([]);
  const [backlogDate, setBacklogDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [detailsFetched, setDetailsFetched] = useState(false);
  const imgRef = useRef(null);
  const navigate = useNavigate();

  // Fetch backlog games for the user
  useEffect(() => {
    async function getData() {
      if (user) {
        const games = await fetchBacklogGames(user);
        setBacklogGames(games);
      }
    }
    getData();
  }, [user]);

  // Select game of the day from backlog or from local storage
  useEffect(() => {
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
  }, [backlogGames]);

  // Fetch detailed game data (only once per selected game)
  useEffect(() => {
    if (!gameOfDay || !gameOfDay.id || detailsFetched) return;

    const fetchGameData = async () => {
      setLoading(true);
      try {
        const gameResponse = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/games/ids`,
          { ids: [gameOfDay.id] }
        );
        console.log("Fetched Game Data:", gameResponse.data);
        // Set gameOfDay to the detailed data (first element if array)
        setGameOfDay(gameResponse.data[0]);
        setDetailsFetched(true);
      } catch (err) {
        console.error("Error fetching game data:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGameData();
  }, [gameOfDay, detailsFetched]);

  // Fetch additional data (platforms, backlog date)
  useEffect(() => {
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
  }, [gameOfDay]);

  useEffect(() => {
    const fetchAddedDate = async () => {
      if (!user || !gameOfDay || !gameOfDay.id) return;
      try {
        const userGameRef = doc(db, "users", user.uid, "gameStatuses", String(gameOfDay.id));
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
  }, [user, gameOfDay]);

  // Update image height on load and window resize
  useEffect(() => {
    const updateHeight = () => {
      if (imgRef.current) {
        setImgHeight(imgRef.current.clientHeight);
      }
    };
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => {
      window.removeEventListener("resize", updateHeight);
    };
  }, []);

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
      {/* Background Image */}
      {gameOfDay?.cover && (
        <div
          className="absolute inset-0 bg-cover z-0 bg-center bg-no-repeat opacity-70"
          style={{ backgroundImage: `url(${gameOfDay.cover.url})` }}
        />
      )}
      <h1 className="relative text-2xl font-bold pb-4 z-20">
        Your Backlog Game of the Day
      </h1>

      {/* Gradients */}
      <div
        className="absolute top-0 h-full w-[103%] pointer-events-none z-10 right-0"
        style={{
          background: "linear-gradient(to left, #121212 5%, transparent 50%)",
        }}
      ></div>
      <div
        className="absolute top-0 h-full w-[101%] pointer-events-none z-10 left-50"
        style={{
          background: "linear-gradient(to right, #121212 50%, transparent 70%)",
        }}
      ></div>
      <div
        className="absolute top-0 h-[50vh] w-[101%] pointer-events-none z-10"
        style={{
          background: "linear-gradient(to bottom, #121212 0%, transparent 20%)",
        }}
      ></div>
      <div
        className="absolute bottom-0 h-[50vh] w-[101%] pointer-events-none z-10"
        style={{
          background: "linear-gradient(to top,#121212 0%, transparent 20%)",
        }}
      ></div>

      <div className="bg-cover bg-center bg-no-repeat relative z-10 pb-10">
        <div
          className="grid grid-cols-[20%_40%_auto] z-10"
          style={{ height: imgHeight || "auto" }}
        >
          <div className="relative z-50">
            {gameOfDay?.coverUrl && (
              <div>
                <GameCard
                  ref={imgRef}
                  onLoad={() => setImgHeight(imgRef.current.clientHeight)}
                  src={gameOfDay.coverUrl}
                  alt={`${gameOfDay.name} Logo`}
                  gameId={gameOfDay.id}
                  className="object-contain h-auto rounded"
                />
              </div>
            )}

          </div>
          <div className="flex flex-col pl-6 bg-customGray-900/50 rounded ml-2" style={{ height: imgHeight }}>
            {/* Additional details */}
          </div>
          <div className="flex flex-col pl-2" style={{ height: imgHeight }}>
            {/* Screenshots and other UI elements */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameOfTheDay;
