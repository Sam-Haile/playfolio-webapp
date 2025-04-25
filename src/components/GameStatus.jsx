import React, { useState, useEffect } from "react";
import { useAuth } from "../AuthContext"; // ✅ Get logged-in user
import { db } from "../firebaseConfig";
import PlayingIcon from "../assets/icons/PlayingIcon";
import BacklogIcon from "../assets/icons/BacklogIcon";
import WishlistIcon from "../assets/icons/WishlistIcon";
import DroppedIcon from "../assets/icons/DroppedIcon";
import {
  doc,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  increment,
} from "firebase/firestore";
import HorizontalLine from "../components/HorizontalLine";

const GameStatus = ({ gameId, releaseDate }) => {
  const isUnreleased = releaseDate && releaseDate * 1000 > Date.now();
  const [selectedStatus, setSelectedStatus] = useState("");
  const { user } = useAuth();

  // Status options
  const statusOptions = [
    { name: "Played", component: PlayingIcon, color: "#4CAF50" }, // Green
    { name: "Dropped", component: DroppedIcon, color: "#F44336" }, // Red
    { name: "Backlog", component: BacklogIcon, color: "#FF9800" }, // Orange
    { name: "Wishlist", component: WishlistIcon, color: "#03A9F4" }, // Blue
  ];

  const defaultColor = "#FFFFFF"; // ✅ White for unselected

  // ✅ Subscribe to Firestore doc changes
  useEffect(() => {
    if (!user) return;

    const userGameRef = doc(db, "users", user.uid, "gameStatuses", gameId);

    // onSnapshot() fires immediately with the current data, then again whenever data changes
    const unsubscribe = onSnapshot(userGameRef, (snapshot) => {
      if (snapshot.exists()) {
        const status = snapshot.data().status;
        setSelectedStatus(status ?? "");
      } else {
        // Doc doesn't exist yet
        setSelectedStatus("");
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [user, gameId]);

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
        const previousStatus = gameDoc.exists() ? gameDoc.data().status : "";

        const updates = { updatedAt: serverTimestamp() };

        if (previousStatus === status) {
          // User clicked the same status; remove it
          updates.status = "";
          // Set local state so icon reverts to default
          setSelectedStatus("");

          if (previousStatus) {
            transaction.set(
              countsRef,
              { [previousStatus]: increment(-1) },
              { merge: true }
            );
          }
          console.log(`❌ Removed game status for ${gameId}`);
        } else {
          // Changing to a new status
          updates.status = status;
          setSelectedStatus(status);

          if (previousStatus) {
            // decrement the old status
            transaction.set(
              countsRef,
              { [previousStatus]: increment(-1) },
              { merge: true }
            );
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
    <div className="flex flex-col w-full lg:pt-[0px] md:pt-4 sm:pt-0">
      <div className="flex flex-wrap lg:place-content-between md:justify-center">
        {statusOptions.map(({ name, component: IconComponent, color }) => {
          const isDisabled =
            isUnreleased && (name === "Played" || name === "Dropped");

          return (
            <button
              key={name}
              disabled={isDisabled}
              className={`flex flex-col items-center w-[20%] min-w-[80px] transition-all ${isDisabled ? "opacity-50 cursor-not-allowed" : ""
                }`}
              onClick={() => {
                if (!isDisabled) updateGameStatus(name);
              }}
            >
              <IconComponent
                color={selectedStatus === name && !isDisabled ? color : defaultColor}
              />
              <p
                className={`text-center uppercase text-sm sm:text-base mt-2 font-semibold ${selectedStatus === name && !isDisabled ? "text-white" : ""
                  }`}
              >
                {name}
              </p>
            </button>
          );
        })}

      </div>
    </div>
  );
};

export default GameStatus;
