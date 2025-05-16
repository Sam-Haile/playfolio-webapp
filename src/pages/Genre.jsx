import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import Footer from "../components/Footer";
import HorizontalLine from "../components/HorizontalLine";
import MasonryBoxArtGrid from "../components/MasonryBoxArtGrid"; // Assuming you have this already
import ResultCard from "../components/ResultCard"; // Assuming this exists too
import Pagination from "../components/Pagination"; // Assuming this exists too
import SkeletonLoading from "../components/SkeletonLoading";
import newTabIcon from "../assets/icons/newTab.svg"; // Import the new tab icon

const Genre = () => {
  const { id } = useParams();
  const [genreDetails, setGenreDetails] = useState(null);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visualType, setVisualType] = useState("detailed");
  const [currentPage, setCurrentPage] = useState(1);
  const [gamesPerPage] = useState(24); // adjust as needed
  const [sortOption, setSortOption] = useState("popular");
  const [totalPages, setTotalPages] = useState(1);
  const [heroGames, setHeroGames] = useState([]);
  const [totalGames, setTotalGames] = useState([]);
  const [columns, setColumns] = useState(window.innerWidth < 768 ? 3 : 7);
  
  
  useEffect(() => {
    const handleResize = () => {
      setColumns(window.innerWidth < 768 ? 3 : 7);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Array to hold the visual type options and corresponding icons
  const visualTypes = [
    { type: "detailed", icon: "/src/assets/icons/detailedView.svg" },
    { type: "compact", icon: "/src/assets/icons/compactView.svg" },
    { type: "list", icon: "/src/assets/icons/listView.svg" },
  ];


  useEffect(() => {
    // runs only when the genre id changes
    const fetchHeroGames = async () => {
      try {
        // pick the criterion you want to “lock in” (popular, rating, etc.)
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/genres/games`,
          {
            genreId: id,
            sortOption: "popular", // <-- fixed
            page: 1,
            limit: 70, // plenty for a mosaic
          }
        );
        setHeroGames(data.games); // never overwritten afterwards
      } catch (err) {
        console.error("Error fetching hero games:", err);
      }
    };

    fetchHeroGames();
  }, [id]);

  useEffect(() => {
    fetchGenreData();
  }, [id, sortOption, currentPage]);

  const fetchGenreData = async () => {
    try {
      const genreResponse = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/genre`,
        { id }
      );
      const gamesResponse = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/genres/games`,
        { genreId: id, sortOption, page: currentPage, limit: gamesPerPage }
      );

      setGenreDetails(genreResponse.data);
      setGames(gamesResponse.data.games);
      setTotalPages(gamesResponse.data.pagination.totalPages);
      setTotalGames(gamesResponse.data.pagination.totalGames);
      } catch (error) {
      console.error("Error fetching genre page data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVisualTypeChange = (type) => {
    setVisualType(type);
  };

  const handlePageClick = (page) => {
    setCurrentPage(page);
  };

  if (loading) {
    return <SkeletonLoading type="genre" />;
  }

  if (!genreDetails) {
    return <p>Genre not found.</p>;
  }

  return (
    <div className="h-[100%] relative">
      <Header
        showSearchBar={true}
        showNavButtons={true}
        showLoginButtons={true}
      />

      {/* Hero Background */}
      <div className="relative w-full md:h-[700px] h-[400px] overflow-hidden z-0">
        <div className="absolute top-0 left-0 w-full">
          <MasonryBoxArtGrid images={heroGames} columns={columns} />
        </div>

        {/* Top and Bottom Gradients */}
        <div
          className="absolute top-0 h-full w-full pointer-events-none z-10"
          style={{
            background:
              "linear-gradient(to bottom, #121212 8%, transparent 50%)",
          }}
        />
        <div
          className="absolute bottom-0 h-full w-full pointer-events-none z-10"
          style={{
            background: "linear-gradient(to top, #121212 8%, transparent 50%)",
          }}
        />
      </div>

      {/* Genre Info */}
      <div className="absolute top-0 md:mx-[15%] mx-[10%] md:mt-56 mt-36 flex flex-col justify-center">
        <div className="bg-customBlack w-fit p-8 rounded-lg drop-shadow-lg bg-opacity-90">
          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="w-32 h-32 bg-gray-300 rounded"></div>
              <div className="w-48 h-6 bg-gray-300"></div>
              <div className="w-24 h-4 bg-gray-300"></div>
            </div>
          ) : (
            <>
              {genreDetails?.logo && (
                <img
                  src={genreDetails.logo}
                  alt={`${genreDetails.name} Logo`}
                  className="w-74"
                />
              )}
              <div className="flex flex-col items-start">
                <p className="text-xl font-semibold">
                  {genreDetails?.name}
                </p>
                <p className="text-xl font-light">
                  {totalGames} Games
                </p>
              </div>
              {genreDetails?.websites && genreDetails.websites.length > 0 && (
                <div className="italic font-light text-s flex items-center pt-2">
                  <img src={newTabIcon} alt="Ico" className="pr-2 w-[40px]" />
                  {genreDetails.websites.map((website, index) => (
                    <a
                      key={index}
                      href={website.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primaryPurple-500 underline text-xl"
                    >
                      Official Website
                    </a>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Genre Summary (if exists) */}
      {genreDetails && genreDetails.summary && (
        <div className="md:mx-[15%] mx-[5%] w-full md:mt-8">
          <h1 className="text-xl font-semibold">About {genreDetails.name}</h1>
          <p className="mr-[5%] mt-2">{genreDetails.summary}</p>
        </div>
      )}

      {/* Sort and View Controls */}
      <div className="md:mx-[15%] mx-[5%] mt-12">
        <div className="flex h-12 justify-between items-center">
          <div className="flex items-center">
            <p className="md:block hidden self-center">Sort by: </p>
            <select
              onChange={(e) => {
                setSortOption(e.target.value);
                setCurrentPage(1);
              }}
              className="md:ml-2 px-2 h-8 bg-customBlack border text-white rounded"
              value={sortOption}
            >
              <option value="popular">Popularity</option>
              <option value="rating">Rating</option>
              <option value="release_date">Release Date</option>
              <option value="name">Name A → Z</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            {visualTypes.map(({ type, icon }) => (
              <button
                key={type}
                onClick={() => handleVisualTypeChange(type)}
                className={`p-2 rounded ${
                  visualType === type
                    ? "bg-primaryPurple-500"
                    : "bg-customBlack"
                } border text-white hover:bg-primaryPurple-700 transition`}
              >
                <img src={icon} alt={`${type} view`} className="w-[25px]" />
              </button>
            ))}
          </div>
        </div>

        <HorizontalLine width="w-full" marginTop="mt-2" marginBottom="0" className="mx-[15%]" />
      </div>

      {/* Games Grid */}
      <div className="md:mx-[15%] mx-[5%] mt-[30px]">
        <div className="flex flex-col w-full">
          {visualType === "list" && (
            <div>
              <div className="grid md:grid-cols-[35%_25%_25%_15%] grid-cols-[40%_30%_30%] items-center gap-4 w-full">
                <div>
                  <p>Game</p>
                </div>
                <div>
                  <p>Developer</p>
                </div>
                <div className="hidden md:block">
                  <p>Genre</p>
                </div>
                <div>
                  <p>Rating</p>
                </div>
              </div>
              <HorizontalLine
                marginTop="mt-2"
                marginBottom="mb-2"
                width="full"
              />
            </div>
          )}

          <div
            className={
              visualType === "detailed"
                ? "grid grid-flow-row grid-cols-1 w-full lg:grid-cols-2"
                : visualType === "list"
                ? "grid grid-cols-1 gap-4"
                : "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4"
            }
          >
            {games.length > 0 ? (
              games.map((game) => (
                <ResultCard
                  key={game.id}
                  game={game}
                  onClick={() => {}}
                  visualType={visualType}
                />
              ))
            ) : (
              <p>No games found.</p>
            )}
          </div>
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageClick}
          />
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Genre;
