import { doc, getDoc, collection, getDocs, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebaseConfig"; // Ensure Firestore is imported
import { useAuth } from "../useAuth";
import Header from "../components/Header";
import Footer from "../components/Footer";
import GameCard from "../components/GameCard";
import EditBannerModal from "../components/EditBannerModal"; // <--- new separate file
import EditIconModal from "../components/EditIconModal";
import { Tilt } from "react-tilt";
import axios from "axios";
import HorizontalLine from "../components/HorizontalLine";
import WishlistIcon from "../assets/icons/WishlistIcon";
import PlayingIcon from "../assets/icons/PlayingIcon";
import DroppedIcon from "../assets/icons/DroppedIcon";
import BacklogIcon from "../assets/icons/BacklogIcon";
import RatingGraph from "../components/RatingGraph";
import Collections from "./Collections";

const Profile = () => {
  const navigate = useNavigate();
  const { user, updateUserData } = useAuth();
  const [userData, setUserData] = useState({ firstName: "", lastName: "", username: "" });
  const [setError] = useState(null);
  const [preloadedGames, setPreloadedGames] = useState({});
  const [wishlistColor, setWishlistColor] = useState("#ffffff");
  const [playingColor, setPlayingColor] = useState("#ffffff");
  const [backlogColor, setBacklogColor] = useState("#ffffff");
  const [droppedColor, setDroppedColor] = useState("#ffffff");
  const [isEditBannerOpen, setIsEditBannerOpen] = useState(false);
  const [isEditIconOpen, setIsEditIconOpen] = useState(false);
  const [loading, setLoading] = useState(true); // Track loading state

  const [wishlistGames, setWishlistGames] = useState([]);
  const [wishlistCount, setWishlistCount] = useState(0);

  const [playingGames, setPlayingGames] = useState([]);
  const [playingCount, setPlayingCount] = useState(0);

  const [droppedGames, setDroppedGames] = useState([]);
  const [droppedCount, setDroppedCount] = useState(0);

  const [backlogGames, setBacklogGames] = useState([]);
  const [backlogCount, setBacklogCount] = useState(0);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        setUserData(userDocSnap.data());
        setLoading(false);
      }
    };

    if (user) {
      fetchUserData();
    }
  }, [user]);

  const handleNavigateToCollections = (type) => {
    navigate(`/profile/collections?type=${type}`);
  };

  const handleBannerUpdate = (newBannerUrl) => {
    setUserData((prev) => ({ ...prev, bannerImage: newBannerUrl }));
  };

  const handleIconUpdate = async (newIconUrl) => {
    await updateUserData({ profileIcon: newIconUrl });
  };

  const defaultOptions = {
    reverse: false, // Reverse the tilt direction
    max: 20, // Maximum tilt rotation (degrees)
    perspective: 1000, // Lower values make the tilt more extreme
    scale: 1.1, // Zoom effect on hover
    speed: 500, // Speed of the transition
    transition: true, // Enable smooth transitions
    axis: null, // Disable X or Y axis (set to 'X' or 'Y')
    reset: true, // Reset the tilt when the mouse leaves
    easing: "cubic-bezier(.03,.98,.52,.99)", // Easing function
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return; // Ensure user is logged in

      const cachedUserData = localStorage.getItem(`userData_${user.uid}`);
      if (cachedUserData) {
        setUserData(JSON.parse(cachedUserData)); // Load cached data
      }

      try {
        console.log("🔄 Fetching user data from Firestore...");
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const data = userDocSnap.data();
          setUserData(data); // Store Firestore data
          localStorage.setItem(`userData_${user.uid}`, JSON.stringify(data)); // Cache data
          console.log("✅ Cached user data in localStorage");
        } else {
          console.error("❌ No user found in Firestore");
          setError("User data not found.");
        }
      } catch (err) {
        console.error("❌ Error fetching user data:", err);
        setError("Failed to load user data.");
      }
    };

    const fetchUserGames = async () => {
      if (!user) return;

      try {
        const gameStatusesRef = collection(db, "users", user.uid, "gameStatuses");
        const querySnapshot = await getDocs(gameStatusesRef);
        let wishlist = [];
        let playing = [];
        let dropped = [];
        let backlog = [];

        querySnapshot.forEach((doc) => {
          const gameData = { id: doc.id, ...doc.data() };
          if (gameData.status === "Wishlist") wishlist.push(gameData);
          if (gameData.status === "Played") playing.push(gameData);
          if (gameData.status === "Dropped") dropped.push(gameData);
          if (gameData.status === "Backlog") backlog.push(gameData);
        });

        // Fetch game covers from IGDB
        const updatedWishlist = await fetchGameCovers(wishlist);
        const updatedPlaying = await fetchGameCovers(playing);
        const updatedDropped = await fetchGameCovers(dropped);
        const updatedBacklog = await fetchGameCovers(backlog);

        setWishlistGames(wishlist);
        setPlayingGames(playing);
        setDroppedGames(dropped);
        setBacklogGames(backlog);

        setWishlistCount(wishlist.length);
        setPlayingCount(playing.length);
        setDroppedCount(dropped.length);
        setBacklogCount(backlog.length);

      } catch (err) {
        console.error("❌ Error fetching game statuses:", err);
      }
    };

    if (user) {
      fetchUserData();
      fetchUserGames();
    }
  }, [user]); // Runs when `user` changes

  const fetchGameCovers = async (gamesList) => {
    try {
      const missingGames = gamesList.filter(game => !preloadedGames[game.id]);

      if (missingGames.length > 0) {
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/gameDetails`, {
          ids: missingGames.map(game => game.id),
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

      return gamesList.map(game => ({
        ...game,
        name: preloadedGames[game.id]?.name || "Unknown Game",
        coverImage: preloadedGames[game.id]?.coverImage || "/images/default_game_cover.png",
      }));
    } catch (error) {
      console.error("Error fetching game covers:", error);
      return gamesList;
    }
  };

  const useResponsiveSlice = () => {
    const [itemsToShow, setItemsToShow] = useState(window.innerWidth >= 1024 ? 4 : 3); // lg breakpoint: 1024px

    useEffect(() => {
      const handleResize = () => {
        setItemsToShow(window.innerWidth >= 1024 ? 4 : 3);
      };

      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);

    return itemsToShow;
  };

  const itemsToShow = useResponsiveSlice();

  function capitalizeName(name) {
    return name
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  const displayName = capitalizeName(userData?.firstName) + " " + capitalizeName(userData?.lastName);
console.log(displayName);
  return (
    <div className="relative min-h-screen flex flex-col">
      <div className="mx-[]">

        <Header showSearchBar showNavButtons showLoginButtons showProfileIcon />

        {/* Banner Container */}
        <div className="relative bg-white mx-[15%] h-[280px] mt-24 rounded-lg">
          {/* Banner Image */}
          <div className="group relative">
            {!loading ? (
              <img
                src={
                  userData.bannerImage || "./public/images/defaultBanner.png"
                }
                alt="Banner"
                className="w-full h-[280px] object-cover rounded-lg "
              />
            ) : (
              <div className="w-full h-[280px] bg-gray-700 animate-pulse rounded-lg"></div>
            )}

            <div className="absolute top-0 w-full h-full group-hover:bg-black group-hover:opacity-50 duration-300"></div>

            <button
              onClick={() => setIsEditBannerOpen(true)}
              className="bg-footerGray w-8 h-8 rounded-lg absolute top-0 right-0 p-1 m-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              <img
                onClick={() => setIsEditBannerOpen(true)}
                src="./src/assets/icons/pencil.svg"
                alt="Edit Icon"
                className="hover:cursor-pointer w-4 absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:duration-300 duration-300"
              />
            </button>
          </div>

          {/* Profile Picture (PFP) */}
          <div className="absolute bottom-0 left-[5%] transform translate-y-1/2">
            <div className="group">
              <img
                src={userData.profileIcon || "/images/default_profile.png"}
                alt="Profile"
                className="w-[150px] h-[150px] rounded-full object-cover shadow-lg"
              />

              <div
                onClick={() => setIsEditIconOpen(true)}
                className="hover:cursor-pointer group-hover:bg-black w-full h-full absolute top-0 rounded-full group-duration-300 group-hover:opacity-50"
              ></div>

              <img
                onClick={() => setIsEditIconOpen(true)}
                src="./src/assets/icons/pencil.svg"
                alt="Edit Icon"
                className="hover:cursor-pointer w-[50px] absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:duration-300"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 mt-24 mx-[15%]">
          {/* Left Collumn */}
          <div>
            <div>
              <h1 className="text-2xl font-semibold"> {displayName} </h1>
              <h4 className="text-lg">@{userData.username}</h4>
            </div>
          </div>
            
          {/* Right Collumn */}
          <div className="pl-8">
            <div className="flex gap-4 justify-center align-center items-center">
              <RatingGraph />
            </div>
          </div>
        </div>

        <div className="mx-[15%]">
          <Collections showProfile={true} />
        </div>


        {/* Edit Banner Modal */}
        {isEditBannerOpen && (
          <EditBannerModal
            onClose={() => setIsEditBannerOpen(false)}
            user={user}
            onBannerUpdate={handleBannerUpdate}
          />
        )}

        {/* Icon Modal */}
        {isEditIconOpen && (
          <EditIconModal
            onClose={() => setIsEditIconOpen(false)}
            user={user}
            onIconUpdate={handleIconUpdate}
          />
        )}
      </div>


      <Footer />
    </div>
  );
};

export default Profile;
