import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

function RatingCountDisplay({ gameId, gameDetails }) {
  // 1) start as null to signal “not loaded yet”
  const [localReviewCount, setLocalReviewCount] = useState(null);

  useEffect(() => {
    if (!gameId) return;

    setLocalReviewCount(null);     // reset whenever gameId changes

    const fetchLocalCount = async () => {
      try {
        const statsSnap = await getDoc(doc(db, "gameStats", String(gameId)));
        const count = statsSnap.exists()
          ? statsSnap.data().localReviewCount || 0
          : 0;
        setLocalReviewCount(count);
      } catch (err) {
        console.error("Error fetching local review count:", err);
        setLocalReviewCount(0);
      }
    };

    fetchLocalCount();
  }, [gameId]);

  // 2) combine IGDB + local only once local is loaded
  const igdbCount   = gameDetails.totalRatings || 0;
  const totalCount  = localReviewCount !== null
    ? igdbCount + localReviewCount
    : null;

  // 3) render
  return (
    <div className="text-xs text-gray-500 pt-1 min-h-[1em]">
      {totalCount === null
        ? "Loading ratings…"                       // or a spinner/icon
        : totalCount > 0
          ? `${totalCount} Ratings`
          : "Be the first to rate!"}
    </div>
  );
}

export default RatingCountDisplay;
