import React, { useEffect, useState } from "react";
import { collection, doc, getDoc, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../firebaseConfig";
import ReviewEntry from "./ReviewEntry";
// If your app scales and you start getting 100+ reviews per page, you might want to batch those user getDoc() calls with Promise.all() for performance.


const GameReviews = ({ gameId }) => {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!gameId) return;

      const reviewsRef = collection(db, "games", gameId, "reviews");
      const qReviews = query(reviewsRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(qReviews);

      const tempReviews = [];

      for (const docSnap of snapshot.docs) {
        if (!docSnap.exists()) continue;

        const data = docSnap.data();
        const { userId } = data;

        let profileIcon = null;

        if (userId) {
          try {
            const userDoc = await getDoc(doc(db, "users", userId));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              profileIcon = userData.profileIcon || null;
            }
          } catch (err) {
            console.error("Error fetching user pfp:", err);
          }
        }

        tempReviews.push({
          id: docSnap.id,
          ...data,
          userPFP: profileIcon,
          likes: data.likes || [],
        });
      }

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
          gameId={gameId}
          reviewId={reviewObj.id}
          likes={reviewObj.likes}
        />
      ))}
    </div>
  );
};

export default GameReviews;
