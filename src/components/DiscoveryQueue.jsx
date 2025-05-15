import React, { useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useNavigate } from "react-router-dom";
import ThumbsUp from "../assets/icons/ThumbsUp.jsx";
import ThumbsDown from "../assets/icons/ThumbsDown.jsx";
import DynamicLogo from "./DynamicLogo.jsx";
import ImageOverlay from "./ImageOverlay.jsx";
import ReactDOM from "react-dom";
import { slugify } from "../services/slugify.js";

function DiscoveryQueue({ games = [] }) {
  const navigate = useNavigate();

  const settings = {
    className: "center",
    centerMode: true,
    infinite: true,
    centerPadding: "0px",
    slidesToShow: 1,
    speed: 500,
    draggable: true,
    dots: true,
    customPaging: (i) => (
      <div className="h-4 w-4 mt-6 bg-customGray-800 hover:bg-primaryPurple-700 rounded-sm" />
    ),
  };

  return (
    <div className="w-full h-[400px]">
      <Slider {...settings}>
        {games.map((game) => (
          <GameSlide key={game.id} game={game} />
        ))}
      </Slider>
    </div>
  );
}

export default DiscoveryQueue;

function GameSlide({ game }) {
  const [mainScreenshotIndex, setMainScreenshotIndex] = useState(0);
  const [overlayOpen, setOverlayOpen] = useState(false);

  return (
    <div className="h-[400px] px-2 w-full grid lg:grid-cols-[40%_60%]">
      {/* Left Column */}
      <div className="grid grid-rows-[200px_200px]">
        {/* Top Left Column */}
        <div className="relative ">
          {game.heroes?.url ? (
            <img
              src={game.heroes.url}
              alt={`${game.name} hero`}
              className="absolute brightness-[.35] h-full w-full object-cover rounded"
            />
          ) : (
            <div className="absolute bg-customBlack-500"></div>
          )}

          <a className="relative cursor-pointer" href={`/game/${game.id}`}>
            <div className="flex h-full z-50 items-center w-full">
              <div className="flex h-full w-full justify-center items-center z-50 p-8">
                {game.logos?.url ? (
                  <DynamicLogo
                    url={game.logos.url}
                    gameName={game.name}
                    marginLeft={0}
                    className="max-h-full max-w-full h-auto object-contain"
                  />
                ) : (
                  <span className="text-4xl font-semibold text-white text-center">
                    {game.name}
                  </span>
                )}
              </div>
            </div>
          </a>
        </div>
        {/* Bottom Left Column */}
        <div className="bg-customGray-900/50 relative p-4 mt-2 rounded ">
          <p className="text-sm pb-1 truncate w-[75%]">
            {Array.isArray(game.genres) && game.genres.length > 0
              ? game.genres.map((genre, i) => (
                  <React.Fragment key={genre.id}>
                    <a
                      href={`/genre/${genre.id}/${slugify(genre.name)}`}
                      className="italic font-light hover:text-primaryPurple-500 hover:font-semibold cursor-pointer"
                    >
                      {genre.name}
                    </a>
                    {i < game.genres.length - 1 && ", "}
                  </React.Fragment>
                ))
              : "No platforms available"}
          </p>

          <p className="pt-2 line-clamp-4 cursor-text select-text text-md font-light w-[98%]">
            {game.storyline || game.summary || "No summary available."}
          </p>

          <p className="absolute bottom-0 pb-4 text-sm truncate w-[80%] ">
            {Array.isArray(game.platforms) && game.platforms.length > 0
              ? game.platforms.map((plat, i) => (
                  <React.Fragment key={plat.id}>
                    <a
                      href={`/platform/${plat.id}/${slugify(plat.name)}`}
                      className="line italic font-light hover:text-primaryPurple-500 hover:font-semibold cursor-pointer"
                    >
                      {plat.name}
                    </a>
                    {i < game.platforms.length - 1 && ", "}
                  </React.Fragment>
                ))
              : "No platforms available"}
          </p>

          <div className="absolute top-0 right-0 p-4">
            <div className="flex">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <svg
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.round(game.totalRating / 20)
                        ? "text-yellow-400"
                        : "text-gray-300"
                    } fill-current`}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2l2.7 8H22l-6.9 5 2.7 8L12 18l-6.9 5 2.7-8L2 10h7.3L12 2z" />
                  </svg>
                ))}
              <div className="text-sm italic text-gray-500 mt-auto pl-1">
                {game.totalRating
                  ? `(${game.ratingCount})`
                  : "No ratings available"}
              </div>
            </div>
          </div>

          {/* <div className="flex absolute bottom-0 right-0 p-4 gap-x-4">
            <ThumbsUp className="mt-auto h-6 w-6" />
            <ThumbsDown className="mt-auto h-6 w-6" />
          </div> */}
        </div>
      </div>

      {/* Right Column */}
      <div className="hidden lg:grid pl-2 grid-cols-[auto_auto]">
        <div className="rounded">
          {/* Foreground image */}
          <img
            src={game.screenshots?.[mainScreenshotIndex]}
            alt="Game Screenshot"
            className="w-full h-full object-cover cursor-zoom-in rounded"
            onClick={() => setOverlayOpen(true)}
          />

          {/* Conditionally render the overlay */}
          {overlayOpen &&
            ReactDOM.createPortal(
              <ImageOverlay
                src={game.screenshots?.[mainScreenshotIndex]}
                alt={`Screenshot of ${game.name}`}
                onClose={() => setOverlayOpen(false)}
              />,
              document.body
            )}
        </div>

        <div className="max-w-24 gap-y-2 flex flex-col pl-2">
          {game.screenshots?.slice(0, 7).map((url, index) => (
            <img
              key={index}
              src={url}
              onClick={(e) => {
                e.stopPropagation();
                setMainScreenshotIndex(index);
              }}
              className={`w-24 object-contain rounded cursor-pointer transition-opacity duration-300 ${
                mainScreenshotIndex === index
                  ? "opacity-100"
                  : "brightness-50 hover:brightness-100"
              }`}
              alt={`Screenshot ${index}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
