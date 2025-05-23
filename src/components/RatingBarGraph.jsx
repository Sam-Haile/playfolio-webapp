const FullStar = ({ color }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill={"#FFD700"}
    className="w-[20px] h-full"
  >
    <path d="M12.9121 1.59053C12.7508 1.2312 12.3936 1 11.9997 1C11.6059 1 11.2487 1.2312 11.0874 1.59053L8.27041 7.86702L1.43062 8.60661C1.03903 8.64895 0.708778 8.91721 0.587066 9.2918C0.465355 9.66639 0.574861 10.0775 0.866772 10.342L5.96556 14.9606L4.55534 21.6942C4.4746 22.0797 4.62768 22.4767 4.94632 22.7082C5.26497 22.9397 5.68983 22.9626 6.03151 22.7667L11.9997 19.3447L17.968 22.7667C18.3097 22.9626 18.7345 22.9397 19.0532 22.7082C19.3718 22.4767 19.5249 22.0797 19.4441 21.6942L18.0339 14.9606L23.1327 10.342C23.4246 10.0775 23.5341 9.66639 23.4124 9.2918C23.2907 8.91721 22.9605 8.64895 22.5689 8.60661L15.7291 7.86702L12.9121 1.59053Z" />
  </svg>
);

const RatingBarGraph = ({ distribution }) => {
  // Determine the maximum count to scale the bars.
  const maxCount = Math.max(...distribution);

  // Define the minimum height percentage for bars with 0 reviews.
  const minHeightPercent = 5; // 5% minimum height

  return (
    <div className="flex">
      {/* Left Label */}
      <div className=" flex w-auto text-right mr-2 gap-1 items-center">
        <h1 className="">1</h1>
        <FullStar />
      </div>
      <div className="w-[100%] grid grid-cols-9 items-end gap-1 min-h-[50px]">
        {/* Render a bar for each bin in the distribution */}
        {distribution.map((count, index) => {
          // Calculate the percentage height (if maxCount is 0, use 0)
          const heightPercent = maxCount ? (count / maxCount) * 100 : 0;
          // Ensure a minimal visible height
          const finalHeight = Math.max(heightPercent, minHeightPercent);

          return (
            <div
              key={index}
              className="bg-white hover:bg-primaryPurple-500 transition-all duration-300 rounded-t-sm"
              style={{ height: `${finalHeight}%` }}
              title={`Rating ${(1 + index * 0.5).toFixed(1)}: ${count} game(s)`}
            ></div>
          );
        })}
      </div>
      {/* Right Label */}
      <div className="flex w-auto gap-1 text-right ml-2 items-center ">
        <h1 className="">5</h1>
        <FullStar />
      </div>
    </div>
  );
};

export default RatingBarGraph;
