import { useState } from "react";
import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { useAuth } from "../useAuth";
import { db } from "../firebaseConfig";
import ReplyBox from "./ReplyBox";
import CommentIcon from "../assets/icons/CommentIcon";
import ThumbsUpIcon from "../assets/icons/ThumbsUp";

const ReplyEntry = ({ gameId, reviewId, reply, addReplyToList }) => {
    const { user } = useAuth();
    const [showReplyBox, setShowReplyBox] = useState(false);
    const [hasLiked, setHasLiked] = useState(reply.likes?.includes(user?.uid));
    const [likesCount, setLikesCount] = useState(reply.likes?.length || 0);
    const [isExpanded, setIsExpanded] = useState(false);  // for read more

    const handleLike = async () => {
        if (!user) return;

        const replyRef = doc(db, "games", gameId, "reviews", reviewId, "replies", reply.id);

        try {
            await updateDoc(replyRef, {
                likes: hasLiked
                    ? arrayRemove(user.uid)
                    : arrayUnion(user.uid),
            });

            setHasLiked(!hasLiked);
            setLikesCount((prev) => hasLiked ? prev - 1 : prev + 1);
        } catch (error) {
            console.error("Error updating likes on reply:", error);
        }
    };

    const formatMentions = (text) => {
        if (!text) return null;
        const parts = text.split(/(@\w+)/g); // Split on @mentions
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
        <div className="w-full grid grid-cols-[3rem_auto] h-auto mb-4 ">

            {/* Profile Picture */}
            <div className="mt-1 w-10 h-10 rounded-full overflow-hidden flex justify-center items-center bg-gray-800">
                {reply.userPFP ? (
                    <img src={reply.userPFP} alt="PFP" className="w-full h-full object-cover" />
                ) : (
                    <span className="text-white text-xs">No PFP</span>
                )}
            </div>

            <div className="pl-2">
                <div className="text-xs font-bold flex leading-tight">{reply.userDisplayName}</div>
                <div className={`text-sm ${!isExpanded ? 'line-clamp-4' : ''} leading-snug`}>
                    {reply.replyToDisplayName && (
                        <span className="text-primaryPurple-500 text-sm">
                            {" "}
                        </span>
                    )}
                    {formatMentions(reply.text)}
                </div>
                <button
          onClick={() => setIsExpanded(prev => !prev)}
          className="text-xs text-primaryPurple-500 hover:font-semibold mt-1"
        >
          {isExpanded ? 'Show less' : 'Read more'}
        </button>

                {/* Like and Reply buttons */}
                <div className="flex flex-row gap-x-4 pt-1 ">
                    <div
                        className="flex items-center cursor-pointer group"
                        onClick={handleLike}
                    >
                        <ThumbsUpIcon className="w-4 h-4 text-white group-hover:text-primaryPurple-500 transition-colors duration-200" />
                        <p className="pl-1 text-xs text-white group-hover:text-primaryPurple-500 transition-colors duration-200">
                            {likesCount}
                        </p>
                    </div>

                    <div
                        onClick={() => setShowReplyBox(prev => !prev)}
                        className="flex items-center cursor-pointer group"
                    >
                        <CommentIcon className="w-4 h-4 text-white group-hover:text-primaryPurple-500 transition-colors duration-200" />
                        <p className="pl-1 text-xs text-gray-300 group-hover:font-semibold group-hover:text-primaryPurple-500 transition-colors duration-100 leading-none">
                            Reply
                        </p>

                    </div>
                </div>

                {showReplyBox && (
                    <ReplyBox
                        gameId={gameId}
                        reviewId={reviewId}
                        parentReplyId={reply.id}
                        initialText={`@${reply.userDisplayName} `}
                        onReply={() => setShowReplyBox(false)}
                        onCancel={() => setShowReplyBox(false)}
                        addReplyToList={(newReply) =>
                            addReplyToList({
                                ...newReply,
                                parentReplyId: reply.id,
                                parentDisplayName: reply.userDisplayName,
                            })
                        }
                    />
                )}
            </div>
        </div>
    );
};

export default ReplyEntry;
