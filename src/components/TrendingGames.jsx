import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tilt } from "react-tilt";
import GameCard from "./GameCard";

const defaultOptions = {
  reverse: false,
  max: 20,
  perspective: 1000,
  scale: 1.05,
  speed: 500,
  transition: true,
  axis: null,
  reset: true,
  easing: "cubic-bezier(.03,.98,.52,.99)",
};

const TrendingGamesCarousel = ({ slides }) => {
  const navigate = useNavigate();
  const [displayedSlides, setDisplayedSlides] = useState([]);

  useEffect(() => {
    const updateDisplayedSlides = () => {
      const width = window.innerWidth;
      if (width >= 900) {
        setDisplayedSlides(slides.slice(0, 6)); // Display 5 slides on large screens
      } else if (width >= 768) {
        setDisplayedSlides(slides.slice(0, 5)); // Display 3 slides on medium screens
      } else if (width >= 700) {
        setDisplayedSlides(slides.slice(0, 4)); // Display 3 slides on medium screens
      } else {
        setDisplayedSlides(slides.slice(0, 3)); // Display 1 slide on small screens
      }
    };

    updateDisplayedSlides();
    window.addEventListener("resize", updateDisplayedSlides);

    return () => window.removeEventListener("resize", updateDisplayedSlides);
  }, [slides]);

  return (
    <div>
      <div className="flex justify-center">
        {displayedSlides.filter((slide) => slide.cover).map((slide, index) => (
          <div
            className="px-2 cursor-pointer  "
            key={index}
            onClick={() => slide.igdb_id ? navigate(`/game/${slide.igdb_id}`) : null}
          >
            <Tilt options={defaultOptions} style={{ width: "100%" }}>
              {slide.cover ? (
                <GameCard
                  src={slide.cover}
                  alt={`${slide.name} Cover`}
                  gameId={slide.igdb_id}
                  className="w-full h-auto rounded-lg shadow-md"
                />
              ) : (
                <div className="w-full rounded-lg flex items-center justify-center bg-gray-200">
                  <p className="text-gray-500 text-sm">No Coverk Available</p>
                </div>
              )}
            </Tilt>
          </div>
        ))}

      </div>
      <div className="flex flex-row-reverse">
        <a href="/" className="text-right pt-4 hover:text-primaryPurple-500">View More Trending </a>
      </div>
    </div>
  );
};

export default TrendingGamesCarousel;
