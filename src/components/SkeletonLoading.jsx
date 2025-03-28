import React from "react";
import Header from "./Header";

const SkeletonLoading = ({ type }) => {
  return (
    <div className="h-[100%]">
      <Header showSearchBar={true} showNavButtons={true} showLoginButtons={false} zIndex={20} />

      {/* ✅ Skeleton for Game Page */}
      {type === "game" && (
        <div className="bg-white h-[75vh] relative mt-32">
          {/* Skeleton Hero Section */}
          <div className="bg-gray-300 h-[75vh] relative flex items-center justify-center pointer-event:none">
            <div className="w-full h-full bg-gray-200 animate-pulse"></div>
          </div>

          {/* Gradients */}
          <div>
            <div
              className="absolute top-0 h-[100%] w-full pointer-events-none z-10"
              style={{
                background: "linear-gradient(to bottom, #121212 0%, transparent 60%)",
              }}
            ></div>
            <div
              className="absolute bottom-0 h-[100%] w-full pointer-events-none z-10"
              style={{
                background: "linear-gradient(to top, #121212 25%, transparent 85%)",
              }}
            ></div>
          </div>

          <div className="absolute inset-0 bg-customBlack bg-opacity-0 z-30">
            <div className="h-[60%] grid grid-cols-[auto_40%_35%] mx-[15%]">
              {/* Skeleton Cover Image */}
              <div className="relative">
                <div className="relative w-full h-full bg-gray-300 animate-pulse rounded"></div>
              </div>

              {/* Skeleton Game Details */}
              <div className="grid grid-rows-[auto] h-auto self-end pl-4">
                <div className="flex flex-col items-start gap-2">
                  <div className="w-[50px] h-[50px] bg-gray-200 animate-pulse rounded mt-2"></div>
                  <div className="w-[120px] h-[40px] bg-gray-200 animate-pulse rounded"></div>
                </div>

                <div className="flex flex-col h-full mt-4">
                  <div className="w-[70%] h-[30px] bg-gray-200 animate-pulse rounded"></div>
                  <div className="w-[50%] h-[20px] bg-gray-200 animate-pulse rounded mt-2"></div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="mx-[15%] grid grid-cols-[65%_35%]">
              <div className="h-[auto]">
                {/* Skeleton Horizontal Line */}
                <div className="w-full h-[2px] bg-gray-300 animate-pulse my-8"></div>

                {/* Skeleton Info Section */}
                <div className="grid grid-cols-3 gap-8">
                  <div className="w-[80%]">
                    <div className="w-[40%] h-[20px] bg-gray-300 animate-pulse mb-2"></div>
                    <div className="w-full h-[20px] bg-gray-200 animate-pulse"></div>
                  </div>

                  <div>
                    <div className="w-[50%] h-[20px] bg-gray-300 animate-pulse mb-2"></div>
                    <div className="w-full h-[20px] bg-gray-200 animate-pulse"></div>
                  </div>

                  <div>
                    <div className="w-[40%] h-[20px] bg-gray-300 animate-pulse mb-2"></div>
                    <div className="w-full h-[20px] bg-gray-200 animate-pulse"></div>
                  </div>
                </div>

                <div className="w-full h-[2px] bg-gray-300 animate-pulse my-8"></div>

                {/* Skeleton Media Section */}
                <div className="mt-12">
                  <div className="w-[30%] h-[20px] bg-gray-300 animate-pulse mb-4"></div>
                  <div className="w-full h-[300px] bg-gray-200 animate-pulse rounded"></div>
                </div>
              </div>

              {/* Skeleton Sidebar */}
              <div>
                <div className="bg-gray-300 rounded h-[200px] w-[90%] ml-12 animate-pulse"></div>
                <div className="bg-gray-300 rounded h-[300px] w-[90%] ml-12 mt-14 animate-pulse"></div>
                <div className="mt-16 pl-12">
                  <div className="w-[30%] h-[20px] bg-gray-300 animate-pulse mb-4"></div>
                  <div className="w-full h-[100px] bg-gray-200 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Skeleton for Developer Page */}
      {type === "developer" && (
        <div className="h-[100%]">
        {/* Hero Section Skeleton */}
        <div className="relative w-full max-h-[75vh] overflow-hidden mt-8">
          {/* Background Grid Skeleton */}
          <div className="grid grid-cols-8 gap-2">
            {Array(8).fill(0).map((_, index) => (
              <div key={index} className="w-full h-[580px] bg-gray-700 animate-pulse rounded"></div>
            ))}
          </div>

        {/* ✅ Developer Info Skeleton */}
        <div className="absolute z-50 top-0 mx-[15%] h-full flex flex-col justify-center">
          <div className="bg-customBlack p-8 rounded-lg drop-shadow-lg bg-opacity-70">
            <div className="w-[180px] h-[60px] bg-gray-500 animate-pulse rounded"></div>
            <div className="flex flex-col items-start mt-4">
              <div className="w-[60%] h-[20px] bg-gray-400 animate-pulse rounded"></div>
              <div className="w-[40%] h-[15px] bg-gray-300 animate-pulse rounded mt-2"></div>
            </div>
  
            {/* Websites Skeleton */}
            <div className="italic font-light text-s flex items-center pt-2">
              <div className="w-[40px] h-[40px] bg-gray-400 animate-pulse rounded mr-2"></div>
              <div className="w-[120px] h-[20px] bg-gray-300 animate-pulse rounded"></div>
            </div>
          </div>
        </div>
  
          {/* Gradients */}
          <div>
            <div className="absolute top-0 h-[100%] w-full pointer-events-none z-10"
              style={{ background: "linear-gradient(to bottom, #121212 0%, transparent 60%)" }}>
            </div>
            <div className="absolute bottom-0 h-[100%] w-full pointer-events-none z-10"
              style={{ background: "linear-gradient(to top, #121212 25%, transparent 85%)" }}>
            </div>
          </div>
        </div>
  
  
        {/* ✅ About Section Skeleton */}
        <div className="mx-[15%] mt-20">
          <div className="w-[200px] h-[25px] bg-gray-400 animate-pulse rounded"></div>
          <div className="w-[70%] h-[15px] bg-gray-300 animate-pulse rounded mt-4"></div>
          <div className="w-[50%] h-[15px] bg-gray-300 animate-pulse rounded mt-2"></div>
        </div>
  
        {/* ✅ Games List Skeleton */}
        <div className="mx-[15%] mt-[30px]">
          <div className="flex flex-cols items-center justify-between">
            <div className="w-[300px] h-[25px] bg-gray-400 animate-pulse rounded"></div>
            <div className="w-[150px] h-[35px] bg-gray-400 animate-pulse rounded"></div>
          </div>
  
          <div className="w-full h-[2px] bg-gray-400 animate-pulse my-8"></div>
  
          <div className="mt-[20px] grid grid-cols-5 gap-2">
            {Array(10).fill(0).map((_, index) => (
              <div key={index} className="relative rounded-lg p-4">
                {/* Game Cover Skeleton */}
                <div className="w-full h-[220px] bg-gray-500 animate-pulse rounded"></div>
  
                {/* Game Info Skeleton */}
                <div className="mt-2">
                  <div className="w-[80%] h-[20px] bg-gray-400 animate-pulse rounded"></div>
                  <div className="flex flex-row mt-2">
                    <div className="w-[40px] h-[25px] bg-gray-300 animate-pulse rounded"></div>
                    <div className="w-[60px] h-[15px] bg-gray-300 animate-pulse rounded ml-2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
  
          {/* Pagination Skeleton */}
          <div className="flex justify-between mt-4">
            <div className="w-[120px] h-[40px] bg-gray-400 animate-pulse rounded"></div>
            <div className="w-[120px] h-[40px] bg-gray-400 animate-pulse rounded"></div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};

export default SkeletonLoading;
