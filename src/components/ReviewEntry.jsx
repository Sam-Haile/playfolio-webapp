const ReviewEntry = () => {
  return (
    <div className="w-full grid grid-cols-[40px_auto] h-auto">
      <div className="bg-red-300">PFP</div>
      <div className="bg-blue-300 grid grid-rows-3 p-2">
        <div className="text-sm text-gray-700">Reviewer Name</div>
        <div className="text-sm text-gray-700">Rating</div>
        <div className="text-sm text-gray-700">
            <div className="flex flex-row gap-x-4">
                <p>Likes</p>
                <p>Comments</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewEntry;
