import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import HorizontalLine from "../components/HorizontalLine";
import EmblaCarousel from "../components/EmblaCarousel";
import SimilarGamesCarousel from "../components/SimilarGamesCarousel";
import "../styles/embla.css";
import { Tilt } from "react-tilt";
import SkeletonLoading from "../components/SkeletonLoading";
import Footer from "../components/Footer";
import GameStatus from "../components/GameStatus";
import StarRating from "../components/StarRating";
import GameCard from "../components/GameCard";

const GamePage = () => {
  const { id } = useParams(); // Get the game ID from the URL
  const [gameDetails, setGameDetails] = useState(null); // Store details about the game
  const [screenshots, setScreenshots] = useState([]); // Store artworks separately
  const [logos, setLogos] = useState([]); // Store SteamGridDB logos
  const [loading, setLoading] = useState(true); // Tracks if data is being fetched
  const [heroes, setHeroes] = useState([]); // Store heroes
  const [hoveredStar, setHoveredStar] = useState(null); // For star hover effect
  const [userRating, setUserRating] = useState(null); // Store user's rating
  const [similarGames, setSimilarGames] = useState([]); // Store similar games
  const [preloadedGames, setPreloadedGames] = useState({}); // Cache for preloaded similar games
  const [showMore, setShowMore] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchGameData();
    const scrollContainer = document.querySelector(".scrollable-container");
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: "auto" });
    }
  }, [id]);

  const fetchSimilarGames = async (ids) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/similar-games",
        {
          ids,
        }
      );

      const preloadedData = response.data.reduce((acc, game) => {
        acc[game.id] = game;
        return acc;
      }, {});
      setPreloadedGames((prevCache) => ({ ...prevCache, ...preloadedData }));

      // Update the similar games state
      setSimilarGames(response.data);
    } catch (err) {
      console.error("Error fetching similar games:", err);
    }
  };

  const handleCompanyClick = (companyId) => {
    navigate(`/developer/${companyId}`);
  };

  const fetchGameData = async () => {
    try {
      const gameResponse = await axios.post("http://localhost:5000/api/game", {
        id,
      });

      // Update main game data
      setGameDetails(gameResponse.data);

      const similarGameIds = gameResponse.data.similar_games || [];
      if (similarGameIds.length > 0) {
        fetchSimilarGames(similarGameIds);
      }

      // Fetch and process other data (screenshots, heroes, logos)
      let screenshotsResponse = { data: [] };
      let sortedScreenshots = [];
      let heroesResponse = { data: { heroes: [] } };
      let logosResponse = { data: { logos: [] } };

      try {
        screenshotsResponse = await axios.post(
          "http://localhost:5000/api/screenshots",
          { gameId: id }
        );
        sortedScreenshots = [...screenshotsResponse.data].sort((a, b) => {
          return a.id - b.id; // Sort by ID for stable ordering
        });
      } catch (err) {
        console.warn("Error fetching screenshots:", err.message);
      }

      try {
        heroesResponse = await axios.post(
          "http://localhost:5000/api/steamgriddb/heroes",
          {
            gameName: gameResponse.data.name,
          }
        );
      } catch (err) {
        console.warn("Error fetching heroes:", err.message);
      }

      try {
        logosResponse = await axios.post(
          "http://localhost:5000/api/steamgriddb/logos",
          {
            gameName: gameResponse.data.name,
          }
        );
      } catch (err) {
        console.warn("Error fetching logos:", err.message);
      }

      // Update state with processed data
      setScreenshots(sortedScreenshots);
      setHeroes(heroesResponse.data.heroes || []);
      setLogos(logosResponse.data.logos || []);
    } catch (err) {
      console.error("Error fetching game data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSimilarGameClick = (gameId) => {
    // Scroll to the top of the page
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Delay navigation to ensure scrolling completes before re-rendering
    setTimeout(() => {
      navigate(`/game/${gameId}`);
    }, 300); // Adjust delay to match scroll duration
  };

  if (loading) {
    return <SkeletonLoading type="game" />;
  }

  if (!gameDetails) {
    return <p>Game not found.</p>;
  }

  const {
    name,
    summary,
    storyline,
    genres,
    cover,
    releaseYear,
    releaseDate,
    involvedCompanies,
    developers,
    publishers,
    ageRatings,
    platforms,
  } = gameDetails;

  const getRatingIconUrl = (category, rating) => {
    const baseUrl = "https://www.igdb.com/icons/rating_icons";

    // Map for category paths
    const categories = {
      1: "esrb", // ESRB
      2: "pegi", // PEGI
      3: "cero", // CERO
      4: "usk", // USK
      5: "grac", // GRAC
      6: "class_ind", // CLASS_IND
      7: "acb", // ACB
    };

    // Map for rating paths
    const ratings = {
      1: "3", // PEGI - Three
      2: "7", // PEGI - Seven
      3: "12", // PEGI - Twelve
      4: "16", // PEGI - Sixteen
      5: "18", // PEGI - Eighteen
      6: "rp", // ESRB - RP (Rating Pending)
      7: "ec", // ESRB - EC (Early Childhood)
      8: "e", // ESRB - Everyone
      9: "e10", // ESRB - Everyone 10+
      10: "t", // ESRB - Teen
      11: "m", // ESRB - Mature
      12: "ao", // ESRB - Adults Only
      13: "a", // CERO - A
      14: "b", // CERO - B
      15: "c", // CERO - C
      16: "d", // CERO - D
      17: "z", // CERO - Z
      18: "0", // USK - 0
      19: "6", // USK - 6
      20: "12", // USK - 12
      21: "16", // USK - 16
      22: "18", // USK - 18
      23: "all", // GRAC - All
      24: "12", // GRAC - Twelve
      25: "15", // GRAC - Fifteen
      26: "18", // GRAC - Eighteen
      27: "testing", // GRAC - Testing
      28: "l", // CLASS_IND - L
      29: "10", // CLASS_IND - Ten
      30: "12", // CLASS_IND - Twelve
      31: "14", // CLASS_IND - Fourteen
      32: "16", // CLASS_IND - Sixteen
      33: "18", // CLASS_IND - Eighteen
      34: "g", // ACB - G
      35: "pg", // ACB - PG
      36: "m", // ACB - M
      37: "ma15", // ACB - MA15+
      38: "r18", // ACB - R18+
      39: "rc", // ACB - Refused Classification
    };

    // Resolve paths
    const categoryPath = categories[category];
    const ratingPath = ratings[rating];

    // Construct URL
    if (categoryPath && ratingPath) {
      return `${baseUrl}/${categoryPath}/${categoryPath}_${ratingPath}.png`;
    }

    // Default fallback icon
    return `${baseUrl}/default.png`;
  };

  const defaultOptions = {
    reverse: false,
    max: 20,
    perspective: 1000,
    scale: 1,
    speed: 500,
    transition: true,
    axis: null,
    reset: true,
    easing: "cubic-bezier(.03,.98,.52,.99)",
  };

  return (
    <div className="h-[100%]">
      <div className="mx-[5%]">
        <Header
          showSearchBar={true}
          showNavButtons={true}
          showLoginButtons={true}
          zIndex={1000}
        />
      </div>

      <div className="bg-white h-[75vh] relative mt-8">
        <div className="bg-white h-[75vh] relative flex items-center justify-center overflow-hidden pointer-event:none">
          {heroes && heroes.length > 0 ? (
            <img
              src={heroes[0].url} // Use the first hero
              alt="Game Hero"
              className="w-full h-full object-cover" // Adjust height for proportional scaling
              draggable="false"
            />
          ) : screenshots && screenshots.length > 0 ? (
            <img
              src={screenshots[0].imageUrl} // Use the first screenshot as a fallback
              alt={`${name} Screenshot`}
              className="w-full h-full object-cover" // Adjust height for proportional scaling
            />
          ) : (
            <p>No heroes or screenshots available.</p>
          )}
        </div>

        {/* Gradients */}
        <div>
          <div
            className="absolute top-0 h-[100%] w-full pointer-events-none z-10"
            style={{
              background:
                "linear-gradient(to bottom, #121212 0%, transparent 60%)",
            }}
          ></div>
          <div
            className="absolute bottom-0 h-[100%] w-full pointer-events-none z-10"
            style={{
              background:
                "linear-gradient(to top, #121212 25%, transparent 85%)",
            }}
          ></div>
        </div>

        <div className="absolute inset-0 bg-customBlack bg-opacity-0 z-30">
          <div className="h-[75%] grid grid-cols-[auto_40%_35%]  mx-[15%]">
            <div className="relative">
              <Tilt
                options={defaultOptions}
                className="relative w-full h-full" // Apply container-specific styles
              >
                {" "}
                {cover && (
                  <img
                    src={`https://images.igdb.com/igdb/image/upload/t_1080p/${cover.image_id}.jpg`}
                    alt={`${name} Logo`}
                    className="w-auto h-auto rounded overflow-hidden bottom-0 absolute"
                    draggable="false"
                  />
                )}
              </Tilt>
            </div>
            <div className="grid grid-rows-[auto] h-auto self-end pl-4">
              <div className="flex flex-col items-start gap-2">
                {/* Developer Logo */}
                {developers[0].logo && (
                  <button onClick={() => handleCompanyClick(developers[0].id)}>
                    <img
                      src={developers[0].logo}
                      alt={developers[0].name}
                      className="w-[75px] h-auto object-contain mt-2" // Adjust size for better visuals
                      draggable="false"
                    />
                  </button>
                )}

                {/* Game Logo */}
                {logos && logos.length > 0 && (
                  <img
                    src={logos[0].url} // Use the first logo
                    alt="Game Logo"
                    className="max-h-[120px] max-w-full h-auto object-contain" // Adjusted for responsive scaling
                    draggable="false"
                  />
                )}
              </div>

              <div className="flex flex-col h-full mt-4">
                {/* Game Name */}
                <h3 className="text-3xl font-normal italic whitespace-nowrap overflow-hidden text-ellipsis">
                  {name} ({releaseYear})
                </h3>

                <div className="flex gap-2">
                  {/* Developer Names */}
                  {developers.length > 0 &&
                    developers.map((developer, index) => (
                      <button onClick={() => handleCompanyClick(developer.id)} key={index} className="italic font-light text-sm hover:text-primaryPurple-500">
                        {developer.name}
                      </button>
                    ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="mx-[15%] grid grid-cols-[65%_35%]">
            <div className="h-[auto]">
              <HorizontalLine
                marginTop="mt-14"
                marginBottom="mb-8"
                width="w-full"
              />

              <div className="grid grid-cols-3">
                <div className="w-[80%]">
                  <h3 className="font-">Genres</h3>
                  <p className="italic font-light">
                    {genres.length > 0
                      ? genres.map((genre) => genre.name).join(", ")
                      : "No genres available"}
                  </p>
                </div>

                <div>
                  <h3>Release Date</h3>
                  <p className="italic font-light">{releaseDate}</p>
                </div>

                <div>
                  <h3>Platforms</h3>
                {platforms.length > 0 &&
                  platforms.map((platform, index) => (
                    <span onClick={() => console.log("Head to Console Page")} key={index} className="italic font-light hover:underline hover:text-primaryPurple=500 cursor-pointer inline">
                      {platform.name}
                      <br />
                    </span>
                  ))}
                </div>

                {/* {platforms?.length > 0 && (
                  <div className="grid grid-cols-2  w-full max-w-sm">
                    {platforms.map((platform, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <img
                          src={platform.logo}
                          alt={`${platform.name} icon`}
                          className="w-8 h-8 object-contain rounded  transition duration-300 group-hover:brightness-125 filter invert"
                        />
                      </div>
                    ))}
                  </div>
                )} */}
              </div>

              <HorizontalLine
                marginTop="mt-8"
                marginBottom="mb-8"
                width="w-full"
              />

              <div className="grid grid-cols-[33%_33%_auto]">
                <div className=" flex-col self-start">
                  <h3 className="font-bold">Developers</h3>

                  {developers.length > 0 &&
                    developers.map((developer, index) => (
                      <span onClick={() => handleCompanyClick(developer.id)}  key={index} className="italic font-light hover:underline hover:text-primaryPurple-500 cursor-pointer inline ">
                        {developer.name}
                        <br />
                      </span>
                    ))}
                </div>


                <div>
                  <h3 className="font-bold">Publisher</h3>
                  {publishers.length > 0 &&
                    publishers.map((publisher, index) => (
                      <span onClick={() => handleCompanyClick(developer.id)}  key={index} className="italic font-light hover:underline hover:text-primaryPurple-500 cursor-pointer inline ">
                        {publisher.name}
                        <br />
                      </span>
                    ))}
                </div>



                <div className="flex justify-center">
                  {ageRatings.some((rating) => rating.category === 1) ? (
                    ageRatings
                      .filter((rating) => rating.category === 1)
                      .map((rating) => (
                        <div key={rating.id} className="p-2">
                          <img
                            src={getRatingIconUrl(
                              rating.category,
                              rating.rating
                            )}
                            alt={`Rating: ${rating.rating}`}
                            className="rating-image w-[50px] h-auto"
                          />
                        </div>
                      ))
                  ) : (
                    <p>Rating Unavailable</p>
                  )}
                </div>
              </div>

              {/* Additional Media */}
              <div className="my-12">
                <h1 className="text-2xl font-semibold mb-2">Media</h1>
                {/* EmblaCarousel */}
                <EmblaCarousel slides={screenshots} options={{ loop: true }} />
              </div>
            </div>

            <div>
              <div className="bg-customBlack rounded h-[auto] mt-auto w-[90%] ml-12 drop-shadow-xl">
                <div className="flex flex-col gap-2 p-4">
                  <div className="text-sm font-bold uppercase ">Rating</div>
                  {/* Display Numerical Rating (Converted to out of 5) */}
                  <div className="text-4xl font-extrabold text-yellow-400">
                    {gameDetails.rating
                      ? (gameDetails.rating / 20).toFixed(1) + " / 5"
                      : "Unrated"}
                  </div>
                  <div className="flex gap-1">
                    {Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <svg
                          key={i}
                          className={`h-6 w-6 ${
                            i < Math.round(gameDetails.rating / 20)
                              ? "text-yellow-400"
                              : "text-gray-300"
                          } fill-current`}
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2l2.7 8H22l-6.9 5 2.7 8L12 18l-6.9 5 2.7-8L2 10h7.3L12 2z" />
                        </svg>
                      ))}
                  </div>

                  <div className="text-xs text-gray-500">
                    {gameDetails.totalRatings
                      ? `${gameDetails.totalRatings} Ratings`
                      : "No ratings available"}
                  </div>
                </div>
              </div>

              <div className="bg-customBlack rounded h-auto w-[90%] ml-12 mt-14 drop-shadow-xl">
                {/* YOUR OPTIONS (MARK AS PLAYING BACKLOG ETC.) */}
                <div className="flex flex-col gap-2 p-4">
                  {/* Options */}
                  <div className="text-sm font-bold uppercase mb-2">You</div>

                  <div className="flex flex-cols-4 justify-center w-full">
                    <GameStatus gameId={String(gameDetails.id)} />
                  </div>

                  <div className="w-[full]">
                    <p className="text-sm font-bold uppercase mt-8 mb-2">
                      Your Star Rating
                    </p>
                    <div className="flex">
                      <StarRating gameId={String(gameDetails.id)} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-16 pl-12">
                <h3 className="font-semibold">Summary</h3>
                {/* <p className="font-light -mr-24">{summary}</p> */}

                <div>
                  <p
                    className={`font-light -mr-24 ${
                      showMore ? "" : "line-clamp-5 overflow-hidden"
                    }`}
                    style={{
                      display: "-webkit-box",
                      WebkitBoxOrient: "vertical",
                      WebkitLineClamp: showMore ? "none" : 5,
                    }}
                  >
                    {summary}
                  </p>
                  <button
                    onClick={() => setShowMore(!showMore)}
                    className="text-primaryPurple mt-2"
                  >
                    {showMore ? "See Less" : "See More"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="relative text-white mx-[15%] mt-7">
            {/* Main Content */}
            {similarGames && similarGames.length > 0 && (
              <h1 className="text-2xl font-semibold mb-2">Similar Games</h1>
            )}
            <div className="relative z-20">
              <div className="w-full">
                <div className="absolute top-0 left-0 h-full w-16 bg-gradient-to-r from-customBlack via-transparent to-transparent z-10 pointer-events-none"></div>
                <div className="absolute top-0 right-0 h-full w-16 bg-gradient-to-l from-customBlack via-transparent to-transparent z-10 pointer-events-none"></div>
                {/* Add carousel for similar games */}
                {similarGames && similarGames.length > 0 && (
                  <SimilarGamesCarousel
                    slides={similarGames}
                    onGameClick={handleSimilarGameClick}
                  />
                )}
              </div>
            </div>
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default GamePage;
