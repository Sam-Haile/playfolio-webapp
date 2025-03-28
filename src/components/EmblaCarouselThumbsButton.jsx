import React from 'react';

export const Thumb = ({ selected, onClick, imageUrl }) => (
  <button
    className={`embla-thumbs__slide ${selected ? 'is-selected' : ''}`}
    type="button"
    onClick={onClick}
    aria-label="Thumbnail"
  >
    <img
      src={imageUrl}
      alt="Thumbnail"
      className="embla-thumbs__slide__img"
      style={{
        border: selected ? '2px solid #fff' : '2px solid transparent',
        borderRadius: '4px',
      }}
    />
  </button>
);
