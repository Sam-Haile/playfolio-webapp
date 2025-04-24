import Header from "../components/Header";
import HorizontalLine from "../components/HorizontalLine";
import TrendingGames from "../components/TrendingGames";
import Event from "../components/Events";
import Footer from "../components/Footer";
import PlayingIcon from "../assets/icons/PlayingIcon";
import BacklogIcon from "../assets/icons/BacklogIcon";
import WishlistIcon from "../assets/icons/WishlistIcon";
import DroppedIcon from "../assets/icons/DroppedIcon";
import ListIcon from "../assets/icons/ListIcon";
import ReviewIcon from "../components/ReviewIcon";
import DiscoveryQueue from "../components/DiscoveryQueue";
import {
  fetchTrendingGames,
  fetchEvents,
} from "../services/helperFunctions";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "../useAuth";
import axios from "axios";
import GameOfTheDay from "../components/GameOfTheDay";
import { onAuthStateChanged, signOut, getAuth } from "firebase/auth";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { generateDiscoveryQueueForUser } from "../services/discoveryQueue";

const HomePage = () => {
    const { user } = useAuth();
    const [recommendedGames, setRecommendedGames] = useState([]);
    const [trendingGames, setTrendingGames] = useState([]);
    const [events, setEvents] = useState([]);

    useEffect(() => {
      if (!user) return;
  
      // 1) Generate/Fetch discovery queue IDs
      generateDiscoveryQueueForUser(user.uid)
        .then(async (ids) => {
          // 2) Turn IDs into full game objects
          const resp = await axios.post(
            `${import.meta.env.VITE_API_URL}/api/games/ids`,
            { ids }
          );
          setRecommendedGames(resp.data);
        })
        .catch(console.error);
  
      // 3) Meanwhile, load trending & events (unchanged)
      (async () => {
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

        <div className="mx-[15%] pt-36">
          <div className="grid lg:grid-cols-[45%_55%] lg:grid-cols-[45%] lg:h-60 h-48 ">
            <div className="flex flex-col justify-center h-full w-full pr-4">
              <h1 className="text-4xl font-bold">{`Hello ${user?.username}, Welcome Back!`}</h1>
              <p className="font-light text-lg pt-2">
                Discover trending games, track your progress, <br /> and explore your collection
              </p>
            </div>

            <div className="w-full h-auto hidden lg:block md:hidden sm:hidden grid  cursor-default grid-cols-2 ">
              <div className="h-1/2 grid grid-cols-3 pb-2 gap-x-4">
                <div className="overflow-hidden relative border border-opacity-50 border-[5px] border-footerGray p-4 rounded">
                  <div className="relative z-20">
                    <p className="text-3xl font-semibold text-white ">258</p>
                    <h2 className="text-xl text-white">Played</h2>
                  </div>
                  <div
                    className="absolute top-[-35px] right-[-45px] pointer-events-none opacity-50 z-10"
                    style={{ transform: "rotate(-35deg)" }}
                  >
                    <PlayingIcon color="#2C2C2C" width="180px" height="180px" viewBox="24" />
                  </div>
                </div>

                <div className="overflow-hidden relative border border-opacity-50 border-[5px] border-footerGray p-4 rounded">
                  <div className="relative z-20">
                    <p className="text-3xl font-semibold text-white">12</p>
                    <h2 className="text-xl text-white">Backlogs</h2>
                  </div>
                  <div
                    className="absolute top-[-20px] right-[-30px] pointer-events-none opacity-50 z-10"
                    style={{ transform: "rotate(-35deg)" }}
                  >
                    <BacklogIcon color="#2C2C2C" width="150px" height="150px" viewBox="24" />
                  </div>
                </div>

                <div className="overflow-hidden relative border border-opacity-50 border-[5px] border-footerGray p-4 rounded">
                  <div className="relative z-20">
                    <p className="text-3xl font-semibold text-white">23</p>
                    <h2 className="text-xl text-white">Reviews</h2>
                  </div>
                  <div
                    className="absolute top-[-20px] right-[-30px] pointer-events-none opacity-50 z-10"
                    style={{ transform: "rotate(-35deg)" }}
                  >
                    <ReviewIcon color="#2C2C2C" width="150px" height="150px" viewBox="24" />
                  </div>
                </div>

              </div>

              <div className="h-1/2 gap-x-4 grid pt-2 grid-cols-3">
                <div className="overflow-hidden relative border border-opacity-50 border-[5px] border-footerGray p-4 rounded">
                  <div className="relative z-20">
                    <p className="text-3xl font-semibold text-white">35</p>
                    <h2 className="text-xl text-white">Wishlisted</h2>
                  </div>

                  <div
                    className="absolute top-[-15px] right-[-30px] pointer-events-none opacity-50 z-10"
                    style={{ transform: "rotate(-35deg)" }}
                  >
                    <WishlistIcon color="#2C2C2C" width="150px" height="150px" viewBox="24" />
                  </div>
                </div>

                <div className="overflow-hidden relative border border-opacity-50 border-[5px] border-footerGray p-4 rounded">
                  <div className="relative z-20 cursor-default">
                    <p className="text-3xl font-semibold text-white">8</p>
                    <h2 className="text-xl text-white">Dropped</h2>
                  </div>

                  <div
                    className="absolute top-[-10px] right-[-30px] pointer-events-none opacity-50 z-10"
                    style={{ transform: "rotate(-35deg)" }}
                  >
                    <DroppedIcon color="#2C2C2C" width="130px" height="130px" viewBox="24" />
                  </div>
                </div>

                <div className="overflow-hidden relative border border-opacity-50 border-[5px] border-footerGray p-4 rounded">
                  <div className="relative z-20">
                    <p className="text-3xl font-semibold text-white">258</p>
                    <h2 className="text-xl text-white">Lists</h2>
                  </div>

                  <div
                    className="absolute top-[-20px] right-[-30px] pointer-events-none opacity-50 z-10"
                    style={{ transform: "rotate(-35deg)" }}
                  >
                    <ListIcon color="#2C2C2C" width="140px" height="140px" viewBox="24" />
                  </div>
                </div>


              </div>
            </div>
        
          </div>

          <HorizontalLine width="full" marginBottom="0" marginTop="lg:mt-12 md:mt-8" zIndex="z-0" />

          <div className="pt-8">
            {/* <h1 className="text-2xl font-bold py-4">Currently Trending</h1> */}
            <TrendingGames slides={trendingGames} />
          </div>

          <HorizontalLine width="full" marginBottom="mb-4" marginTop="mt-4" zIndex="z-0"/>

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
          <HorizontalLine width="full" marginBottom="mb-4" marginTop="mt-4" zIndex="z-0"/>

          <h1 className="relative text-2xl font-bold pb-4 z-20">Events</h1>
          <Event events={events} />

          <HorizontalLine width="full" marginBottom="mb-4" marginTop="mt-4" zIndex="z-0"/>

          <div className="w-full">
            <h1 className="relative text-2xl font-bold z-20">Discover</h1>
            <p className="font-light text-lg pb-4">
              View handpicked titles based on your interests
            </p>

            <DiscoveryQueue games={recommendedGames} />
          </div>
        </div>

      <Footer />
    </div>
  );
};

export default HomePage;
