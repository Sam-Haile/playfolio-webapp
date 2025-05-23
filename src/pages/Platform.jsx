import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import Footer from "../components/Footer";
import HorizontalLine from "../components/HorizontalLine";
import MasonryBoxArtGrid from "../components/MasonryBoxArtGrid";
import ResultCard from "../components/ResultCard";
import Pagination from "../components/Pagination";
import SkeletonLoading from "../components/SkeletonLoading";
import newTabIcon from "../assets/icons/newTab.svg"; // Import the new tab icon

const Platform = () => {
    const { id } = useParams();
    const [platformDetails, setPlatformDetails] = useState(null);
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [visualType, setVisualType] = useState("detailed");
    const [sortOption, setSortOption] = useState("popular");
    const [rawGames, setRawGames] = useState([]);              // list from API
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

    const columnClassMap = {
  3: "grid-cols-3",
  5: "grid-cols-5",
  7: "grid-cols-7"
};

    useEffect(() => {
        const fetchPlatformData = async () => {
            try {
                const [platformRes, gamesRes] = await Promise.all([
                    axios.post(`${import.meta.env.VITE_API_URL}/api/platform`, { id }),
                    axios.post(`${import.meta.env.VITE_API_URL}/api/platform/games`, {
                        platformId: id,
                        sortOption: "popular",          // ALWAYS let backend send its Bayesian list
                    }),
                ]);

                setPlatformDetails(platformRes.data);
                setRawGames(gamesRes.data);
                setGames(gamesRes.data);
            } catch (err) {
                console.error("Error fetching platform page data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchPlatformData();
    }, [id]);

    const sortFns = React.useMemo(
        () => ({
            popular: () => 0,   // already sorted by backend
            rating: (a, b) => (b.totalRating ?? 0) - (a.totalRating ?? 0),
            release_date: (a, b) => (b.releaseYear ?? 0) - (a.releaseYear ?? 0),
            name: (a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
        }),
        []
    );

    useEffect(() => {
        // just copy & sort in memory – never mutate state directly
        setGames([...rawGames].sort(sortFns[sortOption]));
    }, [sortOption, rawGames, sortFns]);


    const handleVisualTypeChange = (type) => {
        setVisualType(type);
    };

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
            <div className="relative w-full md:h-[700px] h-[400px] overflow-hidden z-0">
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
                <div className="md:mx-[15%] mx-[5%] w-full md:mt-8">
                    <h1 className="text-2xl w-[80%] font-semibold">
                        Top 100 {platformDetails.name} Games
                    </h1>
                </div>
            )}

            {/* Sort and View Controls */}
            <div className="md:mx-[15%] mx-[5%] mt-12">
                <div className="flex flex-row justify-between gap-y-4">
                    <div className="flex items-center">
                        <p className="md:block hidden self-center">Sort by: </p>
                        <select
                            onChange={(e) => setSortOption(e.target.value)}
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
            <div className="md:mx-[15%] mx-[5%] mt-[30px]">
                <div className="flex flex-col w-full">
                    {visualType === "list" && (
                        <div>
                            <div className="grid md:grid-cols-[35%_25%_25%_15%] grid-cols-[40%_30%_30%] items-center gap-4 w-full">
                                <div><p>Game</p></div>
                                <div><p>Developer</p></div>
                                <div className="hidden md:block"><p>Genre</p></div>
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
                        {games && games.length > 0 ? (
                            games.map((game) => (
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

            </div>

            <Footer />
        </div>
    );
};

export default Platform;
