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

{/* <img 
                  src={game.coverUrl}
                  alt={`${game.name} cover`}
                  className="w-auto h-24 bg-red-500 shadow-lg"
                /> */}


                <p className="pt-2 text-sm">
                  {game.genres?.length > 0
                    ? game.genres.map((genre) => genre).join(", ")
                    : "No genres available"}
                </p>

                <p className="font-light text-sm">
                  {game.platforms?.length > 0
                    ? game.platforms.map((platform) => platform).join(", ")
                    : "No platforms avaliable"}
                </p>

                <p className="line-clamp-3 pt-2 text-md font-light">
                  {game?.storyline}
                </p>
                {/* 
                <img 
                  src={game.coverUrl}
                  alt={`${game.name} cover`}
                  className="absolute top-20 ml-12 w-[100px]"
                /> */}

              </div>

              <div className="w-1/2">
               
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
}

export default CenterMode;

