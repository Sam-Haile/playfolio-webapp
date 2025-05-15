import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import SearchBar from "../components/SearchBar";
import HorizontalLine from "../components/HorizontalLine";
import TrendingGames from "../components/TrendingGames";
import { fetchTrendingGames, fetchEvents } from "../services/helperFunctions";
import EventsCard from "../components/EventCard";

const HomePage = () => {
  const [trendingGames, setTrendingGames] = useState([]);
  const [events, setEvents] = useState([]);

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
    <div className="relative">
      <div className="">
        {/* Header */}
        <div className="relative">
          <Header
            showSearchBar={false}
            showNavButtons={false}
            showLoginButtons={true}
            showProfileIcon={true}
            zIndex={20}
          />
        </div>

        <div className="mx-[15%]">

        {/* Main Content */}
        <main className="relative md:grid md:grid-cols-[40%_60%] sm:block">
          <div className="py-[15%] md:py-[30%] md:mr-[10%] z-20">
            {/* Content Wrapper */}
            <div className="space-y-4 ">
              <h1 className="font-bold text-4xl ">
                Collect, review, and catalog your favorite games
              </h1>
              <h2 className="font-light text-lg md:w-[75%] w-[100%]">
                Your personal gaming journal to track what you've played, loved,
                and still want to explore.
              </h2>
            </div>
            {/* Search Bar */}
            <div className="pt-6 md:block hidden">
              <SearchBar className="z-50" width="75%" />
            </div>
            <div className="pt-6 md:hidden block">
              <SearchBar className="z-50" width="100%" />
            </div>
          </div>

          <div className="relative w-full h-full hidden md:block">
            {/* <BoxArtColumns /> */}

            <img
              src="./images/Games.png"
              alt="Games"
              className="absolute top-0 left-0 w-auto h-full object-left pointer-events: none;"
              style={{ objectFit: "cover" }}
              onContextMenu={(e) => e.preventDefault()}
              draggable="false"
            />

            {/* Top Gradient */}
            <div
              className="absolute top-0 h-[50vh] w-full pointer-events-none z-10"
              style={{
                background:
                  "linear-gradient(to bottom, #121212 10%, transparent 75%)",
              }}
            ></div>

            {/* Bottom Gradient */}
            <div
              className="absolute bottom-0 h-[50vh] w-full pointer-events-none z-10"
              style={{
                background:
                  "linear-gradient(to top, #121212 10%, transparent 100%)",
              }}
            ></div>

            <div
              className="absolute top-0 h-full w-[50vw] pointer-events-none z-10 right-0"
              style={{
                background:
                  "linear-gradient(to left, #121212 7%, transparent 45%)",
              }}
            ></div>
          </div>
        </main>

        <HorizontalLine marginTop="mt-0" className="!z-0" marginBottom="mb-0" width />

        <div className="flex justify-center items-center md:w-[75%] w-[100%] mx-auto mt-6 mb-6">
          <div className="text-center">
            <h1 className="font-bold md:text-base text-sm">
              Write and share reviews. Compile your own lists. Share your life
              in games.
            </h1>

            <h2 className="md:text-sm text-xs">
              Below are some popular reviews and lists from this week.{" "}
              <a href={`/signup`} className="underline text-primaryPurple hover:font-semibold cursor-pointer">Sign up</a> to
              create your own!
            </h2>
          </div>
        </div>

        {/* Ensure trendingGames is passed to the carousel */}
        <div className="z-50">
          <TrendingGames slides={trendingGames} />
        </div>

        <HorizontalLine marginTop="mt-4" className="!z-0" marginBottom="" width />

        <div className="grid lg:grid-cols-2 md:grid-cols-2 sm:grid-cols-1 h-auto ">
          <div className="md:px-10 md:py-5 py-2 ">
            <div className="border border-customGray-800 rounded-lg border-4 p-4">
              <h1 className="text-2xl font-bold">Review</h1>
              <p className="font-extralight">
                Rate and review games to share your thoughts with the community.
                See how your opinions compare and engage in discussions with
                others.
              </p>
            </div>
          </div>

          <div className="md:px-10 md:py-5 py-2">
            <div className="border border-customGray-800 rounded-lg border-4 p-4">
              <h1 className="text-2xl font-bold">Discover</h1>
              <p className="font-extralight">
                Find new games through trending titles, personalized
                recommendations, and hidden gems. Stay updated on the latest
                releases.
              </p>
            </div>
          </div>

          <div className="md:px-10 md:py-5 py-2">
            <div className="border border-customGray-800 rounded-lg border-4 p-4">
              <h1 className="text-2xl font-bold">Backlog</h1>
              <p className="font-extralight">
                Keep track of the games you plan to play. Organize your list,
                update progress, and never lose sight of what’s next on your
                gaming journey.
              </p>
            </div>
          </div>

          <div className="md:px-10 md:py-5 py-2">
            <div className="border border-customGray-800 rounded-lg border-4 p-4">
              <h1 className="text-2xl font-bold">Catalog</h1>
              <p className="font-extralight">
                Build your game collection by adding played, wishlisted, and
                backlogged titles. Your catalog is a complete record of your
                gaming experience.
              </p>
            </div>
          </div>
        </div>

        <HorizontalLine marginTop="mt-4" className="!z-0" marginBottom="mb-4" width />

        <h1 className="z-50  text-2xl font-bold mb-4">Events</h1>

          {/* Left Section */}
              <div>
                <EventsCard events={events} />
              </div>
      </div>

      {/* Footer */}
      <div className="relative z-20 mt-16">
        <Footer />
      </div>
    </div>
    </div>
  );
};

export default HomePage;
