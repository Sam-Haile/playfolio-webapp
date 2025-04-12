import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import Footer from "../components/Footer";
import HorizontalLine from "../components/HorizontalLine";
import ResultCard from "../components/ResultCard";
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
  const [activeTab, setActiveTab] = useState("developed");

  // New state for visual type (detailed, compact, or list)
  const [visualType, setVisualType] = useState("detailed");

  // Array to hold the visual type options and corresponding icons
  const visualTypes = [
    { type: "detailed", icon: "./src/assets/icons/detailedView.svg" },
    { type: "compact", icon: "./src/assets/icons/compactView.svg" },
    { type: "list", icon: "./src/assets/icons/listView.svg" },
  ];

  // Handler to set the visual type
  const handleVisualTypeChange = (type) => {
    console.log("Visual Type: ", type);
    setVisualType(type);
  };

  const handleClick = (gameId) => {
    navigate(`/game/${gameId}`);
  };

  useEffect(() => {
    if (id) {
      fetchHeaderGames(id, "total_rating desc", activeTab);
      // Header games = top 30 by rating; call paginated list for page 1.
      fetchPaginatedGames(id, sortOption, 1, activeTab);
    }
  }, [id, sortOption, activeTab]);

  const fetchHeaderGames = async (companyId, sorting, gameType) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/company`,
        {
          id: companyId,
          sortOption: sorting,
          page: 1,
          limit: 30,
          gameType: gameType, // Pass the active tab value ("developed" or "published")
        }
      );

      const tabKey = gameType === "developed" ? "publishedGames" : "developedGames";
      setHeaderGames(response.data[tabKey] || []);

      if (response.data) {
        setCompanyDetails(response.data);
      }
    } catch (error) {
      console.error(
        "Error fetching header games:",
        error.response?.data || error.message
      );
    }
  };

  const fetchPaginatedGames = async (companyId, sorting, page = 1, gameType = "developed") => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/company`,
        {
          id: companyId,
          sortOption: sorting,
          page: page,
          limit: 30,
          gameType: gameType,
        }
      );

      // Use the appropriate key based on the active tab
      const tabKey = activeTab === "published" ? "publishedGames" : "developedGames";
      setPaginatedGames(response.data[tabKey] || []);
      setCurrentPage(response.data.pagination.currentPage);
      setCompanyDetails((prevDetails) => ({
        ...prevDetails,
        pagination: response.data.pagination,
      }));
    } catch (error) {
      console.error(
        "Error fetching paginated games:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePageClick = (pageNumber) => {
    fetchPaginatedGames(id, sortOption, pageNumber, activeTab);
  };

  // Render the list of page numbers (if not using a separate Pagination component)
  const renderPageNumbers = () => {
    return Array.from({ length: totalPages }, (_, index) => {
      const pageNumber = index + 1;
      return (
        <button
          key={pageNumber}
          onClick={() => handlePageClick(pageNumber)}
          className={`px-2 py-1 m-1 border rounded ${
            pageNumber === currentPage
              ? "bg-blue-500 text-white"
              : "bg-gray-200"
          }`}
        >
          {pageNumber}
        </button>
      );
    });
  };

  // The DeveloperPage JSX
  return (
    <div className="h-[100%]">
      <Header
        showSearchBar={true}
        showNavButtons={true}
        showLoginButtons={true}
        zIndex={20}
      />

      <div className="relative w-full max-h-[75vh] overflow-hidden mt-8">
        {/* Background Grid */}
        <div>
          <div className="grid grid-cols-8 gap-2">
            {headerGames.length > 0 ? (
              headerGames.map((game, index) => (
                <div key={index}>
                  {game.cover ? (
                    <div className="w-full h-[160px] overflow-hidden">
                      <img
                        src={game.cover}
                        alt={`${game.name} Cover`}
                        className="w-full h-full object-cover opacity-60"
                      />
                    </div>
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
        </div>

        <div className="absolute z-50 top-0 mx-[15%] h-full flex flex-col justify-center">
          {/* Company Info */}
          <div className="bg-customBlack p-8 rounded-lg drop-shadow-lg bg-opacity-70">
            {loading ? (
              <div className="animate-pulse space-y-4">
                <div className="w-32 h-32 bg-gray-300 rounded"></div>
                <div className="w-48 h-6 bg-gray-300"></div>
                <div className="w-24 h-4 bg-gray-300"></div>
              </div>
            ) : (
              <>
                {companyDetails?.logo && (
                  <img
                    src={companyDetails.logo}
                    alt={`${companyDetails.name} Logo`}
                    className="w-74"
                  />
                )}
                <div className="flex flex-col items-start mt-4">
                  <p className="text-xl">{companyDetails?.name}</p>
                  <p className="italic text-lg">
                    ({companyDetails?.startDate || ""})
                  </p>
                </div>
                {companyDetails?.websites &&
                  companyDetails.websites.length > 0 && (
                    <div className="italic font-light text-s flex items-center pt-2">
                      <img
                        src="./../public/icons/newTab.svg"
                        alt="Ico"
                        className="pr-2 w-[40px]"
                      />
                      {companyDetails?.websites.map((website, index) => (
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
        <div className="mx-[15%]">
          <h1 className="text-xl">About {companyDetails.name}</h1>
          <br />
          <p className="mr-[5%]">{companyDetails.description}</p>
        </div>
      )}

      <div className="mx-[15%] mt-[30px]">
        <div className="flex justify-between mb-2">
          <h1 className="text-xl">
            List of games from {companyDetails?.name || "…"}
          </h1>
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

        <div className="flex gap-4 mb-4">
          <button
            onClick={() => setActiveTab("developed")}
            className={activeTab === "developed" ? "font-bold underline" : ""}
          >
            Developed
          </button>
          <button
            onClick={() => setActiveTab("published")}
            className={activeTab === "published" ? "font-bold underline" : ""}
          >
            Published
          </button>
        </div>

        <HorizontalLine marginTop="mt-0" marginBottom="mb-8" width="w-full" />

        {/* Visual Type Controls */}
        <div className="flex justify-end mb-4">
          <div className="flex space-x-2">
            {visualTypes.map(({ type, icon }) => (
              <button
                key={type}
                onClick={() => handleVisualTypeChange(type)}
                className={`p-2 rounded ${
                  visualType === type
                    ? "bg-primaryPurple-500"
                    : "bg-customBlack"
                } border border-1 text-white hover:bg-primaryPurple-700 transition`}
              >
                <img src={icon} alt={`${type} view`} className="w-[25px]" />
              </button>
            ))}
          </div>
        </div>

        {/* Render Games in different visual styles */}
        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            {/* If using a list view, you could add a header row */}
            {visualType === "list" && (
              <div>
                <div className="grid grid-cols-[35%_25%_25%_15%] items-center gap-4 w-full">
                  <div>
                    <p>Game</p>
                  </div>
                  <div>
                    <p>Developer</p>
                  </div>
                  <div>
                    <p>Genre</p>
                  </div>
                  <div>
                    <p>Rating</p>
                  </div>
                </div>
                <HorizontalLine marginTop="mt-2" marginBottom="mb-2" width="full" />
              </div>
            )}
            <div
              className={`${
                visualType === "detailed"
                  ? "grid grid-flow-row grid-cols-1 w-full lg:grid-cols-2"
                  : visualType === "list"
                  ? "grid grid-cols-1 gap-4"
                  : "grid grid-cols-7 gap-4 md:grid-cols-5 sm:grid-cols-3 xs:grid-cols-2"
              }`}
            >
              {console.log("PaginatedGames:", paginatedGames)}

            </div>
          </>
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
