import { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import { db } from "../firebaseConfig";
import { doc, runTransaction, getDoc, serverTimestamp, increment } from "firebase/firestore";

const FullStar = ({ color }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={color} className="w-full h-full">
    <path d="M12.9121 1.59053C12.7508 1.2312 12.3936 1 11.9997 1C11.6059 1 11.2487 1.2312 11.0874 1.59053L8.27041 7.86702L1.43062 8.60661C1.03903 8.64895 0.708778 8.91721 0.587066 9.2918C0.465355 9.66639 0.574861 10.0775 0.866772 10.342L5.96556 14.9606L4.55534 21.6942C4.4746 22.0797 4.62768 22.4767 4.94632 22.7082C5.26497 22.9397 5.68983 22.9626 6.03151 22.7667L11.9997 19.3447L17.968 22.7667C18.3097 22.9626 18.7345 22.9397 19.0532 22.7082C19.3718 22.4767 19.5249 22.0797 19.4441 21.6942L18.0339 14.9606L23.1327 10.342C23.4246 10.0775 23.5341 9.66639 23.4124 9.2918C23.2907 8.91721 22.9605 8.64895 22.5689 8.60661L15.7291 7.86702L12.9121 1.59053Z" />
  </svg>
);

const HalfStar = ({ activeColor, neutralColor }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-full h-full">
    <defs>
      <clipPath id="right-half">
        <rect x="12" y="0" width="12" height="24" />
      </clipPath>
      <clipPath id="left-half">
        <rect x="0" y="0" width="12" height="24" />
      </clipPath>
    </defs>
    <path
      d="M12.9121 1.59053C12.7508 1.2312 12.3936 1 11.9997 1C11.6059 1 11.2487 1.2312 11.0874 1.59053L8.27041 7.86702L1.43062 8.60661C1.03903 8.64895 0.708778 8.91721 0.587066 9.2918C0.465355 9.66639 0.574861 10.0775 0.866772 10.342L5.96556 14.9606L4.55534 21.6942C4.4746 22.0797 4.62768 22.4767 4.94632 22.7082C5.26497 22.9397 5.68983 22.9626 6.03151 22.7667L11.9997 19.3447L17.968 22.7667C18.3097 22.9626 18.7345 22.9397 19.0532 22.7082C19.3718 22.4767 19.5249 22.0797 19.4441 21.6942L18.0339 14.9606L23.1327 10.342C23.4246 10.0775 23.5341 9.66639 23.4124 9.2918C23.2907 8.91721 22.9605 8.64895 22.5689 8.60661L15.7291 7.86702L12.9121 1.59053Z"
      fill={neutralColor}
      clipPath="url(#right-half)"
    />
    <path
      d="M12.9121 1.59053C12.7508 1.2312 12.3936 1 11.9997 1C11.6059 1 11.2487 1.2312 11.0874 1.59053L8.27041 7.86702L1.43062 8.60661C1.03903 8.64895 0.708778 8.91721 0.587066 9.2918C0.465355 9.66639 0.574861 10.0775 0.866772 10.342L5.96556 14.9606L4.55534 21.6942C4.4746 22.0797 4.62768 22.4767 4.94632 22.7082C5.26497 22.9397 5.68983 22.9626 6.03151 22.7667L11.9997 19.3447L17.968 22.7667C18.3097 22.9626 18.7345 22.9397 19.0532 22.7082C19.3718 22.4767 19.5249 22.0797 19.4441 21.6942L18.0339 14.9606L23.1327 10.342C23.4246 10.0775 23.5341 9.66639 23.4124 9.2918C23.2907 8.91721 22.9605 8.64895 22.5689 8.60661L15.7291 7.86702L12.9121 1.59053Z"
      fill={activeColor}
      clipPath="url(#left-half)"
    />
  </svg>
);

const saveRatingToFirestore = async (userId, gameId, ratingValue) => {
  const userGameRef = doc(db, "users", userId, "gameStatuses", gameId);
  const countsRef   = doc(db, "users", userId, "statusesCount", "counts");
  const statsRef    = doc(db, "gameStats", gameId);

  try {
    await runTransaction(db, async (transaction) => {
       // 1) Read the existing user‐game doc (if any)
      const gameSnap = await transaction.get(userGameRef);
      const oldData  = gameSnap.exists() ? gameSnap.data() : {};
      const oldRating = typeof oldData.rating === "number"
        ? oldData.rating
        : null;
      const hadStatus = !!oldData.status;

   // 2) Write/merge the new rating+status
      const newData = {
        rating:    ratingValue,
        updatedAt: serverTimestamp(),
        // if they never had a status, mark as Played
        ...(hadStatus ? {} : { status: "Played" })
      };
      transaction.set(userGameRef, newData, { merge: true });

      // 3) If first‐time play, bump their Played count
      if (!hadStatus) {
        transaction.set(
          countsRef,
          { Played: increment(1) },
          { merge: true }
        );
      }


        // 4) Adjust your global aggregates
      if (oldRating === null) {
        // brand‐new rating: +1 count, +rating sum
        transaction.set(
          statsRef,
          {
            localReviewCount: increment(1),
            localRatingSum:   increment(ratingValue)
          },
          { merge: true }
        );
      } else if (oldRating !== ratingValue) {
        // update: only adjust the sum by the difference
        const diff = ratingValue - oldRating;
        transaction.set(
          statsRef,
          { localRatingSum: increment(diff) },
          { merge: true }
        );
      }
      // else oldRating === ratingValue → do nothing
    });
  } catch (error) {
    console.error("Error saving rating:", error);
  }
};



const StarRating = ({gameId, releaseDate}) => {
  const isUnreleased = releaseDate && releaseDate * 1000 > Date.now();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [starColor] = useState("#FFD700");
  const neutralColor = "#ffffff";

  const { user } = useAuth();

  useEffect(() => {
    const loadRating = async () => {
      if (user && gameId) {
        try {
          const docRef = doc(db, "users", user.uid, "gameStatuses", gameId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.rating) {
              setRating(data.rating);
            }
          }
        } catch (error) {
          console.error("Error loading rating:", error);
        }
      }
    };
    loadRating();
  }, [user, gameId]);

  const handleRating = async (value) => {
    if (isUnreleased) return; // Don't allow rating if the game is unreleased
    setRating(value);
    if (user) {
      await saveRatingToFirestore(user.uid, gameId, value);

       // Now re-fetch the doc to see "Played" (so UI sees the updated status)
    const docRef = doc(db, "users", user.uid, "gameStatuses", gameId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const updatedStatus = docSnap.data()?.status;
      console.log("Refetched status after rating:", updatedStatus);
      // If you have a parent or context that tracks status, update it here
      // or call some function in GameStatus to refresh.
    }
    } else {
      console.error("User is not authenticated");
    }
  };

  const handleHover = (value) => {
    if(isUnreleased) return; // Don't allow hover if the game is unreleased
    if (hoverRating !== value) {
      setHoverRating(value);
    }
  };
  
  const Star = ({ value }) => {
    const isFilled = (hoverRating || rating) >= value;
    const isHalf = (hoverRating || rating) === value - 0.5;
  
    return isHalf ? (
      <HalfStar activeColor={starColor} neutralColor={neutralColor} />
    ) : (
      <FullStar color={isFilled ? starColor : neutralColor} />
    );
  };
  

return (
  <div className="flex justify-center px-4">
  <div
    className={`flex gap-2 relative cursor-pointer ${
    !user || isUnreleased ? "opacity-50 cursor-not-allowed pointer-events-none" : "cursor-pointer"
    }`}
    onMouseLeave={() => setHoverRating(0)}
  >
    {[1, 2, 3, 4, 5].map((star) => (
      <div key={star} className="relative w-full h-full">
        <Star value={star} />
        <div
          className="absolute left-0 top-0 w-1/2 h-full z-10"
          onClick={() => handleRating(star - 0.5)}
          onMouseEnter={() => handleHover(star - 0.5)}
        />
        <div
          className="absolute right-0 top-0 w-1/2 h-full z-10"
          onClick={() => handleRating(star)}
          onMouseEnter={() => handleHover(star)}
        />
      </div>
    ))}
  </div>
</div>

);
};

export default StarRating;
