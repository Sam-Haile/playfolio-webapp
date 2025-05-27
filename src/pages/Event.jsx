import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import Footer from "../components/Footer";
import MasonryBoxArtGrid from "../components/MasonryBoxArtGrid";
import newTabIcon from "../assets/icons/newTab.svg";
import TwitchIcon from "../assets/icons/twitch.svg";
import YouTubeIcon from "../assets/icons/youtube.svg";
import TwitterIcon from "../assets/icons/twitter.svg";
import { fetchEventCovers } from "../services/helperFunctions";

const networkIcons = {
  Twitch: TwitchIcon,
  YouTube: YouTubeIcon,
  Twitter: TwitterIcon,
};

const LinkIconURL = newTabIcon;

const Event = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [eventCovers, setEventCovers] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/events/${id}`
        );
        setEvent(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // 2) fetch the 100 most recent covers on mount
  useEffect(() => {
    (async () => {
      const covers = await fetchEventCovers();
      setEventCovers(covers);
    })();
  }, []);

  return (
    <div className="h-[100%] relative">
      <Header showSearchBar={true} showNavButtons={true} showLoginButtons={true} />

      {/* Hero Background */}
      <div className="relative w-full md:h-[700px] h-[400px] overflow-hidden z-0">
        <div className="absolute top-0 left-0 w-full">
          {eventCovers.length > 0 && (
            <MasonryBoxArtGrid
              images={eventCovers.map(evt => ({
                coverUrl: evt.cover_url
              }))}
              columns={4}       
              offset={90}
              widthRatio={16}
              heightRatio={9}
              minHeight={0}
            />
          )}        
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

      {/* Genre Info */}
      <div className="absolute top-0 mx-[15%] md:mt-56 mt-24 flex flex-col justify-center">
        <div className="bg-customBlack w-fit p-8 rounded-lg drop-shadow-lg bg-opacity-70">
          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="w-32 h-32 bg-gray-300 rounded"></div>
              <div className="w-48 h-6 bg-gray-300"></div>
              <div className="w-24 h-4 bg-gray-300"></div>
            </div>
          ) : (
            <>
              {event?.event_logo && (
                <img
                  src={event.event_logo}
                  alt={`${event.name} Logo`}
                  className="w-80 max-h-80 rounded overflow-hidden"
                />
              )}
              <div className="flex flex-col items-start mt-4">
                <p className="text-xl font-semibold">{event?.name}</p>
                <p className="italic text-sm">
                  Event Time: {event?.date || ""} | {event?.time || ""} {event.time_zone || ""}
                </p>
              </div>

              {event.event_networks?.length > 0 && (
                <div className="flex items-center space-x-4 pt-4 justify-end pointer-event:none">
                  {event.event_networks.map((network, idx) => {
                    const src = networkIcons[network.type] || LinkIconURL;
                    return (
                      <a
                        key={idx}
                        href={network.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center hover:text-primaryPurple-500"
                      >
                        <img
                          src={src}
                          alt={`${network.type} logo`}
                          className="md:w-8 md:h-8 w-6 h-6 "
                          draggable = "false"
                        />
                      </a>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>


      {/* Genre Summary (if exists) */}
      {event && event.description && (
        <div className="mx-[15%] md:mt-8 mt-16">
          <h1 className="text-xl font-semibold">
            About {event.name}
          </h1>
          <p className="mr-[40%]  mt-2">{event.description}</p>
        </div>
      )}


      <Footer />
    </div>
  );
};

export default Event;