import React, { useState, useEffect, useMemo } from "react";

const MasonryBoxArtGrid = ({
    images,
    columns = 10,
    minHeight = 160,
    offset = 90, // amount to raise alternate columns (in pixels)
  }) => {
    // Set initial container width based on current window size.
    const getContainerWidth = () => {
      const containerPadding = 32 + (columns - 1) * 16; // Tailwind's gap & padding estimates
      return typeof window !== "undefined"
        ? window.innerWidth - containerPadding
        : 1200;
    };

    const [containerWidth, setContainerWidth] = useState(getContainerWidth());

    useEffect(() => {
      const handleResize = () => {
        setContainerWidth(getContainerWidth());
      };
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, [columns]);

    // Compute dimensions using current containerWidth
    const columnWidth = containerWidth / columns;
    const calculatedHeight = Math.max(minHeight, (columnWidth * 4) / 3);
    const calculatedWidth = (calculatedHeight * 3) / 4;

    // Compute trimmed images using useMemo to prevent duplicate filtering
    const trimmedImages = useMemo(() => {
      let validImages = images.filter(img => img.coverUrl);
      if (validImages.length > 30)
        return validImages.slice(0, 30);
      else if (validImages.length < 30 && validImages.length >= 15)
        return validImages.slice(0, 15);
      else if (validImages.length < 15 && validImages.length >= 10)
        return validImages.slice(0, 10);
      else if (validImages.length < 10 && validImages.length >= 5)
        return validImages.slice(0, 5);
      else
        return validImages.slice(0, 1);
    }, [images]);

    // Distribute trimmedImages among columns using a round-robin approach
    const colImages = new Array(columns).fill(null).map(() => []);
    trimmedImages.forEach((img, index) => {
      const colIndex = index % columns;
      colImages[colIndex].push(img);
    });

    return (
      <div>
      <div className="flex justify-center gap-2 overflow-hidden">
        {colImages.map((col, i) => (
          <div
            key={i}
            className="flex flex-col gap-2"
            style={{ transform: i % 2 === 1 ? `translateY(-${offset}px)` : "none" }}
          >
            {col.map((img, j) => (
              <div
                key={j}
                style={{ height: `${calculatedHeight}px`, width: `${calculatedWidth}px` }}
                className="rounded overflow-hidden"
              >
                <img
                  src={img.coverUrl}
                  alt={`Box Art ${j}`}
                  className="rounded w-full h-full object-cover opacity-20"
                />
              </div>
              
            ))}
          </div>
        ))}
      </div>

        </div>
    );
  };

  export default MasonryBoxArtGrid;