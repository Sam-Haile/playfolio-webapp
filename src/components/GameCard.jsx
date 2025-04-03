import React, { forwardRef } from "react";
import { useNavigate } from "react-router-dom";

const GameCard = forwardRef(
  ({ src, alt, className = "", gameId, showSheen = true, isLoading }, ref) => {
    const navigate = useNavigate();

    if (!gameId) return null;

    const gameUrl = `/game/${gameId}`;

    const handleCardClick = (event) => {
      if (isLoading) return;
      // Allow middle-clicks to work naturally
      if (event.button === 1 || event.ctrlKey || event.metaKey) {
        return;
      }
      event.preventDefault();
      navigate(gameUrl);
    };

    return (
      <a
        href={gameUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleCardClick}
        className={`hover:drop-shadow-[0_0_10px_rgba(44,44,44,255)] relative flex items-center justify-center cursor-pointer rounded-lg ${className} ${
          isLoading ? "bg-red-500 animate-pulse" : ""
        }`}
      >
        {!isLoading ? (
          // Attach the ref to the <img> element so that its height can be measured.
          <img
            ref={ref}
            loading="lazy"
            src={src}
            alt={alt}
            className="w-full h-full object-cover rounded select-none"
            style={{ pointerEvents: "none" }}
            draggable="false"
          />
        ) : (
          // When loading, attach the ref to the fallback container.
          <div ref={ref} className="w-full h-full"></div>
        )}

        {showSheen && !isLoading && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 transition-opacity duration-300 hover:opacity-10 hover:animate-sheen"></div>
        )}
      </a>
    );
  }
);

export default GameCard;
