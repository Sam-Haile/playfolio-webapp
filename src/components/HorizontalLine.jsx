import React from "react";

const HorizontalLine = ({ src, alt, zIndex="z-20", className = "", marginTop = "mt-[10%]", marginBottom = "mb-4", width = "w-[80%]", border = "border-customGray-500", borderThickness=" border-t-2" }) => {
  return (
    <div className={`relative ${zIndex} ${borderThickness} border-customGray-800 ${border} mx-auto ${marginTop} ${marginBottom} ${className} ${width}`}>
    </div>
  );
};

export default HorizontalLine;
