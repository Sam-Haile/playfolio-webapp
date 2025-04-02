import Header from "../components/Header";
import HorizontalLine from "../components/HorizontalLine";
import TrendingGames from "../components/TrendingGames";
import Event from "../components/Events";
import Footer from "../components/Footer";
import CenterMode from "../components/CenterMode";
import {
  fetchTrendingGames,
  fetchEvents,
} from "../services/helperFunctions";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Tilt } from "react-tilt";
import GameOfTheDay from "../components/GameOfTheDay";

const HomePage = () => {
  const [trendingGames, setTrendingGames] = useState([]);
  const [currentEvents, setEvents] = useState([]);
  const [recommendedGames, setRecommendedGames] = useState([]);

  useEffect(() => {
    const loadRecommendations = async () => {
      // Example array of IDs
      const gameIds = [7346, 259252, 1026, 4567, 7599];

      try {
        // Send all IDs together in one request
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/games/ids`,
          {
            ids: gameIds,
          }
        );

        setRecommendedGames(response.data);
      } catch (err) {
        console.error("Error loading recommended games:", err.message);
      }
    };

    loadRecommendations();
  }, []);

  // Fetch trending games and events
  useEffect(() => {
    const fetchGames = async () => {
      try {
        const trendingData = await fetchTrendingGames(20);
        const currentEvents = await fetchEvents(4);
        setTrendingGames(Array.isArray(trendingData) ? trendingData : []);
        setEvents(Array.isArray(currentEvents) ? currentEvents : []);
      } catch (error) {
        console.error("Error fetching trending games/events:", error);
        setTrendingGames([]);
        setEvents([]);
      }
    };

    fetchGames();
  }, []);

  return (
    <div>
      <div className="mx-[5%]">
        <Header
          showSearchBar={true}
          showNavButtons={true}
          showLoginButtons={true}
          zIndex={1000}
        />

        <div className="mx-[10%]">
          <div className="flex justify-between mt-28">
            <div>
              <h1 className="text-4xl font-bold">Hello Name, Welcome Back!</h1>
              <p className="font-light text-lg pt-2">
                Discover trending games, track your progress, <br /> and explore your collection
              </p>
            </div>

            <div>Second Section</div>
          </div>

          <HorizontalLine width="full" marginBottom="0" marginTop="mt-28" />

          <div>
            <h1 className="text-2xl font-bold py-4">Currently Trending</h1>
            <TrendingGames slides={trendingGames} />
          </div>

          <HorizontalLine width="full" marginBottom="mb-4" marginTop="mt-4" />

          <GameOfTheDay />

          <HorizontalLine width="full" marginBottom="mb-4" marginTop="mt-4" />

          <div className="min-h-[200px] flex justify-center items-center border border-4 rounded-lg border-dashed border-darkGray">
            <p className="font-bold">
              No reviews found.{" "}
              <a className="text-primaryPurple-500 cursor-pointer">
                {" "}
                Add a review{" "}
              </a>
            </p>
          </div>

          <HorizontalLine width="full" marginBottom="mb-4" marginTop="mt-4" />

          <h1 className="relative text-2xl font-bold pb-4 z-20">Events</h1>
          <Event events={currentEvents} />

          <HorizontalLine width="full" marginBottom="mb-4" marginTop="mt-4" />

          <div className="w-full">
            <h1 className="relative text-2xl font-bold z-20">Discover</h1>
            <p className="font-light text-lg pb-4">
              View handpicked titles based on your interests
            </p>

            <CenterMode games={recommendedGames} />
          </div>

          <HorizontalLine width="full" marginBottom="mb-4" marginTop="mt-4" />
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default HomePage;
