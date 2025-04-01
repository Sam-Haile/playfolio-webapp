import React, { Component } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import GameCard from "./GameCard";
import { useNavigate } from "react-router-dom";

function CenterMode({ games = [] }) {
  const navigate = useNavigate();

  const settings = {
    className: "center",
    centerMode: true,
    infinite: true,
    centerPadding: "60px",
    slidesToShow: 1,
    speed: 500,
  };

  const handleSeeMore = (gameId) => {
    navigate(`/game/${gameId}`); // Adjust if your routing is different
  };

  return (
    <div className="w-full px-4 py-4">
      <Slider {...settings}>
        {games.map((game) => (
          <div key={game.id} className="px-2">
            <div className="flex flex-cols-2 h-auto">
              <div className="bg-black w-1/2">
              {game.heroes?.url ? (
                  <img
                    src={game.heroes.url}
                    alt={`${game.name} hero`}
                    className=""
                  />
                ) : (
                  <div className="text-white p-2">No hero image found</div>
                )}

           </div>

              <div className="w-1/2">
                v
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
}

export default CenterMode;

