import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tilt } from "react-tilt";
import GameCard from "./GameCard";
import HorizontalLine from "./HorizontalLine";
import axios from "axios";
import { slugify } from "../services/slugify";

const ResultCard = ({ game, visualType }) => {
  const navigate = useNavigate();
  const [icons, setIcons] = useState([]);

  const handleClick = () => {
    navigate(`/game/${game.id}/${slugify(game.name)}`);
  };

  useEffect(() => {
    fetchIcons(game.name);
  }, [game.name, visualType]);

  const fetchIcons = async (gameName) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/steamgriddb/icons`,
        {
          gameName,
        }
      );

      if (response.data && response.data.success) {
        setIcons(response.data.icons); // Save icons to state
      } else {
        console.warn("No icons found for the game.");
        setIcons([]); // Ensure state is updated even when no icons are found
      }
    } catch (err) {
      console.error("Error fetching icons:", err.message);
      setIcons([]); // Set state to an empty array in case of an error
    }
  };

  const defaultOptions = {
    reverse: false,
    max: 20,
    perspective: 1000,
    scale: 1.1,
    speed: 800,
    transition: true,
    axis: null,
    reset: true,
    easing: "cubic-bezier(.03,.98,.52,.99)",
  };

  const imageUrl = game.coverUrl || "/path-to-placeholder-image.jpg";

  const getBackgroundColor = (rating, ratingCount) => {
    if (ratingCount == 0 || ratingCount == undefined) {
      return "#f0f0f0"; // Default color if no ratings
    }

    rating = Math.max(0, Math.min(5, rating));

    if (rating <= 2.5) {
      const t = rating / 2.5;
      const red = 255;
      const green = Math.round(255 * t);
      const blue = 0;
      return `rgb(${red}, ${green}, ${blue})`;
    }

    const t = (rating - 2.5) / 2.5;
    const red = Math.round(255 * (1 - t));
    const green = 255;
    const blue = 0;
    return `rgb(${red}, ${green}, ${blue})`;
  };

  const backgroundColor = getBackgroundColor(
    (game.totalRating || 0) / 20,
    game.ratingCount || game.rating_count
  );

  const getCardLayout = () => {
    switch (visualType) {
      case "compact":
        return (
          <div
            onClick={handleClick}
            className="h-full flex flex-col justify-between pb-2"
          >
            <div className="flex flex-col">
              <Tilt options={defaultOptions} style={{ width: "100%" }}>
                <div onClick={handleClick}>
                  <GameCard
                    src={imageUrl}
                    alt={imageUrl}
                    gameId={game.id}
                    className="h-[auto]"
                  />
                </div>
              </Tilt>
              <h1 className="pt-2 font-regular text-lg line-clamp-3 hover:text-primaryPurple-500 cursor-pointer">
                {game.name}{" "}
              </h1>
            </div>
            {game.totalRating > 0 ? (
                  <div className="flex self-start ">
                    <div
                      className="w-[30px] h-[25px] flex items-center justify-center text-sm font-bold rounded"
                      style={{
                        backgroundColor,
                        color: "#121212",
                      }}
                    >
                      {((game.totalRating || 0) / 20).toFixed(1)}
                    </div>

                    <p className="pl-[5px] font-thin">
                        ({game.ratingCount})
                    </p>
                  </div>
                ) : (
                  <div className="flex self-start ">
                    <div
                      className="w-[30px] h-[25px] flex items-center justify-center text-sm font-bold rounded"
                      style={{
                        backgroundColor,
                        color: "#121212",
                      }}
                    >
                      N/A
                    </div>

                    <p className="pl-[5px] font-thin">(0)</p>
                  </div>
                )}
          </div>
        );
      case "list":
        return (
          <div className="grid md:grid-cols-[35%_25%_25%_15%] grid-cols-[40%_30%_30%] items-center gap-4 w-full text-white">
            {/* Game Image */}
            <a
              href={`/game/${game.id}/${slugify(game.name)}`}
              className="flex-shrink-0 flex flex-row"
            >
              {icons.length > 0 ? (
                <Tilt>
                  <img
                    src={icons[0].url} // Use only the first icon
                    alt={`${game.name} icon`}
                    className="game-icon cursor-pointer"
                    style={{ width: "50px", height: "50px", margin: "5px" }}
                    onClick={handleClick}
                  />
                </Tilt>
              ) : (
                <p className="w-[60px] m-[5px] h-[50px] bg-gray-300"></p>
              )}
              <p
                className="font-bold flex items-center w-[100%] p-4 hover:text-primaryPurple-500 cursor-pointer"
                onClick={handleClick}
              >
                {game.name}{" "}
              </p>
            </a>

            {/* Developers */}
              <p className="font-light mr-6 italic">
                {Array.isArray(game.developers)
                  ? game.developers
                      .map((dev) => (typeof dev === "string" ? dev : dev?.name))
                      .join(", ")
                  : game.developers || "Unknown Developer"}
              </p>

            {/* Genre */}
            <div className="md:block hidden">
              <p className="pt-2 text-sm mr-6 text-gray-300">
                {game.genres.join(", ")}
              </p>
            </div>

            {/* Ratings */}
            {game.totalRating > 0 ? (
                  <div className="flex flex-row ">
                    <div
                      className="w-[30px] h-[25px] flex items-center justify-center text-sm font-bold rounded"
                      style={{
                        backgroundColor,
                        color: "#121212",
                      }}
                    >
                      {((game.totalRating || 0) / 20).toFixed(1)}
                    </div>

                    <p className="pl-[5px] font-thin">
                        ({game.ratingCount})
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-row ">
                    <div
                      className="w-[30px] h-[25px] flex items-center justify-center text-sm font-bold rounded"
                      style={{
                        backgroundColor,
                        color: "#121212",
                      }}
                    >
                      N/A
                    </div>

                    <p className="pl-[5px] font-thin">(0)</p>
                  </div>
                )}
          </div>
        );
      default: // Detailed view
        return (
          <div className="result-card h-[200px] w-auto md:m-4 my-2 text-white relative cursor-default	">
            <div className="grid md:grid-cols-[auto_1fr] grid-cols-[150px_1fr]">
              <Tilt options={defaultOptions} style={{ width: "100%" }}>
                <div onClick={handleClick}>
                  <GameCard
                    src={imageUrl}
                    alt={imageUrl}
                    gameId={game.id}
                    className="h-[200px]"
                  />
                </div>
              </Tilt>

              <div className="pl-4 grid grid-rows-[auto_auto] gap-2">
                <div>
                  <a
                    href={`/game/${game.id}/${slugify(game.name)}`}
                    className="font-bold text-xl hover:text-primaryPurple-500 cursor-pointer"
                  >
                    {game.name}{" "}
                    <span className="font-extralight italic">
                      ({game.releaseYear || "N/A"})
                    </span>
                  </a>

                  <p className="font-light text-sm pt-1 italic">
                    {Array.isArray(game.developers)
                      ? game.developers
                          .map((dev) =>
                            typeof dev === "string" ? dev : dev?.name
                          )
                          .join(", ")
                      : game.developers || "Unknown Developer"}
                  </p>

                  <p className="pt-1 text-gray-300 text-sm">
                    {game.genres.join(", ")}
                  </p>

                  <p className="hidden md:block mt-2 font-extralight truncate-text pr-24">
                    {game.storyline ||
                      game.summary ||
                      "No storyline or summary available."}
                  </p>
                </div>

                {game.totalRating > 0 ? (
                  <div className="flex self-end ">
                    <div
                      className="w-[30px] h-[25px] flex items-center justify-center text-sm font-bold rounded"
                      style={{
                        backgroundColor,
                        color: "#121212",
                      }}
                    >
                      {((game.totalRating || 0) / 20).toFixed(1)}
                    </div>

                    <p className="pl-[5px] font-thin">
                        ({game.ratingCount})
                    </p>
                  </div>
                ) : (
                  <div className="flex self-end ">
                    <div
                      className="w-[30px] h-[25px] flex items-center justify-center text-sm font-bold rounded"
                      style={{
                        backgroundColor,
                        color: "#121212",
                      }}
                    >
                      N/A
                    </div>

                    <p className="pl-[5px] font-thin">(0)</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
    }
  };
  return <div>{getCardLayout()}</div>;
};

export default ResultCard;
