import React, { useEffect, useState } from "react";
import { collectionGroup, query, where, getDocs, collection, orderBy } from "firebase/firestore";
import { db } from "../firebaseConfig";
import ReviewEntry from "./ReviewEntry";

const GameReviews = ({ gameId }) => {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
     const fetchReviews = async () => {
    if (!gameId) return;
    // /games/gameId/reviews
    const reviewsRef = collection(db, "games", gameId, "reviews");
    const qReviews = query(reviewsRef, orderBy("createdAt", "desc"));

    const snapshot = await getDocs(qReviews);
    const tempReviews = [];
    snapshot.forEach((docSnap) => {
      if (docSnap.exists()) {
        tempReviews.push({ id: docSnap.id, ...docSnap.data() });
      }
    });
    setReviews(tempReviews);
  };

  fetchReviews();
}, [gameId]);

  

  if (reviews.length === 0) {
    return <p className="text-sm italic">No reviews yet.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {reviews.map((reviewObj, index) => (
        <ReviewEntry
          key={index}
          pfp={reviewObj.userPFP || null}
          reviewerName={reviewObj.userDisplayName || "Unknown User"}
          rating={reviewObj.rating || null}
          reviewText={reviewObj.review}
        />
      ))}
    </div>
  );
};

export default GameReviews;
