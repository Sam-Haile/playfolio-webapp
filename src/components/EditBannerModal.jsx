import React, { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import HeroSearchBar from "./HeroSearchBar"; // Or wherever your HeroSearchBar is located

const EditBannerModal = ({ onClose, user, onBannerUpdate }) => {
  const [banners, setBanners] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);

  // Adjust pagination if needed
  const ITEMS_PER_PAGE = 20;
  const startIndex = currentPage * ITEMS_PER_PAGE;
  const displayedBanners = banners.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const nextPage = () => {
    if ((currentPage + 1) * ITEMS_PER_PAGE < banners.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const applyBanner = async (bannerUrl) => {
    if (!user) return;
    try {
      console.log("🖼️ Applying banner:", bannerUrl);
      const userDocRef = doc(db, "users", user.uid);

      // Here we store the banner in Firestore’s "bannerImage" field
      await updateDoc(userDocRef, { bannerImage: bannerUrl });

      // Immediately update parent state
      if (onBannerUpdate) {
        onBannerUpdate(bannerUrl);
      }

      onClose();
    } catch (error) {
      console.error("❌ Error updating banner:", error);
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
        <div className="flex flex-cols mb-4 px-8 pt-4">
          <button onClick={onClose} className="flex items-center justify-center w-6">
            <img src="./src/assets/icons/backArrow.svg" alt="Go Back" />
          </button>
          <h1 className="text-white text-lg flex w-full items-center justify-center">
            Choose a Banner
          </h1>
        </div>

        {/* Hero Search Bar: pass setBanners to capture the search results */}
        <div className="w-full flex justify-center px-8">
          <HeroSearchBar className="w-[90%]" onResults={setBanners} />
        </div>

        {/* Banner Grid */}
        <div className="p-8 w-full overflow-y-auto max-h-[50vh] grid lg:grid-cols-3 sm:grid-cols-2 gap-4 flex-grow">
          {displayedBanners.length > 0 ? (
            displayedBanners.map((banner, index) => (
              <div
                key={index}
                onClick={() => applyBanner(banner.url || banner.image)}
                className="bg-black lg:h-[150px] sm:h-[100px] flex items-center 
                           justify-center rounded-lg text-white text-lg 
                           cursor-pointer hover:bg-gray-800 transition"
              >
                <img
                  src={banner.url || banner.image}
                  alt="Game Banner"
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            ))
          ) : (
            <p className="text-center text-white w-full col-span-full pt-4" />
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
                }`}
            >
              Previous
            </button>
            <p className="text-white flex justify-center items-center">
              Page {currentPage + 1}
            </p>
            <button
              onClick={nextPage}
              disabled={startIndex + ITEMS_PER_PAGE >= banners.length}
              className={`px-4 py-2 text-white rounded-lg disabled:opacity-50 
                ${
                  currentPage === 0
                    ? "bg-primaryPurple-700"
                    : "bg-primaryPurple-500 hover:bg-primaryPurple-700"
                }`}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditBannerModal;
