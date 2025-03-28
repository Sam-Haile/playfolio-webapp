import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tilt } from "react-tilt";

const defaultOptions = {
  reverse: false,
  max: 20,
  perspective: 1000,
  scale: 1.05,
  speed: 800,
  transition: true,
  axis: null,
  reset: true,
  easing: "cubic-bezier(.03,.98,.52,.99)",
};

const Events = ({ events }) => {
  const navigate = useNavigate();
  const [displayedEvents, setDisplayedEvents] = useState([]);

  useEffect(() => {
    const updateDisplayedSlides = () => {
      const width = window.innerWidth;
      if (width >= 1000) {
        setDisplayedEvents(events.slice(0, 4)); // Display 5 events on large screens
      } else if (width >= 768) {
        setDisplayedEvents(events.slice(0, 3)); // Display 3 events on medium screens
      } else {
        setDisplayedEvents(events.slice(0, 2)); // Display 1 slide on small screens
      }
    };

    updateDisplayedSlides();
    window.addEventListener("resize", updateDisplayedSlides);

    return () => window.removeEventListener("resize", updateDisplayedSlides);
  }, [events]);

  return (
    <div className="">
      <div className="flex justify-center">
        {displayedEvents.map((event) => {
          const logo = event.event_logo
            ? `https://images.igdb.com/igdb/image/upload/t_original/${event.event_logo.image_id}.webp`
            : null;

          return (
            <Tilt
              key={event.id}
              options={defaultOptions}
              style={{ width: "100%" }}
              className="hover:drop-shadow-[0_0_10px_rgba(44,44,44,255)] overflow-hidden px-2 w-full cursor-pointer">
              <div className="border border-4 border-customGray-800 rounded-lg bg-customBlack">
                <div className="w-full aspect-[16/9] overflow-hidden">
                  <img
                    className="w-full h-full object-cover object-top border-b-4 border-customGray-800 rounded-t"
                    src={logo}
                    alt={`${event.name} logo`}
                  />
                </div>

                <p className="italic font-light px-2 pt-2 truncate">
                  {event.date} | {event.time}
                </p>
                <h1 className="px-2 pb-2 truncate">{event.name}</h1>
              </div>
            </Tilt>
          );
        })}
      </div>
      <div className="flex flex-row-reverse">
        <a href="/" className="text-right pt-4 hover:text-primaryPurple-500">View More Events </a>
      </div>
    </div>
  );
};

export default Events;
