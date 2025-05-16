import React, { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import IconSearchBar from "../components/IconSearchBar";
import ComputerIcon from "../assets/icons/ComputerIcon";
import PaletteIcon from "../assets/icons/PaletteIcon";
import HorizontalLine from "../components/HorizontalLine";
import pfpIcon from "../assets/icons/pfpFallback.svg";
import { storage } from "../firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const EditIconModal = ({ onClose, user, onIconUpdate }) => {
  const [icons, setIcons] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedTab, setSelectedTab] = useState("search");
  const [uploading, setUploading] = useState(false);

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
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, { profileIcon: iconUrl });
      if (onIconUpdate) onIconUpdate(iconUrl);
      onClose();
    } catch (error) {
      console.error("❌ Error updating icon:", error);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-75 flex justify-center items-center z-[9999]"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="md:w-[75%] w-[90%] md:h-[70%] h-[80%] bg-customBlack flex flex-col rounded-lg relative"
      >
        {/* Header */}
        <div className="flex flex-cols mb-4 px-8 pt-4">
          <button
            onClick={onClose}
            className="flex items-center justify-center w-6"
          >
            <img src="/icons/backArrow.svg" />
          </button>
          <h1 className="text-white text-base font-semibold flex w-full items-center justify-center">
            Change profile picture
          </h1>
        </div>

        {/* Tabs */}
        <div className="h-18 min-h-18 grid grid-cols-2">
          <div
            onClick={() => setSelectedTab("search")}
            className={`w-full h-16 py-2 flex flex-col justify-center items-center cursor-pointer transition duration-150 ${selectedTab === "search" ? "bg-customGray-800" : "hover:bg-customGray-900"}`}
          >
            <PaletteIcon width="40px" height="40px" />
            <p className="text-sm">Search Icons</p>
          </div>

          <div
            onClick={() => setSelectedTab("upload")}
            className={`w-full h-16 py-2 flex flex-col justify-center items-center cursor-pointer transition duration-150 ${selectedTab === "upload" ? "bg-customGray-800" : "hover:bg-customGray-900"}`}
          >
            <ComputerIcon width="40px" height="40px" />
            <p className="text-sm">Upload Image</p>
          </div>

        </div>

        <HorizontalLine width="w-full" marginBottom="mb-4" marginTop="mt-0" />

        {/* Content */}
        <div className="w-full flex flex-col flex-grow px-4 overflow-y-auto pb-4">
          {selectedTab === "upload" ? (
            <div className="text-white flex flex-col justify-center items-center h-full rounded border-2 border-dashed border-darkGray p-8">
              <img src={pfpIcon} className="w-36 pb-4" />
              <p className="">Drag Image</p>
              <p className="italic">or</p>

              <label htmlFor="fileUpload" className="mt-2 w-64 h-12 bg-primaryPurple-500 hover:bg-primaryPurple-600 rounded-3xl flex items-center justify-center cursor-pointer">
                {uploading ? "Uploading..." : "Upload from Computer"}
              </label>
              <input
                type="file"
                id="fileUpload"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (!file || !user) return;

                  try {
                    setUploading(true);
                    const storageRef = ref(storage, `profileIcons/${user.uid}/${file.name}`);
                    await uploadBytes(storageRef, file);
                    const downloadURL = await getDownloadURL(storageRef);

                    // Save to Firestore
                    const userDocRef = doc(db, "users", user.uid);
                    await updateDoc(userDocRef, { profileIcon: downloadURL });

                    if (onIconUpdate) {
                      onIconUpdate(downloadURL);
                    }

                    onClose();
                  } catch (err) {
                    console.error("Upload error:", err);
                    alert("Failed to upload image. Please try again.");
                  } finally {
                    setUploading(false);
                  }
                }}
              />
            </div>
          ) : (

            <>
              <div className="w-full flex justify-center">
                <IconSearchBar className="w-[90%]" onResults={setIcons} />
              </div>

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
                  <p className="text-center self-center text-white w-full col-span-full pt-4">No icons found.</p>
                )}
              </div>

              <div className="pt-4 md:p-8 p-0">
                <div className="flex justify-center  mt-auto px-4">
                  <button
                    onClick={prevPage}
                    disabled={currentPage === 0}
                    className={`px-4 py-2 text-white rounded-lg mr-4 disabled:opacity-50 
                      ${currentPage === 0
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
                    disabled={startIndex + ITEMS_PER_PAGE >= icons.length}
                    className={`px-4 py-2 text-white rounded-lg ml-4 disabled:opacity-50 
                      ${currentPage === 0
                        ? "bg-primaryPurple-700"
                        : "bg-primaryPurple-500 hover:bg-primaryPurple-700"
                      }`}
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

export default EditIconModal;
