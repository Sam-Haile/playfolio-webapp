// CombinedStarRating.jsx
import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

export default function CombinedStarRating({ gameId, igdbRating, igdbCount }) {
  const [localStats, setLocalStats] = useState(null);

  useEffect(() => {
    if (!gameId) return;
    setLocalStats(null);
    (async () => {
      try {
        const snap = await getDoc(doc(db, "gameStats", String(gameId)));
        const data = snap.exists() ? snap.data() : {};
        setLocalStats({
          localReviewCount: data.localReviewCount || 0,
          localRatingSum:   data.localRatingSum   || 0,
        });
      } catch (err) {
        console.error("Error fetching gameStats:", err);
        setLocalStats({ localReviewCount: 0, localRatingSum: 0 });
      }
    })();
  }, [gameId]);

  // 🚫 “loading” placeholder becomes blank space
  if (localStats === null) {
    return (
      // Adjust min-h to roughly the combined height of the rating + stars
      <div className="min-h-[5rem]"></div>
    );
  }

  // … the rest stays the same …
  const igdbAvg5 = igdbRating != null ? (igdbRating / 100) * 5 : 0;
  const totalIgdbCount                 = igdbCount || 0;
  const { localReviewCount, localRatingSum } = localStats;
  const combinedCount                  = totalIgdbCount + localReviewCount;
  const igdbSum5     = igdbAvg5 * totalIgdbCount;
  const combinedSum5 = igdbSum5 + localRatingSum;
  const combinedAvg5 = combinedCount > 0 ? combinedSum5 / combinedCount : 0;
  const filledStars = Math.round(combinedAvg5);

  return (
    <div>
      <div className="text-4xl font-extrabold text-yellow-400">
        {combinedCount > 0
          ? `${combinedAvg5.toFixed(1)} / 5`
          : "Unrated"}
      </div>
      <div className="flex gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <svg
            key={i}
            className={`h-6 w-6 ${
              i < filledStars ? "text-yellow-400" : "text-gray-300"
            } fill-current`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <path d="M12 2l2.7 8H22l-6.9 5 2.7 8L12 18l-6.9 5 2.7-8L2 10h7.3L12 2z" />
          </svg>
        ))}
      </div>
    </div>
  );
}
