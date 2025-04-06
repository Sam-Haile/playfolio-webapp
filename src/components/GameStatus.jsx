import React, { useState, useEffect } from "react";
import { useAuth } from "../AuthContext"; // ✅ Get logged-in user
import { db } from "../firebaseConfig";
import PlayingIcon from "../assets/icons/PlayingIcon";
import BacklogIcon from "../assets/icons/BacklogIcon";
import WishlistIcon from "../assets/icons/WishlistIcon";
import DroppedIcon from "../assets/icons/DroppedIcon";
import { doc, setDoc, getDoc, serverTimestamp, increment, runTransaction } from "firebase/firestore";

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


  // ✅ Save status to Firestore and maintain counts
  const updateGameStatus = async (status) => {
    if (!user) {
      alert("You must be logged in to save your game status!");
      return;
    }
  
    const userGameRef = doc(db, "users", user.uid, "gameStatuses", gameId);
    const countsRef = doc(db, "users", user.uid, "statusesCount", "counts");
  
    try {
      await runTransaction(db, async (transaction) => {
        const gameDoc = await transaction.get(userGameRef);
        const countsDoc = await transaction.get(countsRef);
  
        const previousStatus = gameDoc.exists() ? gameDoc.data().status : null;
  
        const updates = { updatedAt: serverTimestamp() };
  
        if (previousStatus === status) {
          // User clicked the same status; remove it
          updates.status = "";
          setSelectedStatus(null);
  
          if (previousStatus) {
            transaction.set(countsRef, { [previousStatus]: increment(-1) }, { merge: true });
          }
  
          console.log(`❌ Removed game status for ${gameId}`);
        } else {
          updates.status = status;
          setSelectedStatus(status);
  
          if (previousStatus) {
            // decrement the old status
            transaction.set(countsRef, { [previousStatus]: increment(-1) }, { merge: true });
          }
          // increment new status
          transaction.set(countsRef, { [status]: increment(1) }, { merge: true });
        }
  
        transaction.set(userGameRef, updates, { merge: true });
      });
    } catch (error) {
      console.error("Error saving game status:", error);
    }
  };
  

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-wrap lg:place-content-between md:justify-center">
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
