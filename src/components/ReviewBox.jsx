import { doc, getDoc, setDoc, serverTimestamp, collection } from "firebase/firestore";
import { useAuth } from "../AuthContext";
import { db } from "../firebaseConfig";
import { useEffect, useState, useRef } from "react";
import ProfileIcon from "../assets/icons/pfpFallback.svg";



const ReviewBox = ({ gameDetails, releaseDate }) => {
  const isUnreleased = releaseDate && releaseDate * 1000 > Date.now();
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [ratingValue, setRatingValue] = useState(null);
  const [savedReview, setSavedReview] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [review, setReview] = useState("");
  const textareaRef = useRef(null);
  const { user } = useAuth();

  console.log("Game Details on reviw box:", gameDetails);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.focus();

      textarea.setSelectionRange(textarea.value.length, textarea.value.length);
    }
  }, [isEditing]);

  useEffect(() => {
    const loadReview = async () => {
      if (!user || !gameDetails?.id) return;

      const userGameRef = doc(db, "users", user.uid, "gameStatuses", String(gameDetails.id));
      const snap = await getDoc(userGameRef);

      if (snap.exists()) {
        const data = snap.data();
        if (data.review) {
          setReview(data.review);
          setSavedReview(data.review);
          setIsEditing(false);
        }
        if (data.rating !== undefined) {
          setRatingValue(data.rating);
        }
      }
    };

    loadReview();
  }, [user, gameDetails?.id]);

  const handleSaveReview = async () => {
    if (!user || !gameDetails?.id) return;

    try {
      const gameId = String(gameDetails.id);
      const userGameRef = doc(db, "users", user.uid, "gameStatuses", gameId);

      const gameSnapshot = {
        name:gameDetails.name,
        heroImage: gameDetails.heroes.url || null,
        logo: gameDetails.logos.url || null,
      }

      // 1) Save to personal gameStatuses
      await setDoc(
        userGameRef,
        {
          gameId,
          review: review,
          updatedAt: serverTimestamp(),
          gameSnapshot,
        },
        { merge: true }
      );

      // 2) Save to public review collection
      const reviewsCollRef = collection(db, "games", gameId, "reviews");
      const newReviewRef = doc(reviewsCollRef, user.uid);

      const reviewData = {
        userId: user.uid,
        userDisplayName: user.displayName || "Unknown",
        userPFP: user.profileIcon || ProfileIcon,
        review: review,
        createdAt: serverTimestamp(),
        gameSnapshot,
      };

      if (ratingValue !== null && ratingValue !== undefined) {
        reviewData.rating = ratingValue;
      }

      await setDoc(newReviewRef, reviewData);

      setSavedReview(review);
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving review: ", error);
      alert("Error saving review. Please try again.");
    }
  };

  return (
    <div className="w-full px-4 mb-4">

      {isEditing ? (
        <>
          <div className="h-40 rounded">
            <textarea
              id="review"
              name="review"
              rows="4"
              cols="50"
              placeholder="Write a review..."
              value={review}
              ref={textareaRef}
              onChange={(e) => setReview(e.target.value)}
              className="w-full h-full p-4 text-white bg-customGray-700 
              bg-opacity-10 rounded placeholder:text-customGray-800 resize-none focus:outline-none lg:text-base md:text-sm"
            />
          </div>
          <div className="flex justify-end gap-2 mb-4">
            <button
              onClick={() => {
                setIsEditing(false);
                setReview(savedReview);
              }}
              className="mt-2 bg-gray-600 rounded px-4 hover:bg-gray-700 text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveReview}
              className="mt-2 bg-primaryPurple-500 rounded px-4 hover:bg-primaryPurple-600 text-sm"
            >
              Save
            </button>
          </div>
          {saveSuccess && (
            <p className="text-green-400 text-sm mt-2">Review saved!</p>
          )}
        </>
      ) : savedReview ? (
        <>
          <div className="bg-customGray-700 bg-opacity-10 text-white rounded p-4">
            <p className="italic">{savedReview}</p>
          </div>
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setIsEditing(true)}
              className="mt-2 bg-gray-600 rounded px-4 hover:bg-gray-700 text-sm"
            >
              Edit
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="italic text-customGray-800 mb-2">
            You haven't reviewed this game yet.
          </p>
          <button
            onClick={() => {
              if (!isUnreleased) setIsEditing(true);
            }}
            disabled={isUnreleased}
            className={`md:mt-0 mt-2 md:mb-0 mb-2 text-sm rounded px-4 py-2 transition-all ${isUnreleased
                ? "bg-gray-600 cursor-not-allowed opacity-60"
                : "bg-primaryPurple-500 hover:bg-primaryPurple-600"
              }`}
          >
            Write Review
          </button>

        </>
      )}
    </div>
  );
};

export default ReviewBox;
