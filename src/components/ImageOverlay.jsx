import React from "react";

/**
 * Props:
 *  - src: The image URL
 *  - alt: Alt text
 *  - onClose: Function to close the overlay
 */
const ImageOverlay = ({ src, alt, onClose }) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
      onClick={onClose}
    >
      {/* Stop clicks on the image from closing the overlay */}
      <img
        src={src}
        alt={alt}
        className="max-w-[50%] max-h-[75%] object-contain border-4 border-customBlack rounded"
        onClick={(e) => e.stopPropagation()}
      />
      {/* Optional Close Button in top-right corner */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white text-2xl font-bold"
      >
        ×
      </button>
    </div>
  );
};

export default ImageOverlay;
