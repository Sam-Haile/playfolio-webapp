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

function DiscoveryQueue({ games = [] }) {
  const navigate = useNavigate();

  const settings = {
    className: "center",
    centerMode: true,
    infinite: true,
    centerPadding: "0px",
    slidesToShow: 1,
    speed: 500,
    draggable: false,
  };

  return (
    <div className="w-full h-96 ">
      <div className="relative">
        <Slider {...settings}>
          {games.map((game) => (
            <GameSlide key={game.id} game={game} navigate={navigate} />
          ))}
        </Slider>
        {/* Gradients */}
        {/* <div
          className="absolute top-0 h-full w-[103%] pointer-events-none z-10 right-0"
          style={{
            background: "linear-gradient(to left, #121212 0%, transparent 5%)",
          }}
        ></div>
        <div
          className="absolute top-0 h-full w-[101%] pointer-events-none z-10 left-0"
          style={{
            background: "linear-gradient(to right, #121212 0%, transparent 5%)",
          }}
        ></div> */}
      </div>
    </div>
  );
}

export default DiscoveryQueue;

function GameSlide({ game, navigate }) {
  const [mainScreenshotIndex, setMainScreenshotIndex] = useState(0);
  const [overlayOpen, setOverlayOpen] = useState(false);

  const handleClick = () => {
    navigate(`/game/${game.id}`);
  };

  return (
    <div className="relative px-4">
      <div className="h-96 flex flex-cols-2">
        {/* LEFT HALF */}
        <div className="lg:w-1/2 md:w-full z-0 relative">
          {game.heroes?.url ? (
            <img
              src={game.heroes.url}
              alt={`${game.name} hero`}
              className="absolute brightness-[.65] rounded"
            />
          ) : (
            <div className="absolute bg-customBlack-500 w-full h-1/2 rounded"></div>
          )}

          <div className="flex h-[60%] cursor-pointer" onClick={handleClick}>
            <div className="flex z-20 items-end w-full">
              {/* <img
                src={game.coverUrl}
                alt={`${game.name} cover`}
                className="w-auto h-48 ml-12 z-1000 rounded"
              /> */}
              {game.logos?.url && (
                <DynamicLogo
                  url={game.logos.url}
                  gameName={game.name}
                  maxSize={"w-96"}
                  minSize={"w-60"}
                />
              )}
            </div>
          </div>

          <div className="flex h-[40%] mt-auto w-full rounded">
            <div className="mt-auto bg-customGray-900/50 w-full rounded p-4 relative">
              <div className="flex overflow-hidden">
                {/* <h2 className="font-semibold text-lg pb-2">{`${game.name} (${game.releaseYear})`}</h2> */}
                <div className="pb-2 lg:w-[70%] md:w-[40%]">
                  <p className="text-sm pb-1 truncate">
                    {game.genres?.length > 0
                      ? game.genres.join(", ")
                      : "No genres available"}
                  </p>
                  <p className="font-light text-sm truncate">
                    {game.platforms?.length > 0
                      ? game.platforms.join(", ")
                      : "No platforms available"}
                  </p>
                </div>

                <div className="ml-auto">
                  <div className="flex">
                    {Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <svg
                          key={i}
                          className={`h-6 w-6 ${
                            i < Math.round(game.rating_count / 20)
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
                        ? `(${game.rating_count})`
                        : "No ratings available"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex">
                <p className="line-clamp-3 cursor-text select-text text-md font-light w-[80%]">
                  {game.storyline || game.summary || "No summary available."}
                </p>
                <div
                  className="flex gap-2 ml-auto pb-2 mr-2 overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ThumbsUp className="mt-auto h-6 w-6"/>
                  <ThumbsDown className="mt-auto h-6 w-6"/>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT HALF */}
        <div className="hidden lg:flex w-1/2 flex flex-col ml-2 h-full ">
          <div className="relative w-full aspect-video overflow-hidden rounded">
            {/* Background layer (blurred) */}
            <img
              src={game.screenshots?.[mainScreenshotIndex]}
              alt=""
              className="absolute inset-0 w-full h-full object-cover blur-md scale-110 opacity-50"
              aria-hidden="true"
            />

            {/* Foreground image */}
            <img
              src={game.screenshots?.[mainScreenshotIndex]}
              alt="Game Screenshot"
              className="relative z-10 w-full h-full object-contain"
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

          <div className="relative h-[20%] overflow-hidden">
            <div className="py-1 flex h-full gap-2 w-full ">
              {game.screenshots?.slice(0, 5).map((url, index) => (
                <img
                  key={index}
                  src={url}
                  onMouseEnter={() => setMainScreenshotIndex(index)}
                  onClick={(e) => e.stopPropagation()}
                  className={`w-auto object-contain mb-1 mt-1 h-full rounded cursor-pointer transition-opacity duration-300 ${
                    mainScreenshotIndex === index
                      ? "opacity-100"
                      : "brightness-50 hover:brightness-100"
                  }`}
                  alt={`Screenshot ${index}`}
                />
              ))}

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
  );
}
