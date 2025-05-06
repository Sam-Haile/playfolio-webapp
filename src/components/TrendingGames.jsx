import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tilt } from "react-tilt";
import GameCard from "./GameCard";
import { slugify } from "../services/slugify.js";

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

const TrendingGamesCarousel = ({ slides, loading }) => {
  const navigate = useNavigate();
  const [displayedSlides, setDisplayedSlides] = useState([]);

  useEffect(() => {
    const updateDisplayedSlides = () => {
      const width = window.innerWidth;
      if (width >= 900) {
        setDisplayedSlides(slides.slice(0, 7));
      } else if (width >= 768) {
        setDisplayedSlides(slides.slice(0, 5));
      } else if (width >= 700) {
        setDisplayedSlides(slides.slice(0, 4));
      } else {
        setDisplayedSlides(slides.slice(0, 3));
      }
    };

    if (!loading) updateDisplayedSlides();
    window.addEventListener("resize", updateDisplayedSlides);
    return () => window.removeEventListener("resize", updateDisplayedSlides);
  }, [slides, loading]);

  return (
    <div>
      {loading ? (
        <div className="w-full h-40" /> 
      ) : (
        <div className="flex justify-center">
          {displayedSlides
            .filter((slide) => slide.cover)
            .map((slide, index) => (
              <div
                className="px-2 cursor-pointer"
                key={index}
                onClick={() =>
                  slide.igdb_id
                    ? navigate(`/game/${slide.igdb_id}/${slugify(slide.name)}`)
                    : null
                }
              >
                <Tilt options={defaultOptions} style={{ width: "100%" }}>
                  <GameCard
                    src={slide.cover}
                    alt={`${slide.name} Cover`}
                    gameName={slide.name}
                    gameId={slide.igdb_id}
                    className="w-full h-auto rounded-lg shadow-md"
                  />
                </Tilt>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};
export default TrendingGamesCarousel;
