import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import HorizontalLine from "../components/HorizontalLine";
import "../styles/embla.css";
import { Tilt } from "react-tilt";
import SkeletonLoading from "../components/SkeletonLoading";
import Footer from "../components/Footer";
import GameStatus from "../components/GameStatus";
import StarRating from "../components/StarRating";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import DynamicLogo from "../components/DynamicLogo";
import ReviewEntry from "../components/ReviewEntry";
import ImageOverlay from "../components/ImageOverlay";
import ReviewBox from "../components/ReviewBox";
import GameReviews from "../components/GameReviews";

const GamePage = () => {
  const { id } = useParams(); // Get the game ID from the URL
  const [gameDetails, setGameDetails] = useState(null); // Store details about the game
  const [screenshots, setScreenshots] = useState([]); // Store artworks separately
  const [logos, setLogos] = useState([]); // Store SteamGridDB logos
  const [loading, setLoading] = useState(true); // Tracks if data is being fetched
  const [heroes, setHeroes] = useState([]); // Store heroes
  const [showMore, setShowMore] = useState(false);
  const navigate = useNavigate();
  const [logoError, setLogoError] = useState(false);
  const [developerError, setDeveloperError] = useState(false);
  const [showSeeMoreButton, setShowSeeMoreButton] = useState(false);
  const synopsisRef = useRef(null);
  const safeSummary = gameDetails?.summary || "";
  const [mainScreenshotIndex, setMainScreenshotIndex] = useState(0);
  const [overlayOpen, setOverlayOpen] = useState(false);

  useEffect(() => {
    fetchGameData();
    const scrollContainer = document.querySelector(".scrollable-container");
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: "auto" });
    }
  }, [id]);

  const handleDeveloperClick = (companyId) => {
    navigate(`/developer/${companyId}?tab=developed`);
  };

  const handlePublisherClick = (companyId) => {
    navigate(`/developer/${companyId}?tab=published`);
  };

  const fetchGameData = async () => {
    try {
      const gameResponse = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/game`,
        {
          id,
        }
      );

      // Update main game data
      setGameDetails(gameResponse.data);

      // Fetch and process other data (screenshots, heroes, logos)
      let screenshotsResponse = { data: [] };
      let sortedScreenshots = [];
      let heroesResponse = { data: { heroes: [] } };
      let logosResponse = { data: { logos: [] } };

      try {
        screenshotsResponse = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/screenshots`,
          { gameId: id }
        );
        sortedScreenshots = [...screenshotsResponse.data].sort((a, b) => {
          return a.id - b.id; // Sort by ID for stable ordering
        });
      } catch (err) { }

      try {
        heroesResponse = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/steamgriddb/heroes`,
          {
            gameName: gameResponse.data.name,
          }
        );
      } catch (err) { }

      try {
        logosResponse = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/steamgriddb/logos`,
          {
            gameName: gameResponse.data.name,
          }
        );
      } catch (err) { }

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

  useEffect(() => {
    const el = synopsisRef.current;
    if (!el) return;

    const observer = new ResizeObserver(() => {
      const isOverflowing = el.scrollHeight > el.clientHeight;
      setShowSeeMoreButton(isOverflowing || showMore); // <-- key change here
    });

    observer.observe(el);

    return () => observer.disconnect();
  }, [safeSummary, loading, showMore]);

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

  const settings = {
    centerMode: false,
    infinite: true,
    centerPadding: "0px",
    slidesToShow: 6,
    speed: 500,
    draggable: true,
    swipe: true,
    arrows: true,
    swipeToSlide: true,
  };

  return (
    <div className="h-[100%]">
        <Header
          showSearchBar={true}
          showNavButtons={true}
          showLoginButtons={true}
          zIndex={1000}
        />

      <div className="bg-white h-[75vh] mt-8 ">
        <div className="pt-18 bg-white h-[75vh] absolute top-0 w-full flex items-center justify-center overflow-hidden pointer-event:none">
          {heroes && heroes.length > 0 ? (
            <img
              src={heroes[0].url} // Use the first hero
              alt="Game Hero"
              className="w-full h-full object-cover " // Adjust height for proportional scaling
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
            className="absolute top-0 -mt-[1px] h-[100%] w-full pointer-events-none z-10"
            style={{
              background:
                "linear-gradient(to bottom, #121212 8%, transparent 80%)",
            }}
          ></div>
          <div
            className="absolute bottom-0 -mb-[1px] h-[100%] w-full pointer-events-none z-10"
            style={{
              background:
                "linear-gradient(to top, #121212 30%, transparent 85%)",
            }}
          ></div>
        </div>

        <div className="absolute inset-0 bg-customBlack bg-opacity-0 z-30">
          <div className="h-auto mt-64 grid grid grid-cols-1 sm:grid-cols-[auto_50%] lg:grid-cols-[auto_35%_45%] mx-[15%]">
            <div className="relative self-end">
              <Tilt
                options={defaultOptions}
                className="inline-block relative"
              >
                {" "}
                {cover && (
                  <img
                    src={`https://images.igdb.com/igdb/image/upload/t_1080p/${cover.image_id}.jpg`}
                    alt={`${name} Logo`}
                    className="w-auto h-auto rounded overflow-hidden"
                    draggable="false"
                  />
                )}
              </Tilt>
            </div>
            <div className="grid grid-rows-[auto] h-auto self-end pl-4">
              <div className="flex flex-col items-start gap-2">
                {/* Developer Logo */}
                {developers[0].logo && !developerError ? (
                  <button onClick={() => handleDeveloperClick(developers[0].id)}>
                    <DynamicLogo
                      url={developers[0].logo}
                      onError={() => setDeveloperError(true)}
                      draggable="false"
                      gameName={name}
                      maxSize={"w-24"}
                      minSize={"w-12"}
                    />
                  </button>
                ) : (
                  <div className="flex gap-2">
                    {/* Developer Names */}
                    {developers.length > 0 &&
                      developers.map((developer, index) => (
                        <button
                          onClick={() => handlePublisherClick(developer.id)}
                          key={index}
                          className="italic font-light text-sm hover:text-primaryPurple-500"
                        >
                          {developer.name}
                        </button>
                      ))}
                  </div>
                )}

                {/* Game Logo */}
                {logos && logos.length > 0 && !logoError ? (
                  <DynamicLogo
                    url={logos[0].url}
                    draggable="false"
                    gameName={name}
                    maxSize={"w-96"}
                    minSize={"w-60"}
                    onError={() => setLogoError(true)}
                  />
                ) : (
                  <h3 className="text-3xl font-normal italic lg:whitespace-nowrap  overflow-hidden text-ellipsis">
                    {name} ({releaseYear})
                  </h3>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="mx-[15%] grid grid-cols-[60%_40%]">
            <div className="h-[auto]">
              <HorizontalLine
                marginTop="mt-14"
                marginBottom="mb-4"
                width="w-full"
              />

              <div className="grid grid-cols-3 ">
                <div className="w-[80%] flex-col self-center pr-2">
                  <h3 className="font-">Genres</h3>
                  <p className="italic font-light">
                    {genres.length > 0
                      ? genres.map((genre) => genre.name).join(", ")
                      : "No genres available"}
                  </p>
                </div>

                <div className="flex-col self-center pr-2 font-bold">
                  <h3>Release Date</h3>
                  <p className="italic font-light">{releaseDate}</p>
                </div>

                <div className="flex-col self-center pr-2">
                  <h3>Platforms</h3>
                  {platforms.length > 0 &&
                    platforms.map((platform, index) => (
                      <span key={index}>
                        <span
                          onClick={() => console.log("Head to Console Page")}
                          className="italic font-light hover:underline hover:text-primaryPurple-500 cursor-pointer inline"
                        >
                          {platform.name}
                        </span>
                        {index < platforms.length - 1 && ", "}
                      </span>
                    ))}
                </div>

                {/* {platforms?.length > 0 && (
                  <div className="grid grid-cols-3  w-full max-w-sm">
                    {platforms.map((platform, index) => (
                      <div key={index} className="flex items-center">
                        <img
                          src={platform.logo}
                          alt={`${platform.name} icon`}
                          className="w-18 h-18 object-contain rounded "
                        />
                      </div>
                    ))}
                  </div>
                )}  */}
              </div>

              <HorizontalLine
                marginTop="mt-4"
                marginBottom="mb-4"
                width="w-full"
              />

              <div className="grid grid-cols-[33%_33%_auto]">
                <div className=" flex-col self-center pr-2">
                  <h3 className="font-bold">Developers</h3>

                  {developers.length > 0 &&
                    developers.map((developer, index) => (
                      <span key={index}>
                        <span

                          onClick={() => handleDeveloperClick(developer.id)}
                          key={index}
                          className="italic font-light hover:underline hover:text-primaryPurple-500 cursor-pointer inline "
                        >
                          {developer.name}
                        </span>
                        {index < developers.length - 1 && ", "}
                      </span>
                    ))}
                </div>

                <div className="flex-col self-center pr-2">
                  <h3 className="font-bold">Publishers</h3>
                  {publishers.length > 0 &&
                    publishers.map((publisher, index) => (
                      <span key={index}>
                        <span
                          onClick={() => handlePublisherClick(publisher.id)}
                          className="italic font-light hover:underline hover:text-primaryPurple-500 cursor-pointer inline "
                        >
                          {publisher.name}
                        </span>
                        {index < publishers.length - 1 && ", "}
                      </span>
                    ))}
                </div>

                <div className="flex justify-center items-center pr-2">
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

              <HorizontalLine
                marginTop="mt-4"
                marginBottom="mb-4"
                width="w-full"
              />

              <div>
                <h3 className="font-bold pb-2">Synopsis</h3>
                <p
                  ref={synopsisRef}
                  className={`font-light ${showMore ? "" : "line-clamp-3 overflow-hidden"
                    }`}
                  style={{
                    display: "-webkit-box",
                    WebkitBoxOrient: "vertical",
                    WebkitLineClamp: showMore ? "none" : 3,
                  }}
                >
                  {summary}
                </p>

                {showSeeMoreButton && (
                  <button
                    onClick={() => setShowMore(!showMore)}
                    className="text-primaryPurple hover:font-semibold"
                  >
                    {showMore ? "See Less" : "See More"}
                  </button>
                )}
              </div>

              {/* Additional Media */}
              <div className="my-8">
                <h1 className="text-base font-semibold mb-2">Media</h1>

                <div className="flex flex-col gap-2">
                  {/* Main Screenshot */}
                  <div className="relative w-full aspect-video overflow-hidden rounded cursor-pointer">
                    {/* Background layer (blurred) */}
                    <img
                      src={screenshots?.[mainScreenshotIndex]?.imageUrl}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover blur-md scale-110 opacity-50"
                      aria-hidden="true"
                    />

                    {/* Foreground image */}
                    <img
                      src={screenshots?.[mainScreenshotIndex]?.imageUrl}
                      alt="Game Screenshot"
                      className="relative z-10 w-full h-full object-contain"
                      onClick={() => setOverlayOpen(true)}
                    />


                    {/* Conditionally render the overlay */}
                    {overlayOpen && (
                      <ImageOverlay
                        src={screenshots?.[mainScreenshotIndex]?.imageUrl}
                        alt={`Screenshot of ${name}`}
                        onClose={() => setOverlayOpen(false)}
                      />
                    )}
                  </div>

                  {/* Screenshot Carousel */}
                  <Slider {...settings}>
                    {screenshots.slice(0, 8).map((shot, index) => (
                      <div key={index} className="pr-2">
                        <img
                          src={shot.imageUrl}
                          alt={`Screenshot ${index + 1} of ${name}`}
                          onClick={() => setMainScreenshotIndex(index)}
                          className={`rounded cursor-pointer transition-all duration-200 ${mainScreenshotIndex === index
                            ? "opacity-100 border border-2 border-primaryPurple"
                            : "brightness-75 hover:brightness-100"
                            }`}
                          loading="lazy"
                        />
                      </div>
                    ))}
                  </Slider>
                </div>
              </div>
              <div className="lg:block md:hidden sm:hidden">
                <h1 className="text-base font-semibold">Reviews</h1>
                <HorizontalLine marginTop="mt-0" width="full" marginBottom="mb-8" />
                <GameReviews gameId={String(gameDetails.id)} />
              </div>
            </div>

            <div className="mt-14">
              <div className="bg-customBlack rounded h-[auto] mt-auto w-[90%] ml-12  drop-shadow-xl">
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
                          className={`h-6 w-6 ${i < Math.round(gameDetails.rating / 20)
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
                <div className="flex flex-col gap-2 lg:px-4 lg:py-8 md:p-2">
                  {/* Options */}
                  <div className="flex px-2 flex-cols-4 justify-center w-full">
                    <GameStatus gameId={String(gameDetails.id)} />
                  </div>

                  <div className="px-2 w-full">
                    <p className="text-sm font-semibold uppercase mt-4 pl-4 mb-2">
                      Rate
                    </p>
                    <div className="lex justify-center items-center w-full">
                      <StarRating gameId={String(gameDetails.id)} />
                    </div>
                  </div>

                  <div className="px-2 w-full">
                    <p className="text-sm font-semibold uppercase mt-4 pl-4 mb-2">Review</p>
                    <ReviewBox gameDetails={gameDetails} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mx-[15%] lg:hidden md:block sm:block">
            <h1 className="text-base font-semibold ">Reviews</h1>
            <HorizontalLine marginTop="mt-0" width="full" marginBottom="mb-8" />
            <GameReviews gameId={String(gameDetails.id)} />
          </div>


          <div className="mt-12">
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamePage;
