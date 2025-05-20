import {
  doc,
  getDoc,
  collection,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebaseConfig"; // Ensure Firestore is imported
import { useAuth } from "../useAuth";
import Header from "../components/Header";
import Footer from "../components/Footer";
import EditBannerModal from "../components/EditBannerModal";
import EditIconModal from "../components/EditIconModal";
import axios from "axios";
import RatingGraph from "../components/RatingGraph";
import Collections from "./Collections";
import bannerPlaceholder from "../assets/icons/pfpFallback.svg";

const Profile = () => {
  const navigate = useNavigate();
  const { user, updateUserData } = useAuth();
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    username: "",
  });
  const [setError] = useState(null);
  const [preloadedGames, setPreloadedGames] = useState({});
  const [isEditBannerOpen, setIsEditBannerOpen] = useState(false);
  const [isEditIconOpen, setIsEditIconOpen] = useState(false);
  const [loading, setLoading] = useState(true); // Track loading state
  const [src, setSrc] = useState(bannerPlaceholder);

  useEffect(() => {
    if (user?.profileIcon) {
      setSrc(user.profileIcon);
    }
  }, [user?.profileIcon]);

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
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const data = userDocSnap.data();
          setUserData(data); // Store Firestore data
          localStorage.setItem(`userData_${user.uid}`, JSON.stringify(data)); // Cache data
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
        const gameStatusesRef = collection(
          db,
          "users",
          user.uid,
          "gameStatuses"
        );
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
      } catch (err) {
        console.error("❌ Error fetching game statuses:", err);
      }
    };

    if (user) {
      fetchUserData();
      fetchUserGames();
    }
  }, [user]); // Runs when `user` changes

  const useResponsiveSlice = () => {
    const [itemsToShow, setItemsToShow] = useState(
      window.innerWidth >= 1024 ? 4 : 3
    ); // lg breakpoint: 1024px

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
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  const displayName =
    capitalizeName(userData?.firstName) +
    " " +
    capitalizeName(userData?.lastName);

  return (
    <div className="relative min-h-screen flex flex-col">
      <div>
        <Header showSearchBar showNavButtons showLoginButtons showProfileIcon />

        {/* Banner Container */}
        <div className="relative bg-customBlack rounded-lg">

          <div className="">

            <div
              className="absolute top-0 -mt-[1px] h-[100%] w-full pointer-events-none z-10"
              style={{
                background:
                  "linear-gradient(to bottom, #121212 15%, transparent 50%)",
              }}
            ></div>
            <div
              className="absolute bottom-0 -mb-[1px] h-[100%] w-full pointer-events-none z-10"
              style={{
                background:
                  "linear-gradient(to top, #121212 0%, transparent 35%)",
              }}
            ></div>
          </div>

          {/* Banner Image */}
          <div className="group relative">
            {!loading ? (
              <img
                src={
                  userData.bannerImage || "/images/heroFallback2.png"
                }
                alt="Banner"
                className="w-full h-[500px] object-cover rounded-lg "
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
                src="/icons/pencil.svg"
                alt="Edit Icon"
                className="hover:cursor-pointer w-4 absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:duration-300 duration-300"
              />
            </button>
          </div>

          {/* Profile Picture (PFP) */}
          <div className="absolute bottom-0 left-[15%] transform translate-y-1/2 z-40">
            <div className="group">
              <img
                src={src}
                alt="Profile"
                className="w-[150px] h-[150px] rounded-full object-cover shadow-lg"
                onError={(e) => {
                  // only run once
                  e.currentTarget.onerror = null;
                  setSrc(bannerPlaceholder);
                }}
              />

              <div
                onClick={() => setIsEditIconOpen(true)}
                className="hover:cursor-pointer group-hover:bg-black w-full h-full absolute top-0 rounded-full group-duration-300 group-hover:opacity-50"
              ></div>

              <img
                onClick={() => setIsEditIconOpen(true)}
                src="/icons/pencil.svg"
                alt="Edit Icon"
                className="hover:cursor-pointer w-[50px] absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:duration-300"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 mt-24 md:mx-[15%] mx-[5%]">
          {/* Left Collumn */}
          <div>
            <div>
              <h1 className="text-2xl font-semibold"> {displayName} </h1>
              <h4 className="text-lg">@{userData.username}</h4>
            </div>
            {/* Right Collumn */}
            <div className="w-72 mt-4">
              <RatingGraph />
            </div>
          </div>
        </div>

        <div className="md:mx-[15%] mx-[5%]">
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
