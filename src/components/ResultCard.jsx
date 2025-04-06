import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tilt } from "react-tilt";
import GameCard from "./GameCard";
import HorizontalLine from "./HorizontalLine";
import axios from "axios";

const ResultCard = ({ game, visualType }) => {
  const navigate = useNavigate();
  const [icons, setIcons] = useState([]);

  const handleClick = () => {
    navigate(`/game/${game.id}`);
  };

  useEffect(() => {
      fetchIcons(game.name);
  }, [game.name, visualType]);


  const fetchIcons = async (gameName) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/steamgriddb/icons`, {
        gameName,
      });

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

  const getBackgroundColor = (rating) => {
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

  const backgroundColor = getBackgroundColor((game.totalRating || 0) / 20);

  const getCardLayout = () => {
    switch (visualType) {
      case "compact":
        return (
          <div onClick={handleClick} className="px-2">
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
              <h1 className="font-regular text-xl line-clamp-3 hover:text-primaryPurple-500 cursor-pointer">{game.name} <span className="font-light italic">({game.releaseYear})</span></h1>
            </div>
            <div className="pb-6 flex self-end pb-3">
              <div
                className="w-[30px] h-[25px] flex items-center justify-center text-sm font-bold rounded"
                style={{
                  backgroundColor,
                  color: "#121212",
                }}
              >
                {((game.totalRating || 0) / 20).toFixed(1)}
              </div>
              <p className="pl-2 font-thin italic">
                {game.rating_count} Ratings{" "}
              </p>
            </div>
          </div>
        );

      case "list":
        return (
          <div className="grid grid-cols-[35%_25%_25%_15%] items-center gap-4 w-full text-white">
            {/* Game Image */}
            <div className="flex-shrink-0 flex flex-row">


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
                <p>No icons available</p>
              )}
              <p className="font-bold flex items-center w-[100%] pl-2 hover:text-primaryPurple-500 cursor-pointer" onClick={handleClick}>{game.name}{" "}
                <span className="font-extralight italic">
                  ({game.releaseYear || "N/A"})
                </span></p>
            </div>


            {/* Score */}
            <div>
              <p className="font-light italic ">
                {Array.isArray(game.developers)
                  ? game.developers.join(", ")
                  : "Unknown Developer"}
              </p>              </div>

            {/* Genre */}
            <div>
              <p className="pt-2 text-gray-400">{game.genres.join(", ")}</p>
            </div>

            {/* Ratings */}
            <div className="flex flex-row">
              <div
                className="w-[30px] h-[25px] flex items-center justify-center text-sm font-bold rounded"
                style={{
                  backgroundColor,
                  color: "#121212",
                }}
              >
                {((game.totalRating || 0) / 20).toFixed(1)}
              </div>
              <p className="pl-2 font-thin italic">
                {game.rating_count} Ratings{" "}
              </p>
            </div>
          </div>
        );


      default: // Detailed view
        return (
          <div
            className="result-card h-[200px] w-auto m-4 text-white relative cursor-default	"
          >
            <div className="grid grid-cols-[auto_1fr]">
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
                  <h1
                    className="font-bold text-xl hover:text-primaryPurple-500 cursor-pointer"
                    onClick={handleClick}
                    onMouseDown={(event) => {
                      if (event.button === 1) {
                        // Allow middle-click to open in a new tab
                        window.open(`/game/${game.id}`, "_blank");
                      }
                    }}
                  >
                    {game.name}{" "}
                    <span className="font-extralight italic">
                      ({game.releaseYear || "N/A"})
                    </span>
                  </h1>
                  <p className="font-light italic text-sm">
                    {Array.isArray(game.developers)
                      ? game.developers.join(", ")
                      : "Unknown Developer"}
                  </p>
                  <p className="font-extralight truncate-text pr-24">
                    {game.storyline ||
                      game.summary ||
                      "No storyline or summary available."}
                  </p>
                  <p className="pt-2 text-gray-400">{game.genres.join(", ")}</p>
                </div>
                <div className="pb-6 flex self-end pb-3">
                  <div
                    className="w-[30px] h-[25px] flex items-center justify-center text-sm font-bold rounded"
                    style={{
                      backgroundColor,
                      color: "#121212",
                    }}
                  >
                    {((game.totalRating || 0) / 20).toFixed(1)}
                  </div>
                  <p className="pl-2 font-thin italic">
                    {game.rating_count} Ratings{" "}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return <div>{getCardLayout()}</div>;
};

export default ResultCard;
