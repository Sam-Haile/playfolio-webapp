import React, { Component, useState } from "react";
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
      draggable: false,   // 🛑 Prevent mouse dragging
  };

  return (
    <div className="w-full h-96 cursor-pointer">
      <div className="relative">
        <Slider {...settings}>
          {games.map((game) => (
                <GameSlide key={game.id} game={game} navigate={navigate}/>
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

function GameSlide({ game, navigate }) {
  const [mainScreenshotIndex, setMainScreenshotIndex] = useState(0);

  const handleClick = () => {
    navigate(`/game/${game.id}`);
  };


  return (
    <div className="relative px-4" onClick={handleClick}>
      <div className="h-96 flex flex-cols-2">
        {/* LEFT HALF */}
        <div className="w-1/2 z-0 relative bg-customGray-900/40 rounded">
          {game.heroes?.url ? (
            <img
              src={game.heroes.url}
              alt={`${game.name} hero`}
              className="absolute brightness-[.75] rounded"
            />
          ) : (
            <div className="absolute bg-customBlack-500 w-full h-1/2 rounded"></div>
          )}

          <div className="flex h-[60%]">
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
                <div className="text-white pl-2 text-2xl flex mt-auto">
                  {game.name}
                </div>
              )}
            </div>
          </div>

          <div className="flex h-[40%] mt-auto w-full ">
            <div className="flex flex-col max-w-[85%]">
              <p className="pt-4 text-sm pl-2">
                {game.genres?.length > 0
                  ? game.genres.join(", ")
                  : "No genres available"}
              </p>
              <p className="font-light text-sm truncate pl-2">
                {game.platforms?.length > 0
                  ? game.platforms.join(", ")
                  : "No platforms available"}
              </p>
              <div className="grid grid-cols-[85%_auto] pl-2">
                <p className="mt-2 line-clamp-3 pt-2 text-md font-light">
                  {game.storyline || game.summary || "No summary available."}
                </p>
              </div>
            </div>

            <div className="flex gap-2 ml-auto pb-2 mr-2 overflow-hidden ">
              <ThumbsUp />
              <ThumbsDown />
            </div>
          </div>
        </div>

        {/* RIGHT HALF */}
        <div className="w-1/2 flex flex-col pl-2 h-full">
          <div className="relative flex-1 rounded overflow-hidden mt-auto flex justify-center items-center">
            <img
              src={game.screenshots?.[mainScreenshotIndex]}
              className="w-full object-cover rounded"
            />
          </div>

          <div className="relative h-[20%] overflow-hidden">
            <div className="py-1 flex h-full gap-2 w-full">
              {game.screenshots?.slice(0, 5).map((url, index) => (
                <img
                  key={index}
                  src={url}
                  onMouseEnter={() => setMainScreenshotIndex(index)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-auto object-contain mb-1 mt-1 h-full rounded cursor-pointer"
                  alt={`Screenshot ${index}`}
                />
              ))}

              <div
                className="absolute top-0 h-full w-[103%] pointer-events-none z-10 right-0"
                style={{
                  background: "linear-gradient(to left, #121212 0%, transparent 10%)",
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
