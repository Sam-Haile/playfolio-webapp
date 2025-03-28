import React, { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import IconSearchBar from "../components/IconSearchBar"; // Your IconSearchBar

const EditIconModal = ({ onClose, user, onIconUpdate }) => {
  const [icons, setIcons] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);

  // Adjust pagination as needed
  const ITEMS_PER_PAGE = 20;
  const startIndex = currentPage * ITEMS_PER_PAGE;
  const displayedIcons = icons.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const nextPage = () => {
    if ((currentPage + 1) * ITEMS_PER_PAGE < icons.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const applyIcon = async (iconUrl) => {
    if (!user) return;
    try {
      console.log("🖼️ Applying icon:", iconUrl);
      const userDocRef = doc(db, "users", user.uid);
      
      // Here we store it in a "profileIcon" field; feel free to rename
      await updateDoc(userDocRef, { profileIcon: iconUrl });

      // Update parent state immediately
      if (onIconUpdate) {
        onIconUpdate(iconUrl);
      }

      onClose();
    } catch (error) {
      console.error("❌ Error updating icon:", error);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-75 flex justify-center items-center z-50"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-[75%] h-[70%] bg-customBlack flex flex-col rounded-lg relative"
      >
        {/* Header */}
        <div className="flex flex-cols mb-4 px-8 pt-4">
          <button
            onClick={onClose}
            className="flex items-center justify-center w-6"
          >
            <img src="./src/assets/icons/backArrow.svg" />
          </button>
          <h1 className="text-white text-lg flex w-full items-center justify-center">
            Choose an Icon
          </h1>
        </div>

        {/* IconSearchBar */}
        <div className="w-full flex justify-center px-8">
          {/* 
            Important:
            Pass a callback to capture results (setIcons).
          */}
          <IconSearchBar className="w-[90%]" onResults={setIcons} />
        </div>

        {/* Icons Grid */}
        <div
          className="p-8 w-full overflow-y-auto max-h-[50vh] 
            grid lg:grid-cols-6 sm:grid-cols-4 gap-4 flex-grow"
        >
          {displayedIcons.length > 0 ? (
            displayedIcons.map((icon, index) => (
              <div
                key={index}
                onClick={() => applyIcon(icon.url || icon.image)}
                className="bg-black aspect-square 
                   flex items-center justify-center 
                   rounded-lg text-white text-lg 
                   cursor-pointer hover:bg-gray-800 transition"
              >
                <img
                  src={icon.url || icon.image}
                  alt="Game Icon"
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            ))
          ) : (
            <p className="text-center text-white w-full col-span-full pt-4"></p>
          )}
        </div>

        {/* Pagination Controls */}
        <div className="pt-4 p-8">
          <div className="flex justify-between mt-auto px-4">
            <button
              onClick={prevPage}
              disabled={currentPage === 0}
              className={`px-4 py-2 text-white rounded-lg disabled:opacity-50 
                ${
                  currentPage === 0
                    ? "bg-primaryPurple-700"
                    : "bg-primaryPurple-500 hover:bg-primaryPurple-700"
                }
              `}
            >
              Previous
            </button>
            <p className="text-white flex justift-center items-center">
              Page {currentPage + 1}
            </p>
            <button
              onClick={nextPage}
              disabled={startIndex + ITEMS_PER_PAGE >= icons.length}
              className={`px-4 py-2 text-white rounded-lg disabled:opacity-50 
                ${
                  currentPage === 0
                    ? "bg-primaryPurple-700"
                    : "bg-primaryPurple-500 hover:bg-primaryPurple-700"
                }
              `}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditIconModal;
