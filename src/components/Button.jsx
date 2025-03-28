import React from "react";

const Button = ({ text, onClick, className }) => {
  return (
    <button
      className={`px-4 py-2 rounded-lg font-bold text-white ${className}`}
      onClick={onClick}
    >
      {text}
    </button>
  );
};

export default Button;


