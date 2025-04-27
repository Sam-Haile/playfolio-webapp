import React, { useState, useEffect, useMemo } from "react";

const MasonryBoxArtGrid = ({
  images,
  columns    = 10,
  minHeight  = 160,
  offset     = 90,     // amount to raise alternate columns (in px)
  widthRatio = 3,      // default box–art ratio: width∶height = 3∶4
  heightRatio= 4,
}) => {
  // compute containerWidth as before…
  const getContainerWidth = () => {
    const containerPadding = 32 + (columns - 1) * 16;
    return typeof window !== "undefined"
      ? window.innerWidth - containerPadding
      : 1200;
  };
  const [containerWidth, setContainerWidth] = useState(getContainerWidth());
  useEffect(() => {
    const handleResize = () => setContainerWidth(getContainerWidth());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [columns]);

  // columnWidth stays the same
  const columnWidth = containerWidth / columns;

  // now height = columnWidth * (heightRatio/widthRatio)
  const calculatedHeight = Math.max(
    minHeight,
    (columnWidth * heightRatio) / widthRatio
  );
  // width is exactly columnWidth
  const calculatedWidth = columnWidth;

  // trimmedImages & distribution logic is unchanged…
  const trimmedImages = useMemo(() => {
    let valid = images.filter(img => img.coverUrl);
    // … your existing slice logic …
    if (valid.length > 30) return valid.slice(0,30);
    if (valid.length >=15)  return valid.slice(0,15);
    if (valid.length >=10)  return valid.slice(0,10);
    if (valid.length >=5)   return valid.slice(0,5);
    return valid.slice(0,1);
  }, [images]);

  const colImages = Array.from({length:columns},()=>[]);
  trimmedImages.forEach((img,i) => {
    colImages[i % columns].push(img);
  });

  return (
    <div className="overflow-hidden">
      <div className="flex justify-center gap-2">
        {colImages.map((col,i) => (
          <div
            key={i}
            className="flex flex-col gap-2"
            style={{ transform: i % 2 ? `translateY(-${offset}px)` : undefined }}
          >
            {col.map((img,j) => (
              <div
                key={j}
                className="rounded overflow-hidden"
                style={{
                  width:  `${calculatedWidth}px`,
                  height: `${calculatedHeight}px`
                }}
              >
                <img
                  src={img.coverUrl}
                  alt=""
                  className="w-full h-full object-cover opacity-20"
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
