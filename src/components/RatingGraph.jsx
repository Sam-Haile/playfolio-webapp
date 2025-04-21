import { collection, getDocs } from "firebase/firestore";
import { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { useAuth } from "../useAuth";
import RatingBarGraph from "./RatingBarGraph";

const RatingGraph = () => {
  const { user } = useAuth();
  // We create an array of 9 elements (bins for 1, 1.5, 2, …, 5)
  const [ratingDistribution, setRatingDistribution] = useState(Array(9).fill(0));

  useEffect(() => {
    if (!user) return;

    const fetchRatings = async () => {
      try {
        // Query all game status documents for this user
        const gameStatusesRef = collection(db, "users", user.uid, "gameStatuses");
        const querySnapshot = await getDocs(gameStatusesRef);
        // Create an array for 9 bins (indices 0..8)
        const distribution = Array(9).fill(0);

        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          // Check if there is a rating field and it’s greater than 0.
          if (data.rating && data.rating > 0) {
            // Assuming ratings are stored in 0.5 increments between 1 and 5,
            // we can calculate an index as follows:
            // For rating 1.0 -> index 0, 1.5 -> index 1, …, 5.0 -> index 8.
            const index = Math.round((data.rating - 1) * 2);
            if (index >= 0 && index < distribution.length) {
              distribution[index] += 1;
            }
          }
        });

        setRatingDistribution(distribution);
      } catch (error) {
        console.error("Error fetching ratings: ", error);
      }
    };

    fetchRatings();
  }, [user]);

  return (
    <div>
      {/* <h3 className="text-xl font-bold mb-2">Your Ratings</h3> */}
      <RatingBarGraph distribution={ratingDistribution} />
    </div>
  );
};

export default RatingGraph;
