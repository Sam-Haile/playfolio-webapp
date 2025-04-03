import React, { useState } from "react";

const DynamicLogo = ({ url, gameName, maxSize, minSize, marginLeft = "ml-4" }) => {
  const [widthClass, setWidthClass] = useState("w-60");

  const handleLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target;
    const aspectRatio = naturalWidth / naturalHeight;
    if (aspectRatio < 1.3) {
      setWidthClass(minSize);
    } else {
      setWidthClass(maxSize);
    }
  };

  return (
    <img
      src={url}
      alt={`${gameName} logo`}
      onLoad={handleLoad}
      className={`${marginLeft} h-auto self-auto ${widthClass}`}
    />
  );
};

export default DynamicLogo;
