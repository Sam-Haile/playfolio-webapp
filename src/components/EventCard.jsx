import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tilt } from "react-tilt";
import { slugify } from "../services/slugify.js";

const defaultOptions = {
  reverse: false,
  max: 20,
  perspective: 1000,
  scale: 1.025,
  speed: 600,
  transition: true,
  axis: null,
  reset: true,
  easing: "cubic-bezier(.03,.98,.52,.99)",
};

const EventCard = ({ events }) => {
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


  const handleEventClick = (eventId, eventName) => {
    const slug = slugify(eventName);
    navigate(`/event/${eventId}/${slug}`);
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {displayedEvents.map((event) => {
        const logo = event.event_logo;

        return (
          <Tilt
            key={event.id} // ✅ key moved properly here (it's fine here actually!)
            options={defaultOptions}
            style={{ width: "100%" }}
            className="hover:drop-shadow-[0_0_10px_rgba(44,44,44,255)] overflow-hidden cursor-pointer"
          >
            <div
              className="border border-4 border-customGray-800 rounded-lg bg-customBlack"
              onClick={() => handleEventClick(event.id, event.name)}
            >
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

  );
};

export default EventCard;
