import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Tilt } from "react-tilt";
import axios from "axios";
import Header from "../components/Header";
import Footer from "../components/Footer";
import HorizontalLine from "../components/HorizontalLine";
import GameCard from "../components/GameCard";
import { useNavigate } from "react-router-dom";
import Pagination from "../components/Pagination";
const DeveloperPage = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get company ID from URL
  const [companyDetails, setCompanyDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState("total_rating desc");
  const [headerGames, setHeaderGames] = useState([]);
  const [paginatedGames, setPaginatedGames] = useState([]); // Stores paginated game list
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = companyDetails?.pagination?.totalPages || 1;

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

  const handleClick = (gameId) => {
    navigate(`/game/${gameId}`);
  };

  useEffect(() => {
    if (id) {
      fetchHeaderGames(id, sortOption);
      fetchPaginatedGames(id, sortOption, 1);
    }
  }, [id, sortOption]);

  const fetchHeaderGames = async (companyId, sorting) => {
    try {
      const response = await axios.post("http://localhost:5000/api/company", {
        id: companyId,
        sortOption: sorting,
        page: 1,
        limit: 30,
      });

      setHeaderGames(response.data.developedGames || []);

      // ✅ Set company details if response is valid
      if (response.data) {
        setCompanyDetails(response.data);
      }

    } catch (error) {
      console.error("Error fetching header games:", error.response?.data || error.message);
    }
  };


  const fetchPaginatedGames = async (companyId, sorting, page = 1) => {
    try {
      setLoading(true);

      const response = await axios.post("http://localhost:5000/api/company", {
        id: companyId,
        sortOption: sorting,
        page: page,
        limit: 30,
      });

      setPaginatedGames(response.data.developedGames || []);
      setCurrentPage(response.data.pagination.currentPage);

      setCompanyDetails((prevDetails) => ({
        ...prevDetails,
        pagination: response.data.pagination,
      }));


    } catch (error) {
      console.error("Error fetching paginated games:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePageClick = (pageNumber) => {
    fetchPaginatedGames(id, sortOption, pageNumber);
  };

  const renderPageNumbers = () => {
    return Array.from({ length: totalPages }, (_, index) => {
      const pageNumber = index + 1;
      return (
        <button
          key={pageNumber}
          onClick={() => handlePageClick(pageNumber)}
          className={`px-2 py-1 m-1 border rounded ${pageNumber === currentPage ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          {pageNumber}
        </button>
      )
    })
  }

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

  return (
    <div className="h-[100%]">
    <Header showSearchBar={true} showNavButtons={true} showLoginButtons={true} zIndex={20} />

    <div className="relative w-full max-h-[75vh] overflow-hidden mt-8">
      {/* Background Grid */}
      <div>
        <div className="grid grid-cols-8 gap-2">
          {headerGames.length > 0 ? (
            headerGames.map((game, index) => (
              <div key={index}>
                {game.cover ? (
                  <img src={game.cover} alt={`${game.name} Cover`} className="opacity-60" />
                ) : (
                  <div className="text-white">No Image</div>
                )}
              </div>
            ))
          ) : (
            // Skeleton for header games
            <div className="animate-pulse grid grid-cols-8 h-[400px] gap-2"></div>
          )}
        </div>

        {/* Gradients */}
        <div>
          <div
            className="absolute top-0 h-[100%] w-full pointer-events-none z-10"
            style={{ background: "linear-gradient(to bottom, #121212 0%, transparent 60%)" }}
          ></div>
          <div
            className="absolute bottom-0 h-[100%] w-full pointer-events-none z-10"
            style={{ background: "linear-gradient(to top, #121212 25%, transparent 85%)" }}
          ></div>
        </div>
      </div>

      <div className="absolute z-50 top-0 mx-[15%] h-full flex flex-col justify-center">
        {/* Game Name / Company Info */}
        <div className="bg-customBlack p-8 rounded-lg drop-shadow-lg bg-opacity-70">
          {loading ? (
            // Skeleton for company header
            <div className="animate-pulse space-y-4">
              <div className="w-32 h-32 bg-gray-300 rounded"></div>
              <div className="w-48 h-6 bg-gray-300"></div>
              <div className="w-24 h-4 bg-gray-300"></div>
            </div>
          ) : (
            <>
              {companyDetails.logo && (
                <img
                  src={companyDetails.logo}
                  alt={`${companyDetails.name} Logo`}
                  className="w-74"
                />
              )}
              <div className="flex flex-col items-start mt-4">
                <p className="text-xl">{companyDetails.name}</p>
                <p className="italic text-lg">({companyDetails?.startDate || ""})</p>
              </div>
              {companyDetails.websites && companyDetails.websites.length > 0 && (
                <div className="italic font-light text-s flex items-center pt-2">
                  <img
                    src="./../public/icons/newTab.svg"
                    alt="Ico"
                    className="pr-2 w-[40px]"
                  />
                  {companyDetails.websites.map((website, index) => (
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
    </div>

    {companyDetails && companyDetails.description && (
      <div className="mx-[15%] ">
        <h1 className="text-xl">About {companyDetails.name}</h1>
        <br />
        <p className="mr-[50%]">{companyDetails.description}</p>
      </div>
    )}

    <div className="mx-[15%] mt-[30px]">
      <div className="flex justify-between mb-2">
        <h1 className="text-xl">List of games from {companyDetails?.name || "..."}</h1>
        <select
          onChange={(e) => setSortOption(e.target.value)}
          className="px-2 bg-customBlack border border-1 text-white rounded"
          value={sortOption}
        >
          <option value="total_rating desc">Top Rated</option>
          <option value="popularity desc">Most Popular</option>
          <option value="release_dates.y desc">Newest Releases</option>
          <option value="hypes desc">Most Hyped</option>
          <option value="follows desc">Most Followed</option>
        </select>
      </div>

      <HorizontalLine marginTop="mt-0" marginBottom="mb-8" width="w-full" />

      {loading ? (
        // Skeleton for game cards
        <div className="mt-[20px] grid grid-cols-5 gap-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="animate-pulse p-4 rounded-lg">
              <div className="bg-gray-300 h-[200px] w-full mb-4"></div>
              <div className="h-4 bg-gray-300 mb-2"></div>
              <div className="h-4 bg-gray-300 w-1/2"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-[20px] grid grid-cols-5 gap-2">
          {paginatedGames.map((game, index) => {
            const backgroundColor = getBackgroundColor((game.totalRating || 0) / 20);
            return (
              <div key={index} className="relative rounded-lg p-4">
                {/* Game Cover */}
                {game.cover ? (
                  <Tilt options={defaultOptions} style={{ width: "100%" }}>
                    <div onClick={() => handleClick(game.id)}>
                      <GameCard src={game.cover} alt={game.name} className="h-[auto]" />
                    </div>
                  </Tilt>
                ) : (
                  <div className="text-white flex h-[200px]">No Image Available</div>
                )}

                {/* Game Info */}
                <div className="mt-2">
                  <p className="text-white font-bold hover:text-primaryPurple-500 cursor-pointer" onClick={() => handleClick(game.id)}>
                    {game.name} <span className="italic font-light">({game.releaseYear})</span>
                  </p>

                  <div className="flex flex-row">
                    <div
                      className="w-[30px] h-[25px] flex items-center justify-center text-sm font-bold rounded"
                      style={{
                        backgroundColor: game.totalRating ? backgroundColor : "gray",
                        color: "#121212",
                      }}
                    >
                      {game.totalRating ? ((game.totalRating / 20).toFixed(1)) : "N/A"}
                    </div>

                    <p className="pl-2 font-thin italic">{game.totalRatingCount} Ratings </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}




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

export default DeveloperPage;
