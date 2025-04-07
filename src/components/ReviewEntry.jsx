// ReviewEntry.jsx
const ReviewEntry = ({ pfp, reviewerName, rating, reviewText }) => {
  return (
    <div className="w-full grid grid-cols-[40px_auto] h-auto mb-4">
      {/* Profile Picture */}
      <div className="bg-red-300 flex items-center justify-center">
        {pfp ? (
          <img
            src={pfp}
            alt="PFP"
            className="w-10 h-10 object-cover rounded-full"
          />
        ) : (
          <span className="text-white text-xs">No PFP</span>
        )}
      </div>

      <div className="bg-blue-300 grid grid-rows-3 p-2">
        <div className="text-sm font-bold">{reviewerName}</div>
        <div className="text-sm">
          {rating ? `Rating: ${rating.toFixed(1)}/5` : "No rating"}
        </div>
        <div className="text-sm text-gray-700 mt-1">{reviewText}</div>
        <div className="text-xs text-gray-600 flex flex-row gap-x-4 mt-2">
          {/* Buttons for likes, comments, etc. */}
          <p>Likes (coming soon)</p>
          <p>Comments (coming soon)</p>
        </div>
      </div>
    </div>
  );
};

export default ReviewEntry;
