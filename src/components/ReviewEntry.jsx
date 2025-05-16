import { doc, updateDoc, arrayUnion, arrayRemove, collection, getDocs, query, orderBy } from "firebase/firestore";
import { useAuth } from "../useAuth";
import ThumbsUpIcon from "../assets/icons/ThumbsUp";
import CommentIcon from "../assets/icons/CommentIcon";
import { useEffect, useState, useRef } from "react";
import { db } from "../firebaseConfig";
import ReplyBox from "./ReplyBox";
import ReplyEntry from "./ReplyEntry";
import defaultPfp from "../assets/icons/pfpFallback.svg";

const ReviewEntry = ({ pfp, reviewerName, rating, reviewText, gameId, reviewId, likes = [] }) => {
  const { user } = useAuth();
  const [hasLiked, setHasLiked] = useState(false);
  const [replies, setReplies] = useState([]);
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [visibleRepliesCount, setVisibleRepliesCount] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);  // for read more
  const [isClamped, setIsClamped] = useState(false);
  const reviewTextRef = useRef(null);

  useEffect(() => {
    const el = reviewTextRef.current;
    if (el) {
      const isOverflowing = el.scrollHeight > el.clientHeight + 1;
      setIsClamped(isOverflowing);
    }
  }, [reviewText]);


  useEffect(() => {
    fetchReplies();
  }, [gameId, reviewId]);

  useEffect(() => {
    if (user && Array.isArray(likes)) {
      setHasLiked(likes.includes(user.uid));
    }
  }, [likes, user]);

  const handleLike = async () => {
    if (!user) return;

    const reviewRef = doc(db, "games", gameId, "reviews", reviewId);

    try {
      await updateDoc(reviewRef, {
        likes: hasLiked
          ? arrayRemove(user.uid)
          : arrayUnion(user.uid),
      });

      setHasLiked(!hasLiked);
    } catch (error) {
      console.error("Error updating likes on review:", error);
    }
  };

  const fetchReplies = async () => {
    const repliesRef = collection(db, "games", gameId, "reviews", reviewId, "replies");
    const q = query(repliesRef, orderBy("createdAt", "asc"));
    const snapshot = await getDocs(q);
    const allReplies = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setReplies(allReplies);
  };

  const formatMentions = (text) => {
    if (!text) return null;
    const parts = text.split(/(@\w+)/g);
    return parts.map((part, i) => {
      if (part.startsWith("@")) {
        return (
          <span key={i} className="text-primaryPurple-500 text-sm">
            {part}
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="w-full grid grid-cols-[3rem_auto] h-auto mb-4">
      <div className="mt-1 w-12 h-12 rounded-full overflow-hidden flex justify-center items-center bg-gray-800">
        <img
          src={pfp || defaultPfp}
          alt="PFP"
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.onerror = null; // Prevent infinite loops
            e.target.src = defaultPfp;
          }}
        />
      </div>


      <div className=" pl-4">
        <div className="text-xs font-bold flex items-center">
          <div className="pt-2 mr-2 h-full items-center items-start flex">
            {reviewerName}
          </div>
          <div className="flex text- pt-1 ">
            {rating ? (
              <>
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <svg
                      key={i}
                      className={`h-4 w-4 ${i < Math.round(rating)
                        ? "text-primaryPurple-500"
                        : "text-gray-300"
                        } fill-current`}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2l2.7 8H22l-6.9 5 2.7 8L12 18l-6.9 5 2.7-8L2 10h7.3L12 2z" />
                    </svg>
                  ))}
              </>
            ) : (
              <span className="text-gray-400 pt-1">No rating</span>
            )}
          </div>

        </div>
        {/* Review text with clamp and toggle */}
        <div
          ref={reviewTextRef}
          className={`w-auto text-sm leading-snug ${!isExpanded ? 'line-clamp-4' : ''}`}
        >
          {reviewText}
        </div>

        {isClamped && (
          <div className="mt-1">
            <button
              onClick={() => setIsExpanded(prev => !prev)}
              className="text-xs text-primaryPurple-500 hover:font-semibold"
            >
              {isExpanded ? 'Show less' : 'Read more'}
            </button>
          </div>
        )}


        <div className="flex flex-row gap-x-4 mt-1">
          {/* Buttons for likes, comments, etc. */}
          <div
            className="flex items-center cursor-pointer group"
            onClick={handleLike}
          >
            <ThumbsUpIcon className={`w-5 h-5 ${hasLiked ? "text-primaryPurple-500" : "text-white"}`} />
            <p className="pl-1 text-xs text-white group-hover:text-primaryPurple-500 transition-colors duration-200">
              {(likes?.length || 0) + (hasLiked && !likes?.includes(user?.uid) ? 1 : 0)}
            </p>
          </div>


          <div onClick={() => setShowReplyBox(true)} className="flex items-center cursor-pointer group">
            <CommentIcon className="w-5 h-5 text-white group-hover:text-primaryPurple-500 transition-colors duration-200" />
            <p className="pl-1 text-xs text-white group-hover:text-primaryPurple-500 hover:cursor-pointer group-hover:font-semibold transition-colors duration-100">Reply</p>
          </div>

        </div>
        <div className="mt-4">
          {replies.slice(0, visibleRepliesCount).map(reply => {
            if (reply.parentReplyId) {
              return (
                <div key={reply.id} className="w-full grid grid-cols-[3rem_auto] h-auto mb-2">
                  <div className="mt-1 w-10 h-10 rounded-full overflow-hidden flex justify-center items-center bg-gray-800">
                    {reply.userPFP ? (
                      <img src={reply.userPFP} alt="PFP" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white text-xs">No PFP</span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{reply.userDisplayName}</p>
                    <p >{formatMentions(reply.text)}</p>
                    <div className="flex flex-row gap-x-4 ">
                      <div
                        className="flex items-center cursor-pointer group"
                        onClick={handleLike}
                      >
                        <ThumbsUpIcon className="w-4 h-4 text-white group-hover:text-primaryPurple-500 transition-colors duration-200" />
                        <p className="pl-1 text-sxstext-white group-hover:text-primaryPurple-500 transition-colors duration-200">
                          {(likes?.length || 0) + (hasLiked && !likes?.includes(user?.uid) ? 1 : 0)}
                        </p>
                      </div>

                      <div
                        onClick={() => setShowReplyBox(prev => !prev)}
                        className="flex items-center cursor-pointer group"
                      >
                        <CommentIcon className="w-4 h-4 text-white group-hover:text-primaryPurple-500 transition-colors duration-200" />
                        <p className="pl-1 text-xs text-white group-hover:text-primaryPurple-500 transition-colors duration-100">
                          Reply
                        </p>
                      </div>
                    </div>

                  </div>
                </div>
              );
            }

            return (
              <ReplyEntry
                key={reply.id}
                gameId={gameId}
                reviewId={reviewId}
                reply={reply}
                addReplyToList={(nestedReply) =>
                  setReplies((prev) => [...prev, nestedReply])
                }
              />
            );
          })}

          {replies.length > visibleRepliesCount && (
            <div className="pl-4 mt-2">
              <button
                onClick={() => setVisibleRepliesCount(prev => prev + 5)}
                className="text-sm text-primaryPurple-500 hover:underline"
              >
                Show more replies
              </button>
            </div>
          )}

          {showReplyBox && (
            <div className="mt-2 pl-4">
              <ReplyBox
                gameId={gameId}
                reviewId={reviewId}
                onReply={() => { setShowReplyBox(false) }}
                onCancel={() => setShowReplyBox(false)}
                addReplyToList={(reply) =>
                  setReplies((prev) => [...prev, reply])
                }
              />
            </div>
          )}
        </div>


      </div>
    </div>
  );
};

export default ReviewEntry;
