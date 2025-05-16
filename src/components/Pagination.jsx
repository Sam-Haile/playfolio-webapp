import React from "react";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {

    const getPaginationItems = (currentPage, totalPages) => {
        // for small page‐counts, just list them all
        if (totalPages <= 7) {
          return Array.from({ length: totalPages }, (_, i) => i + 1);
        }
      
        const pages = [1];
        // Determine our “window” around currentPage
        const left = Math.max(currentPage - 1, 2);
        const right = Math.min(currentPage + 1, totalPages - 1);
      
        // leading ellipsis
        if (left > 2) pages.push("...");
        // the sliding window
        for (let p = left; p <= right; p++) {
          pages.push(p);
        }
        // trailing ellipsis
        if (right < totalPages - 1) pages.push("...");
        // last page
        pages.push(totalPages);
      
        return pages;
      };
      

      const paginationItems = getPaginationItems(currentPage, totalPages);

      return (
        <div className="flex justify-center items-center my-4">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 mx-2 text-white bg-primaryPurple-500 hover:bg-primaryPurple-700 rounded disabled:pointer-events-none disabled:opacity-50"
          >
            Previous
          </button>
      
{/* Full pagination only on md+ screens */}
<div className="hidden md:flex px-4">
  {paginationItems.map((item, idx) =>
    item === "…" || item === "..." ? (
      <span
        key={idx}
        className="pointer-events-none select-none px-2 py-1 flex justify-center items-center"
      >
        …
      </span>
    ) : (
      <button
        key={idx}
        onClick={() => onPageChange(item)}
        disabled={item === currentPage}
        className={`m-1 px-3 py-1 rounded ${
          item === currentPage
            ? "bg-primaryPurple-500 text-white"
            : "bg-gray-300 text-footerGray hover:bg-primaryPurple-700 hover:text-white"
        } disabled:pointer-events-none `}
      >
        {item}
      </button>
    )
  )}
</div>

      {/* Mobile pagination view */}
<div className="flex md:hidden px-4 text-sm gap-2 items-center">
  <span className="text-white">
    Page {currentPage} of {totalPages}
  </span>
</div>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-white bg-primaryPurple-500 hover:bg-primaryPurple-700 rounded disabled:pointer-events-none disabled:opacity-50"
          >
            Next
          </button>
        </div>
      );      
};

export default Pagination;
