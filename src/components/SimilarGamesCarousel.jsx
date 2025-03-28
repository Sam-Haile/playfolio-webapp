import React, { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Tilt } from "react-tilt";

const emblaOptions = {
  containScroll: "trimSnaps",
  align: "start",
  draggable: true,
  loop: true,
  speed: 5,
  slidesToScroll: 1,
  dragFree: true, 
  dragThreshold: 20, // Requires more movement to start dragging
};

const defaultOptions = {
  reverse: false,
  max: 20,
  perspective: 1000,
  scale: 1.1,
  speed: 500,
  transition: true,
  axis: null,
  reset: true,
  easing: "cubic-bezier(.03,.98,.52,.99)",
};

const SimilarGamesCarousel = ({ slides, onGameClick }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel(emblaOptions);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (!emblaApi) return;
    
    let autoplayInterval;

    const startAutoplay = () => {
      autoplayInterval = setInterval(() => {
        if (!emblaApi) return;
        emblaApi.scrollNext(); // Moves to next slide manually
      }, 4000); // Adjust autoplay speed (every 4 sec)
    };

    const stopAutoplay = () => clearInterval(autoplayInterval);

    emblaApi.on("pointerDown", stopAutoplay); // Pause autoplay when dragging
    emblaApi.on("pointerUp", startAutoplay); // Resume autoplay when released

    startAutoplay(); // Start autoplay initially

    return () => {
      stopAutoplay();
      emblaApi.off("pointerDown", stopAutoplay);
      emblaApi.off("pointerUp", startAutoplay);
    };
  }, [emblaApi]);

  const handleGameClick = (gameId) => {
    console.log("Clicked game ID:", gameId);
    if (onGameClick) {
      onGameClick(gameId);
    }
  };

  useEffect(() => {
    if (!loading) return;

    const handleRouteChange = () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
      setLoading(false);
    };

    const timeout = setTimeout(handleRouteChange, 300);
    return () => clearTimeout(timeout);
  }, [loading]);

  return (
    <section className="embla_trending_games select-none">
      <div className="embla__viewport" ref={emblaRef}>
        <div className="embla__container py-[2%]">
          {slides.map((slide, index) => (
            <div
              className="embla__slide cursor-pointer"
              key={index}
              onClick={() => handleGameClick(slide.id)}
            >
              <Tilt options={defaultOptions} style={{ width: "100%" }}>
                {slide.cover?.image_id ? (
                  <img
                    src={`https://images.igdb.com/igdb/image/upload/t_cover_big/${slide.cover.image_id}.jpg`}
                    alt={`${slide.name} Cover`}
                    className="w-full h-auto rounded-lg shadow-md"
                  />
                ) : (
                  <div className="w-full rounded-lg flex items-center justify-center bg-gray-200">
                    <p className="text-gray-500 text-sm">No Cover Available</p>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 transition-opacity duration-300 hover:opacity-10 hover:animate-sheen"></div>
              </Tilt>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SimilarGamesCarousel;
