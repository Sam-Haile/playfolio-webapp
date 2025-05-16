import Header from "../components/Header";
import HorizontalLine from "../components/HorizontalLine";
import TrendingGames from "../components/TrendingGames";
import EventCard from "../components/EventCard";
import Footer from "../components/Footer";
import DiscoveryQueue from "../components/DiscoveryQueue";
import { fetchTrendingGames, fetchEvents } from "../services/helperFunctions";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "../useAuth";
import axios from "axios";
import GameOfTheDay from "../components/GameOfTheDay";
import { generateDiscoveryQueueForUser } from "../services/discoveryQueue";
import HomePageInfo from "../components/HomePageHeader";
import SearchBar from "../components/SearchBar";
const HomePage = () => {
  const { user } = useAuth();
  const [recommendedGames, setRecommendedGames] = useState([]);
  const [trendingGames, setTrendingGames] = useState([]);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);


useEffect(() => {
  if (!user) return;

  // 1) Load personalized discovery queue
  generateDiscoveryQueueForUser(user.uid)
    .then(async (ids) => {
      const resp = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/games/ids`,
        { ids },
        { params: { slim: false } }
      );
      setRecommendedGames(resp.data);
    })
    .catch(console.error);

  // 2) Load trending + events in parallel
  (async () => {
    setIsLoading(true); // ✅ START loading
    try {
      const [trendingData, eventData] = await Promise.all([
        fetchTrendingGames(20),
        fetchEvents(4),
      ]);
      setTrendingGames(trendingData || []);
      setEvents(eventData || []);
    } catch (e) {
      console.error(e);
      setTrendingGames([]);
      setEvents([]);
    } finally {
      setIsLoading(false); // ✅ END loading
    }
  })();
}, [user]);


  return (
    <div className="relative">
      <Header
        showSearchBar={true}
        showNavButtons={true}
        showLoginButtons={true}
        zIndex={1000}
      />


      <div className="md:mx-[15%] mx-[5%] md:pt-36 pt-24 mb-20">

        <HomePageInfo user={user}/>

        <div className="my-2 md:hidden block">
          <SearchBar className="z-50" width="100%" />
        </div>

        <HorizontalLine
          width="full"
          marginBottom="0"
          marginTop="lg:mt-12 mt-4"
          zIndex="z-0"
        />

        <div className="pt-4">
          {/* <h1 className="text-2xl font-bold py-4">Currently Trending</h1> */}
          <TrendingGames slides={trendingGames} loading={isLoading}/>
        </div>


        <GameOfTheDay />

        {/*
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

          */}
        <HorizontalLine
          width="full"
          marginBottom="mb-4"
          marginTop="mt-4"
          zIndex="z-0"
        />

        {/* <h1 className="relative text-2xl font-bold pb-4 z-20">Events</h1> */}
        <EventCard events={events} loading={isLoading}/>

        <HorizontalLine
          width="full"
          marginBottom="mb-4"
          marginTop="mt-4"
          zIndex="z-0"
        />

        <div className="w-full">
          <h1 className="relative text-2xl font-bold z-20">Discover</h1>
          <p className="font-light text-lg pb-4">
            View handpicked titles based on your interests
          </p>

        </div>
          <DiscoveryQueue games={recommendedGames} />
      </div>

      <Footer />
    </div>
  );
};

export default HomePage;
