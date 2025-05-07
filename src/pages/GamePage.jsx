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
import { slugify } from "../services/slugify.js";
import { getEmbedUrl } from "../services/getEmbedUrl.js";

const GamePage = () => {
  const { id } = useParams(); // Get the game ID from the URL
  const [gameDetails, setGameDetails] = useState(null); // Store details about the game
  const [logos, setLogos] = useState(null); // Store SteamGridDB logos
  const [heroes, setHeroes] = useState(null); // Store heroes
  const [loading, setLoading] = useState(true); // Tracks if data is being fetched
  const [showMore, setShowMore] = useState(false);
  const [trailer, setTrailer] = useState(null);
  const [logoError, setLogoError] = useState(false);
  const [developerError, setDeveloperError] = useState(false);
  const [showSeeMoreButton, setShowSeeMoreButton] = useState(false);
  const synopsisRef = useRef(null);
  const safeSummary = gameDetails?.summary || "";
  const [mainMediaIndex, setMainMediaIndex] = useState(0);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [showVideoPlayer, setShowVideo] = useState(false);

  useEffect(() => {
    fetchGameData();
    const scrollContainer = document.querySelector(".scrollable-container");
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: "auto" });
    }
  }, [id]);

  const fetchGameData = async () => {
    try {
      const gameResponse = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/game`,
        { id },
        { params: { includeScreenshots: true } }
      );

      // Update main game data
      setGameDetails(gameResponse.data);
      console.log("Game Details:", gameResponse.data);

      setHeroes(gameResponse.data.heroes?.url || "/images/default_game_cover.png");
      setLogos(gameResponse.data.logos?.url || "/images/default_game_cover.png");
      setTrailer(gameResponse.data.video || null);

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

  const buildMediaArray = () => {
    const media = [];
    if (trailer) media.push({ type: "video", data: trailer });
    if (gameDetails?.screenshots?.length) {
      media.push(
        ...gameDetails.screenshots.map((src) => ({ type: "img", data: src }))
      );
    }
    return media;
  };

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

  const sliderSettings = {
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

  const hasAgeRating = ageRatings.some((r) => r.category === 1);
  const media = buildMediaArray();

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
          {heroes ? (
            <img
              src={"../../images/heroFallback2.png"} // Use the first hero
              alt="Game Hero"
              className="w-full h-full object-cover " // Adjust height for proportional scaling
              draggable="false"
            />
          ) : gameDetails.screenshots && gameDetails.screenshots.length > 0 ? (
            <img
              src={gameDetails.screenshots[0]} // Use the first screenshot as a fallback
              alt={`${name} Screenshot`}
              className="w-full h-full object-cover" // Adjust height for proportional scaling
            />
          ) : (
            <img
              src={"../images/coverFallback.png"} // Use the first screenshot as a fallback
              alt={`${name} Screenshot`}
              className="w-full h-full object-cover" // Adjust height for proportional scaling
            />          )}
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
              <Tilt options={defaultOptions} className="inline-block relative">
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
                {Array.isArray(developers) && developers.length > 0 && developers[0].logo && !developerError ? (
                  <a
                    href={`/company/${developers[0].id}/${slugify(
                      developers[0].name
                    )}?tab=developed`}
                  >
                    <DynamicLogo
                      url={developers[0].logo}
                      onError={() => setDeveloperError(true)}
                      draggable="false"
                      gameName={name}
                      maxSize={"w-24"}
                      minSize={"w-12"}
                    />
                  </a>
                ) : (
                  <div className="flex gap-2">
                    {/* Developer Names */}
                    {developers.length > 0 &&
                      developers.map((developer, index) => (
                        <a
                          href={`/company/${developer.id}/${slugify(
                            developer.name
                          )}?tab=developed`}
                          key={index}
                          className="italic font-light text-sm hover:text-primaryPurple-500"
                        >
                          {developer.name}
                        </a>
                      ))}
                  </div>
                )}

                {/* Game Logo */}
                {logos && !logoError ? (
                  <DynamicLogo
                    url={logos}
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
                  {Array.isArray(genres) && genres.length > 0 ? (
                    genres.map((genre, index) => (
                      <span key={genre.id}>
                        <a
                          href={`/genre/${genre.id}/${slugify(genre.name)}`}
                          className="italic font-light hover:font-semibold hover:text-primaryPurple-500 cursor-pointer inline"
                        >
                          {genre.name}
                        </a>
                        {index < genres.length - 1 && ", "}
                      </span>
                    ))
                  ) : (
                    <span className="italic font-light">Unknown Genre</span>
                  )}
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
                        <a
                          href={`/platform/${platform.id}/${slugify(
                            platform.name
                          )}`}
                          className="italic font-light hover:font-semibold hover:text-primaryPurple-500 cursor-pointer inline"
                        >
                          {platform.name}
                        </a>
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
                        <a
                          href={`/company/${developer.id}/${slugify(
                            developer.name
                          )}?tab=developed`}
                          key={index}
                          className="italic font-light hover:font-semibold hover:text-primaryPurple-500 cursor-pointer inline "
                        >
                          {developer.name}
                        </a>
                        {index < developers.length - 1 && ", "}
                      </span>
                    ))}
                </div>

                <div className="flex-col self-center pr-2">
                  <h3 className="font-bold">Publishers</h3>
                  {publishers.length > 0 &&
                    publishers.map((publisher, index) => (
                      <span key={index}>
                        <a
                          href={`/company/${publisher.id}/${slugify(
                            publisher.name
                          )}?tab=published`}
                          className="italic font-light hover:font-semibold hover:text-primaryPurple-500 cursor-pointer inline "
                        >
                          {publisher.name}
                        </a>
                        {index < publishers.length - 1 && ", "}
                      </span>
                    ))}
                </div>

                <div
                  className={
                    `flex items-center pr-2 ` +
                    (hasAgeRating ? "justify-center" : "justify-start")
                  }
                >
                  {" "}
                  {hasAgeRating ? (
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
                    <p className="justid">Rating Unavailable</p>
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
              {gameDetails?.screenshots.length > 0 && (
                <div className="my-8">
                  <h2 className="text-base font-semibold mb-2">Media</h2>
                  <div></div>

                  {/* Main viewer */}
                  <div className="relative rounded aspect-video overflow-hidden flex justify-center items-center mb-2">
                    {media[mainMediaIndex]?.type === "video" ? (
                      showVideoPlayer ? (
                        <iframe
                          src={`${getEmbedUrl(media[0].data)}?autoplay=1&modestbranding=1`}
                          title={media[0].data.name}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="w-full h-full"
                        />
                      ) : (
                        <button className="relative w-full h-full group" onClick={() => setShowVideo(true)}>
                          <img
                            src={`https://img.youtube.com/vi/${media[0].data.video_id}/hqdefault.jpg`}
                            alt={media[0].data.name}
                            className="absolute inset-0 w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-20 h-20 text-white/90 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </button>
                      )
                    ) : (
                      <>
                        {/* blurred background */}
                        <img src={media[mainMediaIndex].data} alt="" className="absolute w-full h-full object-cover blur-md scale-110 opacity-50" />
                        <img src={media[mainMediaIndex].data} alt="Game Screenshot" className="relative w-full h-full object-contain" onClick={() => setOverlayOpen(true)} />
                        {overlayOpen && <ImageOverlay src={media[mainMediaIndex].data} alt={`Screenshot of ${name}`} onClose={() => setOverlayOpen(false)} />}
                      </>
                    )}
                  </div>
                  {/* Thumbnails carousel */}
                  <Slider {...sliderSettings} className="px-6">
                    {media.slice(0, 8).map((m, idx) => (
                      <div key={idx} className="px-1 cursor-pointer" onClick={() => { setMainMediaIndex(idx); setShowVideo(false); }}>
                        {m.type === "video" ? (
                          <img src={`https://img.youtube.com/vi/${m.data.video_id}/default.jpg`} alt={m.data.name} className={`rounded ${idx === mainMediaIndex ? "opacity-100" : "brightness-50 hover:brightness-100"}`} />
                        ) : (
                          <img src={m.data} alt={`Screenshot ${idx + 1}`} className={`h-full rounded ${idx === mainMediaIndex ? "opacity-100" : "brightness-50 hover:brightness-100"}`} />
                        )}
                      </div>
                    ))}
                  </Slider>
                </div>
              )}

              <div className="lg:block md:hidden sm:hidden ">
                <h1 className="text-base font-semibold mt-4">Reviews</h1>
                <HorizontalLine
                  marginTop="mt-0"
                  width="full"
                  marginBottom="mb-8"
                />
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

                  <div className="text-xs text-gray-500 pt-1">
                    {gameDetails.totalRatings
                      ? `${gameDetails.totalRatings} Ratings`
                      : "Be the first to rate!"}
                  </div>
                </div>
              </div>

              <div className="bg-customBlack rounded h-auto w-[90%] ml-12 mt-14 drop-shadow-xl">
                {/* YOUR OPTIONS (MARK AS PLAYING BACKLOG ETC.) */}
                <div className="flex flex-col gap-2 lg:px-4 lg:py-8 md:p-2">
                  {/* Options */}
                  <div className="flex px-2 flex-cols-4 justify-center w-full">
                    <GameStatus
                      gameId={String(gameDetails.id)}
                      releaseDate={gameDetails.rawReleaseDate}
                    />
                  </div>

                  <div className="px-2 w-full">
                    <p className="text-sm font-semibold uppercase mt-4 pl-4 mb-2">
                      Rate
                    </p>
                    <div className="lex justify-center items-center w-full">
                      <StarRating
                        gameId={String(gameDetails.id)}
                        releaseDate={gameDetails.rawReleaseDate}
                      />
                    </div>
                  </div>

                  <div className="px-2 w-full">
                    <p className="text-sm font-semibold uppercase mt-4 pl-4 mb-2">
                      Review
                    </p>
                    <ReviewBox
                      gameDetails={gameDetails}
                      releaseDate={gameDetails.rawReleaseDate}
                    />
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
