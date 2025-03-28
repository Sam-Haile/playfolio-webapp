import React, { useState, useEffect } from "react";
import { useAuth } from "../AuthContext"; // ✅ Get logged-in user
import { db } from "../firebaseConfig";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import PlayingIcon from "../assets/icons/PlayingIcon";
import BacklogIcon from "../assets/icons/BacklogIcon";
import WishlistIcon from "../assets/icons/WishlistIcon";
import DroppedIcon from "../assets/icons/DroppedIcon";

const GameStatus = ({ gameId }) => {
  const { user } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState(null);

  // Status options
  const statusOptions = [
    { name: "Played", component: PlayingIcon, color: "#4CAF50" }, // Green
    { name: "Backlog", component: BacklogIcon, color: "#FF9800" }, // Orange
    { name: "Wishlist", component: WishlistIcon, color: "#03A9F4" }, // Blue
    { name: "Dropped", component: DroppedIcon, color: "#F44336" }, // Red
  ];

  const defaultColor = "#FFFFFF"; // ✅ White for unselected

  // ✅ Load status when component mounts
  useEffect(() => {
    if (user) {
      console.log("Authenticated user:", user.uid);
      loadGameStatus();
    }
    else {
      console.log("User is not authenticated");
    }
  }, [user, gameId]);

  const loadGameStatus = async () => {
    try {
      const userGameRef = doc(db, "users", user.uid, "gameStatuses", gameId);
      const docSnap = await getDoc(userGameRef);
      if (docSnap.exists()) {
        const status = docSnap.data().status;
        setSelectedStatus(typeof status === "string" ? status : ""); // ✅ Ensure it's a string
      }
    } catch (error) {
      console.error("Error loading game status:", error);
    }
  };

  // ✅ Save status to Firestore
  const updateGameStatus = async (status) => {
    if (!user) {
      //FIX: NAVIGATE TO SIGN UP PAGE
      alert("You must be logged in to save your game status!");
      return;
    }

    try {
      const userGameRef = doc(db, "users", user.uid, "gameStatuses", gameId);

      if (selectedStatus === status) {
        // ✅ If already selected, remove from Firestore and reset UI
        await setDoc(userGameRef, { status: "", updatedAt: serverTimestamp() }); // Set empty status in Firestore
        setSelectedStatus(null); // Reset UI state
        console.log(`❌ Removed game status for ${gameId}`);
      } else {
        // ✅ Otherwise, update the status
        await setDoc(userGameRef, { status, updatedAt: serverTimestamp() }); 
        setSelectedStatus(status);
        console.log(`✅ Updated game status for ${gameId} to: ${status}`);
      }
    } catch (error) {
      console.error("Error saving game status:", error);
    }
  };


  return (
    <div className="flex flex-col">

      <div className="flex items-center justify-center gap-x-2 flex-wrap">
        {statusOptions.map(({ name, component: IconComponent, color }) => (
          <button
            key={name}
            className="flex flex-col items-center w-[20%] min-w-[80px] transition-all"
            onClick={() => updateGameStatus(name)}
          >
            <IconComponent color={selectedStatus === name ? color : defaultColor} />

            <p className={`text-center uppercase text-sm sm:text-base mt-2 font-semibold ${selectedStatus === name ? "text-white " : ""}`}>
              {name}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default GameStatus;
