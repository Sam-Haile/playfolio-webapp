import React, { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db, storage } from "../firebaseConfig";
import HeroSearchBar from "./HeroSearchBar";
import ComputerIcon from "../assets/icons/ComputerIcon";
import PaletteIcon from "../assets/icons/PaletteIcon";
import HorizontalLine from "../components/HorizontalLine";
import bannerPlaceholder from "../assets/icons/pfp.svg";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

/**
 * Modal that lets a user update their banner.  
 * — Two tabs:  
 *   • "Search Banners" = uses HeroSearchBar to query remote images (same behaviour as EditIconModal).  
 *   • "Upload Image"   = lets the user upload a banner from their computer.  
 * — Pagination identical to EditIconModal (20 items / page).  
 * — Selected image is written to `users/{uid}.bannerImage` in Firestore and returned via `onBannerUpdate`.  
 */
const EditBannerModal = ({ onClose, user, onBannerUpdate }) => {
  // Remote‑search results
  const [banners, setBanners] = useState([]);
  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  // Tab state: "search" | "upload"
  const [selectedTab, setSelectedTab] = useState("search");
  // Upload spinner
  const [uploading, setUploading] = useState(false);

  /* ---------------- Pagination helpers ---------------- */
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

  /* ---------------- Apply / Upload logic ---------------- */
  const updateBannerField = async (url) => {
    if (!user) return;
    try {
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, { bannerImage: url });
      if (onBannerUpdate) onBannerUpdate(url);
      onClose();
    } catch (err) {
      console.error("\u274C Error updating banner:", err);
    }
  };

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5mb

  const handleFile = async (file) => {
    if (!file || !user) return;

    if(!file.type.startsWith("image/")){
      alert("Only image files are allowed");
      return;
    }
    
    if(file.size > MAX_FILE_SIZE){
      alert("Please pick an image smaller then 5 MB.");
      return;
    }
    

    try {
      setUploading(true);
      // Put in a per‑user folder – helps keep Storage tidy
      const storageRef = ref(storage, `profileBanners/${user.uid}/${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      await updateBannerField(downloadURL);
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  /* ======================= Render ====================== */
  return (
    <div
      onClick={onClose}
      className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-75 flex justify-center items-center z-50"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-[75%] h-[70%] bg-customBlack flex flex-col rounded-lg relative"
      >
        {/* ---------- Header ---------- */}
        <div className="flex flex-cols mb-4 px-8 pt-4">
          <button onClick={onClose} className="flex items-center justify-center w-6">
            <img src="./src/assets/icons/backArrow.svg" alt="Go back" />
          </button>
          <h1 className="text-white text-base font-semibold flex w-full items-center justify-center">
            Change banner image
          </h1>
        </div>

        {/* ---------- Tabs ---------- */}
        <div className="h-18 min-h-18 grid grid-cols-2">
          {/* Search Tab */}
          <div
            onClick={() => setSelectedTab("search")}
            className={`w-full h-16 py-2 flex flex-col justify-center items-center cursor-pointer transition duration-150 ${selectedTab === "search" ? "bg-customGray-800" : "hover:bg-customGray-900"}`}
          >
            <PaletteIcon width="40px" height="40px" />
            <p className="text-sm">Search Banners</p>
          </div>
          {/* Upload Tab */}
          <div
            onClick={() => setSelectedTab("upload")}
            className={`w-full h-16 py-2 flex flex-col justify-center items-center cursor-pointer transition duration-150 ${selectedTab === "upload" ? "bg-customGray-800" : "hover:bg-customGray-900"}`}
          >
            <ComputerIcon width="40px" height="40px" />
            <p className="text-sm">Upload Image</p>
          </div>
        </div>

        <HorizontalLine width="w-full" marginBottom="mb-4" marginTop="mt-0" />

        {/* ---------- Content ---------- */}
        <div className="w-full flex flex-col flex-grow px-4 overflow-y-auto pb-4">
          {/* ================= Upload ================= */}
          {selectedTab === "upload" ? (
            <div className="text-white flex flex-col justify-center items-center h-full rounded border-2 border-dashed border-darkGray p-8">
              <img src={bannerPlaceholder} className="w-36 pb-4" alt="placeholder" />
              <p>Drag Image</p>
              <p className="italic">or</p>

              <label
                htmlFor="bannerFileUpload"
                className="mt-2 w-64 h-12 bg-primaryPurple-500 hover:bg-primaryPurple-600 rounded-3xl flex items-center justify-center cursor-pointer"
              >
                {uploading ? "Uploading..." : "Upload from Computer"}
              </label>
              <input
                type="file"
                id="bannerFileUpload"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFile(e.target.files[0])}
              />
            </div>
          ) : (
            /* ================= Search ================= */
            <>
              <div className="w-full flex justify-center">
                <HeroSearchBar className="w-[90%]" onResults={setBanners} />
              </div>

              <div
                className="p-8 w-full overflow-y-auto max-h-[50vh] grid lg:grid-cols-3 sm:grid-cols-2 gap-4 flex-grow"
              >
                {displayedBanners.length > 0 ? (
                  displayedBanners.map((banner, index) => (
                    <div
                      key={index}
                      onClick={() => updateBannerField(banner.url || banner.image)}
                      className="bg-black lg:h-[150px] sm:h-[100px] flex items-center justify-center rounded-lg cursor-pointer hover:bg-gray-800 transition"
                    >
                      <img
                        src={banner.url || banner.image}
                        alt="Game Banner"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  ))
                ) : (
                  <p className="text-center text-white w-full col-span-full  flex items-center justify-center">No banners found.</p>
                )}
              </div>

              {/* Pagination */}
              <div className="pt-4 p-8">
                <div className="flex justify-center mt-auto px-4">
                  <button
                    onClick={prevPage}
                    disabled={currentPage === 0}
                    className={`px-4 py-2 text-white rounded-lg mr-4 disabled:opacity-50 ${currentPage === 0 ? "bg-primaryPurple-700" : "bg-primaryPurple-500 hover:bg-primaryPurple-700"}`}
                  >
                    Previous
                  </button>
                  <p className="text-white flex justify-center items-center">
                    Page {currentPage + 1}
                  </p>
                  <button
                    onClick={nextPage}
                    disabled={startIndex + ITEMS_PER_PAGE >= banners.length}
                    className={`px-4 py-2 text-white rounded-lg ml-4 disabled:opacity-50 ${startIndex + ITEMS_PER_PAGE >= banners.length ? "bg-primaryPurple-700" : "bg-primaryPurple-500 hover:bg-primaryPurple-700"}`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditBannerModal;
