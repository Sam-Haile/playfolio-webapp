// src/pages/Company.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import HorizontalLine from "../components/HorizontalLine.jsx";
import ResultCard from "../components/ResultCard.jsx";
import Pagination from "../components/Pagination.jsx";
import useWindowWidth from "../components/useWindowWidth.jsx";
import MasonryBoxArtGrid from "../components/MasonryBoxArtGrid.jsx";
import { trimImages } from "../services/helperFunctions.js";
import newTabIcon from "../assets/icons/newTab.svg";

const visualTypes = [
  { type: "detailed", icon: "/src/assets/icons/detailedView.svg" },
  { type: "compact", icon: "/src/assets/icons/compactView.svg" },
  { type: "list", icon: "/src/assets/icons/listView.svg" },
];

const Company = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const defaultTab = queryParams.get("tab") || "developed";

  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState("popular");
  const [visualType, setVisualType] = useState("detailed");
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [companyDetails, setCompanyDetails] = useState(null);
  const [headerGames, setHeaderGames] = useState([]);
  const [paginatedGames, setPaginatedGames] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPublished, setTotalPublished] = useState(0);
  const [totalDeveloped, setTotalDeveloped] = useState(0);

  const windowWidth = useWindowWidth();
  const trimmedImages = useMemo(() => trimImages(headerGames), [headerGames]);

  // Total pages comes from the nested pagination
  const totalPages = companyDetails?.pagination?.totalPages || 1;

  useEffect(() => {
    if (!id) return;
    fetchHeaderGames();
  }, [id, activeTab]);

  // keep paged list on its own effect
  useEffect(() => {
    if (!id) return;
    fetchPaginatedGames(currentPage);
  }, [id, sortOption, activeTab, currentPage]);

  const fetchHeaderGames = async () => {
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/companyGames`,
        {
          id,
          sortOption: "popular",
          page: 1,
          limit: 30,
          gameType: activeTab,
        }
      );
      setTotalDeveloped(data.totalDeveloped);
      setTotalPublished(data.totalPublished);
      setCompanyDetails(data.companyDetails);
      setHeaderGames(data.combinedGames || []);
    } catch (err) {
      console.error("Error fetching header games:", err.response?.data || err);
    }
  };

  const fetchPaginatedGames = async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/companyGames`,
        {
          id,
          sortOption,
          page,
          limit: 20,
          gameType: activeTab,
        }
      );

      // pull out the nested companyDetails (with its pagination)
      const details = data.companyDetails;
      setCompanyDetails(details);

      // choose the right list
      const listKey =
        activeTab === "published" ? data.publishedGames : data.developedGames;
      setPaginatedGames(listKey || []);

      console.log(data.developedGames);
      // update page number
      setCurrentPage(details.pagination.currentPage);
    } catch (err) {
      console.error(
        "Error fetching paginated games:",
        err.response?.data || err
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVisualTypeChange = (type) => setVisualType(type);
  const handlePageClick = (pg) => fetchPaginatedGames(pg);
  const handleClick = (gameId) => navigate(`/game/${gameId}`);

  // pick number of columns for background grid
  const getColumns = () => {
    const count = trimmedImages.length;
    if (count === 30) return 6;
    if (count === 15) return windowWidth < 768 ? 3 : 4;
    if (count === 10) return 2;
    if (count === 5) return windowWidth < 768 ? 1 : 2;
    return 1;
  };

  return (
    <div className="h-full relative">
      <Header showSearchBar showNavButtons showLoginButtons />

      {/* background grid */}
      <div className="relative w-full h-[700px] overflow-hidden z-0">
        <div className="absolute top-0 left-0 w-full">
          <MasonryBoxArtGrid images={headerGames} columns={getColumns()} />
        </div>
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

      {/* company info card */}
      <div className="absolute top-0 mx-[15%] mt-56 flex flex-col justify-center">
        <div className="bg-customBlack w-fit p-8 rounded-lg drop-shadow-lg bg-opacity-90">
          {loading && !companyDetails ? (
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
                {companyDetails?.startDate && (
                  <p className="italic text-base py-2">
                    Est. {companyDetails.startDate || ""}
                  </p>
                )}
              </div>
              {companyDetails?.websites?.length > 0 && (
                <div className="italic  text-sm flex items-center pt-2 w-auto">
                  <div className="flex group">
                    {companyDetails.websites.map((w, i) => (
                      <a
                        key={i}
                        href={w.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="pt-1 group-hover:text-primaryPurple-500 font-light text-lg "
                      >
                        Official Website
                      </a>
                    ))}
                    <img
                      src={newTabIcon}
                      alt="Ico"
                      className="group cursor-pointer pl-2 w-[30px]"
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* description */}
      {companyDetails?.description && (
        <div className="mx-[15%] mt-6">
          <h1 className="text-xl font-semibold">About {companyDetails.name}</h1>
          <p className="mr-[50%] mt-2">{companyDetails.description}</p>
        </div>
      )}

      {/* tabs */}
      <div className="mx-[15%] mt-12">
        <div className="flex h-12">
          <button
            onClick={() => setActiveTab("developed")}
            className={`font-semibold w-36 ${
              activeTab === "developed"
                ? "bg-primaryPurple-500 rounded-t cursor-default"
                : "hover:bg-primaryPurple-800 rounded-t"
            }`}
          >
            Developed {totalDeveloped}
          </button>
          <button
            onClick={() => setActiveTab("published")}
            className={`font-semibold w-36 ${
              activeTab === "published"
                ? "bg-primaryPurple-500 rounded-t cursor-default"
                : "hover:bg-primaryPurple-800 rounded-t"
            }`}
          >
            Published {totalPublished}
          </button>
        </div>
        <HorizontalLine width="w-full" marginTop="0" marginBottom="0" />
      </div>

      {/* sort + view toggles */}
      <div className="mx-[15%] mt-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <p>Sort by:</p>
            <select
              value={sortOption}
              onChange={(e) => {
                setSortOption(e.target.value);
                setCurrentPage(1);
              }}
              className="ml-2 px-2 h-8 bg-customBlack border text-white rounded"
            >
              <option value="popular">Popularity</option>
              <option value="rating">Rating</option>
              <option value="release_date">Release Date</option>
              <option value="name">Name A → Z</option>
            </select>
          </div>
          <div className="flex space-x-2">
            {visualTypes.map(({ type, icon }) => (
              <button
                key={type}
                onClick={() => handleVisualTypeChange(type)}
                className={`p-2 rounded border ${
                  visualType === type
                    ? "bg-primaryPurple-500"
                    : "bg-customBlack"
                }`}
              >
                <img src={icon} alt={`${type} view`} className="w-[25px]" />
              </button>
            ))}
          </div>
        </div>

        {loading ? null : (
          <>
            {visualType === "list" && (
              <div>
                <div className="grid grid-cols-[35%_25%_25%_15%] gap-4">
                  <p>Game</p>
                  <p>Developer</p>
                  <p>Genre</p>
                  <p>Rating</p>
                </div>
                <HorizontalLine
                  marginTop="mt-2"
                  marginBottom="mb-2"
                  width="full"
                />
              </div>
            )}
            {paginatedGames.length > 0 ? (
              <div
                className={
                  visualType === "detailed"
                    ? "grid grid-cols-1 lg:grid-cols-2 gap-4"
                    : visualType === "list"
                    ? "grid grid-cols-1 gap-4"
                    : "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4"
                }
              >
                {paginatedGames.map((g) => (
                  <ResultCard
                    key={g.id}
                    game={g}
                    onClick={() => handleClick(g.id)}
                    visualType={visualType}
                  />
                ))}
              </div>
            ) : (
              <div className="h-20 border-dashed border w-full text-center flex items-center justify-center">
                No games found.
              </div>
            )}

            <div className="flex justify-center mt-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageClick}
              />
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Company;
