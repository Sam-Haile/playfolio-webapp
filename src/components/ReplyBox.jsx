import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useAuth } from "../useAuth";

const ReplyBox = ({
  gameId,
  reviewId,
  parentReplyId = null,
  onReply,
  onCancel,
  addReplyToList,
  initialText = "",
}) => {
  const { user } = useAuth();
  const [text, setText] = useState(initialText);

  const handleCancelReply = () => {
    if (onCancel) {
      onCancel();
    }
  };

  const handleReply = async () => {
    if (!text.trim()) return;

    const repliesRef = collection(db, "games", gameId, "reviews", reviewId, "replies");

    const replyDoc = await addDoc(repliesRef, {
      text,
      userId: user.uid,
      userDisplayName: user.username || "Unknown",
      userPFP: user.profileIcon || "",
      createdAt: serverTimestamp(),
      likes: [],
      replyToReplyId: parentReplyId || null,
      replyToDisplayName: initialText?.match(/^@(\w+)/)?.[1] || null,
    });

    const newReply = {
      id: replyDoc.id,
      userDisplayName: user.username || "Unknown",
      userPFP: user.profileIcon || "",
      text,
      replyToReplyId: parentReplyId || null,
      replyToDisplayName: initialText?.match(/^@(\w+)/)?.[1] || null,
      likes: [],
    };

    if (addReplyToList) {
      addReplyToList({
        ...newReply,
        parentReplyId,
        parentDisplayName: parentReplyId ? user.username || "Unknown" : null,
      });
    }

    setText("");
    if (onReply) onReply();
  };

  const handleChange = (e) => {
    setText(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = e.target.scrollHeight + "px";
  };

  return (
    <div className="mt-2">
      <textarea
        value={text}
        onChange={handleChange}
        className="text-sm w-full min-h-[2rem] resize-none bg-customBlack text-white p-2 pl-4 border-b-2 border-primaryPurple-500 focus:outline-none focus:ring-0 placeholder:text-customGray-500 overflow-hidden"
        placeholder="Write a reply..."
        rows={1}
      />

      <div className="flex justify-end w-full">
        <button
          onClick={handleCancelReply}
          className="mr-2 mt-1 hover:text-primaryPurple-500 text-sm px-3 py-1"
        >
          Cancel
        </button>

        <button
          onClick={handleReply}
          className="mt-1 bg-primaryPurple-500 hover:bg-primaryPurple-600 text-sm px-3 py-1 rounded"
        >
          Comment
        </button>
      </div>
    </div>
  );
};

export default ReplyBox;
