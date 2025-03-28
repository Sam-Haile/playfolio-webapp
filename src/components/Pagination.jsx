import React from "react";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {

    const getPaginationItems = (currentPage, totalPages) => {
        //If theres 5 or less pages, just show them all
        if (totalPages <= 5) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        if (currentPage <= 3) {
            //Early pages: show first three pages, ellipsis, and the last page
            return [1, 2, 3, "...", totalPages];
        } else if (currentPage >= totalPages - 2) {
            //Late pages: show first page, ellipsis, three pages centered on current page
            return [1, "...", totalPages - 2, totalPages - 1, totalPages];
        } else {
            //Middle pages: show first page, ellipsis, three pages centered on the current page
            return [1, "...", currentPage - 1, currentPage, currentPage + 1]
        }
    };

    const paginationItems = getPaginationItems(currentPage, totalPages);

    return (
        <div className="flex justify-center items-center my-4">
            {/* Previous button */}
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 mx-2 text-white bg-primaryPurple-500 hover:bg-primaryPurple-700 rounded disabled:pointer-events-none disabled:opacity-50"
            >
                Previous
            </button>

            {/* Render pagination items */}
            <div className="flex px-4">
            {paginationItems.map((item, index) => {
                if (item === "...") {
                    return (
                        <span key={index} className="pointer-events-none select-none px-2 py-1 flex justify-center align-center items-center">
                            {item}
                        </span>
                    );
                } 
                
                const isCurrent = item === currentPage;

                    return (
                        <button
                            key={index}
                            onClick={!isCurrent ? () => onPageChange(item) : undefined}
                            disabled={isCurrent}
                            className={`m-1 px-3 py-1 rounded ${item === currentPage
                                    ? "bg-primaryPurple-500 text-white"
                                    : "bg-gray-200 text-gray-700 hover:bg-primaryPurple-700 hover:text-white disabled:pointer-events-none"
                                }`}
                        >
                            {item}
                        </button>
                    );
            })}
            </div>

            {/* Next button */}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex justify-center align-center items-center px-4 py-2 text-white bg-primaryPurple-500 hover:bg-primaryPurple-700 rounded disabled:opacity-50 disabled:pointer-events-none"
            >
                Next
            </button>
        </div>
    );
};

export default Pagination;
