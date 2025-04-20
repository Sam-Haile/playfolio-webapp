import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import Footer from "../components/Footer";
import HorizontalLine from "../components/HorizontalLine";
import ResultCard from "../components/ResultCard";
import Pagination from "../components/Pagination";
import useWindowWidth from "../components/useWindowWidth";
import MasonryBoxArtGrid from "../components/MasonryBoxArtGrid";
import { trimImages } from "../services/helperFunctions.js";

// Array to hold the visual type options and corresponding icons
const visualTypes = [
  { type: "detailed", icon: "/src/assets/icons/detailedView.svg" },
  { type: "compact", icon: "/src/assets/icons/compactView.svg" },
  { type: "list", icon: "/src/assets/icons/listView.svg" },
];

const DeveloperPage = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get company ID from URL
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState("total_rating desc");
  const [visualType, setVisualType] = useState("compact");
  const [currentPage, setCurrentPage] = useState(1);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const defaultTab = queryParams.get("tab") || "developed";
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [companyDetails, setCompanyDetails] = useState(null);
  const [allGames, setAllGames] = useState([]);
  const [trimmedCount, setTrimmedCount] = useState(0);
  const [paginatedGames, setPaginatedGames] = useState([]);
  const totalPages = companyDetails?.pagination?.totalPages || 1;
  const [headerImagesCount, setHeaderImagesCount] = useState(0);
  const [developedGames, setDevelopedGames] = useState([]);
  const [publishedGames, setPublishedGames] = useState([]);
  const windowWidth = useWindowWidth();
  const trimmedImages = useMemo(() => trimImages(allGames), [allGames]);
  const [totalPublished, setTotalPublished] = useState(0);
  const [totalDeveloped, setTotalDeveloped] = useState(0);

  useEffect(() => {
    if (id) {
      fetchHeaderGames(id, "total_rating desc", activeTab);
      // Header games = top 30 by rating; call paginated list for page 1.
      fetchPaginatedGames(id, sortOption, 1, activeTab);
    }
  }, [id, sortOption, activeTab]);

  // Header games fetches titles to display in the header area of the site
  const fetchHeaderGames = async (companyId, sorting, gameType) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/companyGames`,
        {
          id: companyId,
          sortOption: sorting,
          page: 1,
          limit: 30,
          gameType: "gameType",
        }
      );

      const developedGames = response.data.developedGames || [];
      const publishedGames = response.data.publishedGames || [];
      const allGames = response.data.combinedGames || [];

      setTotalDeveloped(response.data.totalDeveloped);
      setTotalPublished(response.data.totalPublished);

      setDevelopedGames(developedGames);
      setPublishedGames(publishedGames);
      setAllGames(allGames);

      //console.log("Combined Games:", combinedGames);

      if (response.data) {
        setCompanyDetails(response.data.companyDetails); // if your backend returns companyDetails separately
      }
    } catch (error) {
      console.error(
        "Error fetching header games:",
        error.response?.data || error.message
      );
    }
  };

  // Fetches both published and developed games by company
  const fetchPaginatedGames = async (
    companyId,
    sorting,
    page = 1,
    gameType = "developed"
  ) => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/companyGames`,
        {
          id: companyId,
          sortOption: sorting,
          page: page,
          limit: 30,
          gameType: gameType,
        }
      );

      // Use the appropriate key based on the active tab
      const tabKey =
        activeTab === "published" ? "publishedGames" : "developedGames";
      setPaginatedGames(response.data[tabKey] || []);
      setCurrentPage(response.data.companyDetails.pagination.currentPage);
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

  // Handler to set the visual type
  const handleVisualTypeChange = (type) => {
    console.log("Visual Type: ", type);
    setVisualType(type);
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

  const handleClick = (gameId) => {
    navigate(`/game/${gameId}`);
  };

  //console.log("Company Details", companyDetails);
  //console.log("All Games", allGames);
  //console.log("Paginated Games", paginatedGames);
  //console.log(publishedGames);

  useEffect(() => {
    setTrimmedCount(trimmedImages.length);
    console.log("Computed trimmed count:", trimmedImages.length);
  }, [trimmedImages]);

  // Determine the number of columns based on trimmedCount and screen width
  const getColumns = () => {
    if (trimmedCount === 30) {
      return 6;
    } else if (trimmedCount === 15) {
      return windowWidth < 768 ? 3 : 4;
    } else if (trimmedCount === 10) {
      return 2;
    } else if (trimmedCount === 5) {
      return windowWidth < 768 ? 1 : 2;
    } else {
      return 1;
    }
  };

  const columns = getColumns();

  return (
    <div className="h-[100%] relative ">
      <Header
        showSearchBar={true}
        showNavButtons={true}
        showLoginButtons={true}
      />

      <div className="relative w-full h-[700px] overflow-hidden z-0">
        {/* Background Grid */}
        <div className="absolute top-0 left-0 w-full">
          <MasonryBoxArtGrid images={allGames} columns={columns} />
        </div>
        {/* Top Gradient */}
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
            background: "linear-gradient(to top,#121212 8%, transparent 50%)",
          }}
        />
      </div>

      <div className="absolute top-0 mx-[15%] mt-56 flex flex-col justify-center">
        {/* Company Info */}
        <div className="bg-customBlack w-fit p-8 rounded-lg drop-shadow-lg bg-opacity-70">
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

      {companyDetails && companyDetails.description && (
        <div className="mx-[15%]">
          <h1 className="text-xl font-semibold">About {companyDetails.name}</h1>
          <p className="mr-[5%] mt-2">{companyDetails.description}</p>
        </div>
      )}

      <div className="mx-[15%] mt-12">
        <div className="flex h-12">
          {/* Developed tab */}
          <button
            onClick={() => setActiveTab("developed")}
            className={`font-semibold w-36
        ${
          activeTab === "developed"
            ? "bg-primaryPurple-500 rounded-t cursor-default"
            : "hover:bg-primaryPurple-800 rounded-t"
        }         
      `}
          >
            {`Developed ${totalDeveloped}`}
          </button>

          {/* Published tab */}
          <button
            onClick={() => setActiveTab("published")}
            className={`font-semibold w-36
        ${
          activeTab === "published"
            ? "bg-primaryPurple-500 rounded-t cursor-default"
            : "hover:bg-primaryPurple-800 rounded-t"
        }
      `}
          >
            {`Published ${totalPublished}`}
          </button>
        </div>

        <HorizontalLine
          width="w-full"
          marginTop="0"
          marginBottom="0"
          className="mx-[15%]"
        />
      </div>

      <div className="mx-[15%] mt-[30px]">
        <div className="flex justify-between items-center mb-8">
          <div className="flex justify-center align-center">
            <p className="self-center">Sort by: </p>
            <select
              onChange={(e) => setSortOption(e.target.value)}
              className="ml-2 px-2 h-8 bg-customBlack border border-1 text-white rounded"
              value={sortOption}
            >
              <option value="total_rating desc">Top Rated</option>
              <option value="popularity desc">Most Popular</option>
              <option value="release_dates.y desc">Newest Releases</option>
              <option value="hypes desc">Most Hyped</option>
              <option value="follows desc">Most Followed</option>
            </select>
          </div>
          {/* Visual Type Controls */}
          <div className="flex justify-end items-center ">
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
        </div>

        {/* Render Games in different visual styles */}
        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
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
                <HorizontalLine
                  marginTop="mt-2"
                  marginBottom="mb-2"
                  width="full"
                />
              </div>
            )}
            {/* Display the games using a grid or list */}
            <div
              className={
                visualType === "detailed"
                  ? "grid grid-flow-row grid-cols-1 w-full lg:grid-cols-2"
                  : visualType === "list"
                  ? "grid grid-cols-1 gap-4"
                  : "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4"
              }
            >
              {paginatedGames && paginatedGames.length > 0 ? (
                paginatedGames.map((game) => (
                  <ResultCard
                    key={game.id}
                    game={game}
                    onClick={() => handleClick(game.id)}
                    visualType={visualType}
                  />
                ))
              ) : (
                <p>No games found.</p>
              )}
            </div>
          </>
        )}

        {/* <div className="flex justify-center mt-4">
  <Pagination
    currentPage={currentPage}
    totalPages={totalPages}
    onPageChange={handlePageClick}
  />
</div> */}
      </div>

      {/* <Footer /> */}
    </div>
  );
};

export default DeveloperPage;
