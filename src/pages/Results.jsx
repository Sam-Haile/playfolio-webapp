import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import HorizontalLine from "../components/HorizontalLine";
import ResultCard from "../components/ResultCard";

const Results = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchTerm = queryParams.get("query");

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imageSize, setImageSize] = useState("cover_big"); // Global image size
  const [sortOption, setSortOption] = useState("relevance"); // Sorting option
  const [visualType, setVisualType] = useState("detailed"); // Default view is detailed
  const [originalResults, setOriginalResults] = useState([]); // Store original results

  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 10;

  useEffect(() => {
    if (searchTerm) {
      setCurrentPage(1);
      fetchSearchResults(searchTerm);
    }
  }, [searchTerm]);

  const fetchSearchResults = async (term) => {
    setLoading(true);

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/games`, {
        searchTerm: term,
      });
      setResults(response.data);
      console.log("Response data", response.data);
      setOriginalResults(response.data); // Save the original results
    } catch (err) {
      console.error("Error fetching search results:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSortChange = (e) => {
    const value = e.target.value;
    setSortOption(value);

    if (value === "relevance") {
      setResults([...originalResults]); // Reset to original results
      return;
    }

    const sortedResults = [...results];
    switch (value) {
      case "name":
        sortedResults.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "releaseYear":
        sortedResults.sort((a, b) => b.releaseYear - a.releaseYear);
        break;
      case "developer":
        sortedResults.sort((a, b) =>
          a.developers[0].localeCompare(b.developers[0])
        );
        break;
      case "score":
        sortedResults.sort((a, b) => b.totalRating - a.totalRating);
        break;
      default:
        break;
    }
    setResults(sortedResults);
  };

  //Pagination Logic
  const totalPages = Math.ceil(results.length / resultsPerPage);
  const paginatedResults = results.slice(
    (currentPage - 1) * resultsPerPage,
    currentPage * resultsPerPage
  );

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const visualTypes = [
    { type: "detailed", icon: "./src/assets/icons/detailedView.svg" },
    { type: "compact", icon: "./src/assets/icons/compactView.svg" },
    { type: "list", icon: "./src/assets/icons/listView.svg" },
  ];

  const handleVisualTypeChange = (type) => {
    console.log("Visual Type: ", visualType)
    setVisualType(type);
  };

  return (
    <div className="relative flex flex-col min-h-screen">
      <Header showSearchBar={true} showNavButtons={true} showLoginButtons={true} zIndex={20} />
      <div className="flex-grow pt-10 relative max-w-screen min-h-[100%] mx-[15%]">

        <div className="flex flex-col  mt-24">
          <p className="px-0">Search Results for "{searchTerm}"</p>
          <HorizontalLine
            marginTop="mt-0"
            marginBottom="mb-4"
            width="w-full"
            zIndex="z-0"
          />
        </div>


        {/* Sorting and Visual Type Options */}
        <div className="mb-8 flex flex-row justify-between">
          <div className="flex items-center ">
            <label htmlFor="sortOptions" className="text-white mr-4 flex font-bold">
              Sort By:
            </label>
            <select
              id="sortOptions"
              value={sortOption}
              onChange={handleSortChange}
              className="px-2 bg-customBlack border border-1 text-white rounded"
            >
              <option value="relevance">Relevance</option>
              <option value="name">Name</option>
              <option value="releaseYear">Release Year</option>
              <option value="developer">Developer</option>
              <option value="score">Score</option>
            </select>
          </div>

          <div className="flex items-center">
            {/* <label htmlFor="visualType" className="text-white ml-6 mr-2 ">
            View:
          </label> */}

            <div className="flex space-x-2">
              {visualTypes.map(({ type, icon }) => (
                <button
                  key={type}
                  onClick={() => handleVisualTypeChange(type)}
                  className={`p-2 rounded ${visualType === type ? "bg-primaryPurple-500" : "bg-customBlack"
                    } border border-1 text-white hover:bg-primaryPurple-700 transition`}
                >
                  <img src={icon} alt={`${type} view`} className="w-[25px]" />
                </button>
              ))}
            </div>


          </div>
        </div>

        <div className="mb-8">
          {loading ? (
            <div></div>
          ) : (
            <>
              {/* Add the HorizontalLine before the grid for list view */}
              {visualType === "list" && (
                <div>
                  <div className="grid grid-cols-[35%_25%_25%_15%] items-center gap-4 w-full">
                    <div><p>Game</p></div>
                    <div><p>Developer</p></div>
                    <div><p>Genre</p></div>
                    <div><p>Rating</p></div>
                  </div>
                  <HorizontalLine marginTop="mt-2" marginBottom="mb-2" width="full" />
                </div>

              )}
              <div className={`${visualType === "detailed"
                ? "grid grid-flow-row grid-cols-1 w-full lg:grid-cols-2"
                : visualType === "list"
                  ? "grid grid-cols-1 gap-4" // One row per game for list view
                  : "grid grid-cols-7 gap-4 md:grid-cols-5 sm:grid-cols-3 xs:grid-cols-2"
                }`}>

                {paginatedResults.map((game) => (
                  <ResultCard
                    key={game.id}
                    game={game}
                    gameName={game.name}
                    id={game.id}
                    visualType={visualType}
                  />
                ))}
              </div>


              {/* Pagination Controls */}
              <div className="flex justify-center mt-8">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className="px-4 py-2 mx-2 text-white bg-primaryPurple-700 rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-white mx-4 flex justify-center items-center">Page {currentPage} of {totalPages}</span>
                <button
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 mx-2 text-white bg-primaryPurple-500 rounded disabled:opacity-50 "
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Results;
