import React from "react";
import ReactDOM from "react-dom";

const ImageOverlay = ({ src, alt, onClose }) => {
  const overlayContent = (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black bg-opacity-80"
      onClick={onClose}
    >
      <img
        src={src}
        alt={alt}
        className="z-[1001] md:max-w-[50%] max-w-[95%] max-h-[75%] object-contain border-4 border-customBlack rounded"
        onClick={(e) => e.stopPropagation()}
      />
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white text-2xl font-bold z-[1002]"
      >
        ×
      </button>
    </div>
  );

  return ReactDOM.createPortal(overlayContent, document.body);
};

export default ImageOverlay;
