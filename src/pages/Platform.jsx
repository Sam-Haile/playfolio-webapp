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

const Platform = () => {
    const { id } = useParams();
    const [platformDetails, setPlatformDetails] = useState(null);
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [visualType, setVisualType] = useState("compact");
    const [currentPage, setCurrentPage] = useState(1);
    const [gamesPerPage] = useState(100); // adjust as needed
    const [sortOption, setSortOption] = useState("popular");

    // Array to hold the visual type options and corresponding icons
    const visualTypes = [
        { type: "detailed", icon: "/src/assets/icons/detailedView.svg" },
        { type: "compact", icon: "/src/assets/icons/compactView.svg" },
        { type: "list", icon: "/src/assets/icons/listView.svg" },
    ];
    const columns = 7; // Adjust grid columns for MasonryBoxArtGrid

    useEffect(() => {
        setCurrentPage(1);
        fetchPlatformData();
    }, [id, sortOption]);

    const fetchPlatformData = async () => {
        try {
            const platformResponse = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/platform`,
                { id }
            );
            const gamesResponse = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/platform/games`,
                { platformId: id, sortOption }
            );

            setPlatformDetails(platformResponse.data);
            setGames(gamesResponse.data);
        } catch (error) {
            console.error("Error fetching platform page data:", error);
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

    const paginatedGames = games.slice(
        (currentPage - 1) * gamesPerPage,
        currentPage * gamesPerPage
    );

    const totalPages = Math.ceil(games.length / gamesPerPage);

    if (loading) {
        return <SkeletonLoading type="platform" />;
    }

    if (!platformDetails) {
        return <p>Platform not found.</p>;
    }

    return (
        <div className="h-[100%] relative">
            <Header showSearchBar={true} showNavButtons={true} showLoginButtons={true} />

            {/* Hero Background */}
            <div className="relative w-full h-[700px] overflow-hidden z-0">
                <div className="absolute top-0 left-0 w-full">
                    <MasonryBoxArtGrid images={games} columns={columns} />
                </div>

                {/* Top and Bottom Gradients */}
                <div
                    className="absolute top-0 h-full w-full pointer-events-none z-10"
                    style={{
                        background: "linear-gradient(to bottom, #121212 8%, transparent 50%)",
                    }}
                />
                <div
                    className="absolute bottom-0 h-full w-full pointer-events-none z-10"
                    style={{
                        background: "linear-gradient(to top, #121212 8%, transparent 50%)",
                    }}
                />
            </div>

            {/* Platform Info */}
            <div className="absolute top-0 mx-[15%] mt-56 flex flex-col justify-center">
                <div className="bg-customBlack w-fit p-8 rounded-lg drop-shadow-lg bg-opacity-70">
                    {loading ? (
                        <div className="animate-pulse space-y-4">
                            <div className="w-32 h-32 bg-gray-300 rounded"></div>
                            <div className="w-48 h-6 bg-gray-300"></div>
                            <div className="w-24 h-4 bg-gray-300"></div>
                        </div>
                    ) : (
                        <>
                            {platformDetails?.logo && (
                                <img
                                    src={platformDetails.logo}
                                    alt={`${platformDetails.name} Logo`}
                                    className="w-74"
                                />
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Platform Summary (if exists) */}
            {platformDetails && platformDetails.summary && (
                <div className="mx-[15%] mt-8">
                    <h1 className="text-2xl font-semibold">
                        Top 100 {platformDetails.name} Games
                    </h1>
                </div>
            )}

            {/* Sort and View Controls */}
            <div className="mx-[15%] mt-12">
                <div className="flex h-12 justify-between items-center">
                    <div className="flex items-center">
                        <p className="self-center">Sort by: </p>
                        <select
                            onChange={(e) => setSortOption(e.target.value)}
                            className="ml-2 px-2 h-8 bg-customBlack border text-white rounded"
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
                                className={`p-2 rounded ${visualType === type
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
            <div className="mx-[15%] mt-[30px]">
                <div className="flex flex-col w-full">
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
                                    onClick={() => { }} 
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

export default Platform;
