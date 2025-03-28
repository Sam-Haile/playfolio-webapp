import React, { useState } from "react";

const UserRating = () => {
  const [hoveredStar, setHoveredStar] = useState(null); // Tracks the index of the hovered star

  return (
    <div>
      <p className="text-sm font-bold uppercase mb-2">Your Star Rating</p>
      <div className="flex gap-1">
        {Array(5)
          .fill(0)
          .map((_, i) => (
            <svg
              key={i}
              onMouseEnter={() => setHoveredStar(i)} // Set hovered star index
              onMouseLeave={() => setHoveredStar(null)} // Reset on mouse leave
              className={`h-6 w-6 ${
                i <= hoveredStar ? "text-yellow-400" : "text-gray-300"
              } fill-current cursor-pointer transition-colors duration-200`}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <path d="M12 2l2.7 8H22l-6.9 5 2.7 8L12 18l-6.9 5 2.7-8L2 10h7.3L12 2z" />
            </svg>
          ))}
      </div>
    </div>
  );
};

export default UserRating;
