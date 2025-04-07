import React, { useEffect, useState } from "react";
import { useAuth } from "../useAuth";
import { db } from "../firebaseConfig";
import { collection, getDocs, getDoc, doc } from "firebase/firestore";
import HorizontalLine from "../components/HorizontalLine";
import GameCard from "../components/GameCard";
import axios from "axios";
import { Tilt } from "react-tilt";
import { useLocation, useNavigate } from "react-router-dom"; // Import hooks

const Collections = ({ user, showProfile = true }) => {
    const { user: authUser, loading } = useAuth();
    const activeUser = user || authUser;
    const location = useLocation();
    const navigate = useNavigate();

    const queryParams = new URLSearchParams(location.search);
    const initialType = queryParams.get("type") || "played";

    const [type, setType] = useState(initialType); // Use state instead of URL params
    const [games, setGames] = useState([]);
    const [preloadedGames, setPreloadedGames] = useState({});
    const [userData, setUserData] = useState(null);

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
      const newType = queryParams.get("type") || "played";
      setType(newType);
  }, [location.search]); // Re-run effect when URL changes

    const fetchGameCovers = async (gamesList) => {
        try {
            const missingGames = gamesList.filter((game) => !preloadedGames[game.id]);
            if (missingGames.length > 0) {
                const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/gameDetails`, {
                    ids: missingGames.map((game) => game.id),
                });
                const fetchedGames = response.data;
                const newPreloadedGames = { ...preloadedGames };
                fetchedGames.forEach((game) => {
                    newPreloadedGames[game.id] = {
                        name: game.name,
                        coverImage: game.coverImage,
                    };
                });
                setPreloadedGames((prev) => ({ ...prev, ...newPreloadedGames }));
            }
            return gamesList.map((game) => ({
                ...game,
                name: preloadedGames[game.id]?.name || "Unknown Game",
                coverImage: preloadedGames[game.id]?.coverImage || "/images/default_game_cover.png",
            }));
        } catch (error) {
            console.error("Error fetching game covers:", error);
            return gamesList;
        }
    };

    const fetchUserGames = async () => {
        if (!activeUser) return;
        try {
            const gamesCollectionRef = collection(db, "users", activeUser.uid, "gameStatuses");
            const querySnapshot = await getDocs(gamesCollectionRef);
            let gamesList = [];
            querySnapshot.forEach((docSnapshot) => {
                gamesList.push({
                    id: docSnapshot.id,
                    ...docSnapshot.data(),
                });
            });
            const filteredGames = gamesList.filter(
                (game) => game.status && game.status.toLowerCase() === type.toLowerCase()
            );
            const updatedGames = await fetchGameCovers(filteredGames);
            setGames(updatedGames);
        } catch (error) {
            console.error("Error fetching games:", error);
        }
    };

    useEffect(() => {
        if (activeUser) fetchUserGames();
    }, [activeUser, type]); // Re-fetch games when `type` changes

    useEffect(() => {
        if (games.length > 0) {
            setGames((prevGames) =>
                prevGames.map((game) => ({
                    ...game,
                    name: preloadedGames[game.id]?.name || "Unknown Game",
                    coverImage: preloadedGames[game.id]?.coverImage || "/images/default_game_cover.png",
                }))
            );
        }
    }, [preloadedGames]);

    // Sync URL with state when user selects a new type
    const handleTypeChange = (e) => {
      const newType = e.target.value;
      setType(newType);
      navigate(`?type=${newType}`, { replace: true }); // Update URL without reloading
    };
    
    return (
      <div className="min-h-screen">
        <h1 className="mt-14 text-lg font-semibold">Your Collection</h1>
        <div className="mt-8 w-full">
          <div className="hidden sm:flex space-x-4">
            {["played", "wishlist", "backlog", "dropped"].map((category) => (
              <button
                key={category}
                className={`border rounded px-3 py-1 hover:bg-primaryPurple-700 ${
                  type === category ? "text-white bg-primaryPurple-500" : ""
                }`}
                onClick={() => setType(category)}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
          <div className="sm:hidden relative">
            <div className="flex items-center ">
              <select
                    id="collectionType"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="px-2 bg-customBlack border border-1 text-white rounded"
                >
                    <option value="played">Played</option>
                    <option value="wishlist">Wishlist</option>
                    <option value="backlog">Backlog</option>
                    <option value="dropped">Dropped</option>
                </select>
            </div>
          </div>
        </div>

        <HorizontalLine marginBottom="mb-0" marginTop="mt-3" width="w-full" />

        <div className="mt-8">
          <div className="grid lg:grid-cols-8 md:grid-cols-6 grid-cols-4 gap-4">
            {loading ? (
              Array.from({ length: games.length || 8 }).map((_, index) => (
                <Tilt key={index} options={{ scale: 1.1 }}>
                  <GameCard isLoading={true} />
                </Tilt>
              ))
            ) : games.length > 0 ? (
              [
                ...games.map((game) => (
                  <Tilt key={game.id} options={{ scale: 1.1 }}>
                    <GameCard
                      gameId={game.id}
                      src={game.coverImage || "/images/default_game_cover.png"}
                      alt={game.name || "Game Cover"}
                      isLoading={!game.coverImage}
                    />
                  </Tilt>
                )),
                // <div key="empty-card" className="flex flex-col w-full h-full border border-2 rounded-lg">
                //     <img src="./src/assets/icons/add-circle.svg" className="w-[35%] flex items-center mx-auto"/>
                //     <p className="text-xs flex items-center mx-auto pt-2">Add More</p>
                // </div>
              ]
            ) : (
              <p>No games found in {type}.</p>
            )}
          </div>
        </div>
      </div>
    );
};

export default Collections;
