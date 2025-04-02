import React, { Component } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import GameCard from "./GameCard";
import { useNavigate } from "react-router-dom";
import ThumbsUp from "../assets/icons/ThumbsUp.jsx";
import ThumbsDown from "../assets/icons/ThumbsDown.jsx";
import SeeMore from "../assets/icons/SeeMore.svg";

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
    <div className="w-full h-96 ">
      <div className="relative">
        <Slider {...settings}>
          {games.map((game) => (
            <div key={game.id} className="relative px-4 ">
              <div className="h-96 flex flex-cols-2">
                <div className="w-1/2 z-0 relative">
                  {game.heroes?.url && (
                    <img
                      src={game.heroes.url}
                      alt={`${game.name} hero`}
                      className="absolute brightness-[.75] rounded-tl"
                    />
                  )}
                  <div className="flex h-[60%] ">
                    <div className="flex z-20 items-end w-full">
                      <img
                        src={game.coverUrl}
                        alt={`${game.name} cover`}
                        className="w-auto h-48 ml-12 z-1000 rounded"
                      />
                      {game.logos?.url ? (
                        <img
                          src={game.logos.url}
                          alt={`${game.name} logo`}
                          className="ml-4 w-48 h-auto self-auto"
                        />
                      ) : (
                        <div className="text-white p-2 text-2xl">
                          {game.name}
                        </div>
                      )}
                    </div>
                  </div>

<div className="">

                  <p className="pt-2 text-sm pl-2">
                    {game.genres?.length > 0
                      ? game.genres.map((genre) => genre).join(", ")
                      : "No genres available"}
                  </p>

                  <p className="font-light text-sm truncate pl-2">
                    {game.platforms?.length > 0
                      ? game.platforms.map((platform) => platform).join(", ")
                      : "No platforms avaliable"}
                  </p>

                  <div className="grid grid-cols-[75%_auto] pl-2">
                    <p className="line-clamp-3 pt-2 text-md font-light">
                      {game?.storyline ||
                        game?.summary ||
                        "No summary avaliable."}
                    </p>
                    <div className="flex gap-2 mt-auto ml-auto pr-2">
                      <ThumbsUp />
                      <ThumbsDown />
                        </div>
                    </div>
                  </div>
                </div>
                <div className="w-1/2">
                  <div className="flex flex-col pl-2 h-full">
                    <div className="relative h-[100%] overflow-hidden mt-auto flex  justify-center align-center ">
                      <img
                        src={game.screenshots[0]}
                        className="w-full object-cover rounded"
                      />
                    </div>

                    <div className="relative h-[20%] overflow-hidden">
                      <div className="py-1 flex h-[100%] gap-2 w-full">
                        {game.screenshots?.map((url, index) => (
                          <img
                            key={index}
                            src={url}
                            className="w-auto object-contain mb-1 mt-1 h-full rounded"
                            alt={`Screenshot ${index + 1}`}
                          />
                        ))}

                        {/* Right Gradient */}
                        <div
                          className="absolute top-0 h-full w-[103%] pointer-events-none z-10 right-0"
                          style={{
                            background:
                              "linear-gradient(to left, #121212 0%, transparent 10%)",
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Slider>
        {/* Right Gradient */}
        <div
          className="absolute top-0 h-full w-[103%] pointer-events-none z-10 right-0"
          style={{
            background: "linear-gradient(to left, #121212 0%, transparent 5%)",
          }}
        ></div>
        {/* Left Gradient */}
        <div
          className="absolute top-0 h-full w-[101%] pointer-events-none z-10 left-0"
          style={{
            background:
              "linear-gradient(to right, #121212 0%, transparent 5%)",
          }}
        ></div>
      </div>
    </div>
  );
}

export default CenterMode;
