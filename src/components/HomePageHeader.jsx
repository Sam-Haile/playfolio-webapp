import PlayingIcon from "../assets/icons/PlayingIcon";
import BacklogIcon from "../assets/icons/BacklogIcon";
import WishlistIcon from "../assets/icons/WishlistIcon";
import DroppedIcon from "../assets/icons/DroppedIcon";
import ListIcon from "../assets/icons/ListIcon";
import ReviewIcon from "../components/ReviewIcon";
import SearchBar from "../components/SearchBar";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";


const HomePageInfo = ({ user }) => {
  return (
    <div className="grid lg:grid-cols-[45%_55%] lg:grid-cols-[45%] lg:h-60 h-48 ">
      <div className="flex flex-col justify-center h-full w-full pr-4">
        <h1 className="text-4xl font-bold">{`Hello ${user?.username}, Welcome Back!`}</h1>
        <p className="font-light text-lg pt-2">
          Discover trending games, track your progress, <br /> and explore
          your collection
        </p>
      </div>

      <div className="w-full h-auto hidden lg:block md:hidden sm:hidden grid cursor-default grid-cols-2">
        <div className="h-1/2 grid grid-cols-3 pb-2 gap-x-4">
          <a
            href={`/profile?section=games&type=played`}
            className="group overflow-hidden relative border border-opacity-50 border-[5px] border-customGray-800
              hover:border-primaryPurple-500    /* parent */
              rounded p-4 transition-colors duration-300"
          >
            <div className="relative z-20">
              <p className="text-3xl font-semibold text-white group-hover:text-primaryPurple-500 transition-text duration-300">258</p>
              <h2 className="text-xl text-white group-hover:text-primaryPurple-500 transition-text duration-300 group-hover:text-xl group-hover:font-semibold ">Played</h2>
            </div>
            <div
              className="absolute top-[-35px] right-[-45px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
              style={{ transform: "rotate(-35deg)" }}
            >
              <PlayingIcon
                color="#890CED"
                width="180px"
                height="180px"
                viewBox="24"
              />
            </div>

            <div
              className="absolute top-[-35px] right-[-45px] pointer-events-none opacity-50 group-hover:opacity-0 transition-opacity duration-300 z-10"
              style={{ transform: "rotate(-35deg)" }}
            >
              <PlayingIcon
                color="#5E5E5E"
                width="180px"
                height="180px"
                viewBox="24"
              />
            </div>
          </a>

          <a
            href={`/profile?section=games&type=backlog`}
            className="group overflow-hidden relative border border-opacity-50 border-[5px] border-customGray-800
              hover:border-primaryPurple-500    /* parent */
              rounded p-4 transition-colors duration-300"
          >
            <div className="relative z-20">
              <p className="text-3xl font-semibold text-white group-hover:text-primaryPurple-500 transition-text duration-300">12</p>
              <h2 className="text-xl text-white group-hover:text-primaryPurple-500 transition-text duration-300 group-hover:text-xl group-hover:font-semibold">Backlogs</h2>
            </div>
            <div
              className="absolute top-[-20px] right-[-30px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
              style={{ transform: "rotate(-35deg)" }}
            >
              <BacklogIcon
                color="#890CED"
                width="150px"
                height="150px"
                viewBox="24"
              />
            </div>
            <div
              className="absolute top-[-20px] right-[-30px] pointer-events-none opacity-50 group-hover:opacity-0 transition-opacity duration-300 z-10"
              style={{ transform: "rotate(-35deg)" }}
            >
              <BacklogIcon
                color="#5E5E5E"
                width="150px"
                height="150px"
                viewBox="24"
              />
            </div>
          </a>

          <a
            href={`/profile?section=reviews`}
            className="group overflow-hidden relative border border-opacity-50 border-[5px] border-customGray-800
              hover:border-primaryPurple-500    /* parent */
              rounded p-4 transition-colors duration-300"
          >
            {" "}
            <div className="relative z-20">
              <p className="text-3xl font-semibold text-white group-hover:text-primaryPurple-500 transition-text duration-300">23</p>
              <h2 className="text-xl text-white group-hover:text-primaryPurple-500 transition-text duration-300 group-hover:text-xl group-hover:font-semibold">Reviews</h2>
            </div>
            <div
              className="absolute top-[-20px] right-[-30px] pointer-events-none  opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
              style={{ transform: "rotate(-35deg)" }}
            >
              <ReviewIcon
                color="#890CED"
                width="150px"
                height="150px"
                viewBox="24"
              />
            </div>
            <div
              className="absolute top-[-20px] right-[-30px] pointer-events-none opacity-50 group-hover:opacity-0 transition-opacity duration-300 z-10"
              style={{ transform: "rotate(-35deg)" }}
            >
              <ReviewIcon
                color="#5E5E5E"
                width="150px"
                height="150px"
                viewBox="24"
              />
            </div>
          </a>
        </div>

        <div className="h-1/2 gap-x-4 grid pt-2 grid-cols-3">
          <a
            href={`/profile?section=games&type=wishlist`}
            className="group overflow-hidden relative border border-opacity-50 border-[5px] border-customGray-800
              hover:border-primaryPurple-500    /* parent */
              rounded p-4 transition-colors duration-300"
          >
            {" "}
            <div className="relative z-20">
              <p className="text-3xl font-semibold text-white group-hover:text-primaryPurple-500 transition-text duration-300">35</p>
              <h2 className="text-xl text-white group-hover:text-primaryPurple-500 transition-text duration-300 group-hover:text-xl group-hover:font-semibold">Wishlisted</h2>
            </div>
            <div
              className="absolute top-[-15px] right-[-30px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
              style={{ transform: "rotate(-35deg)" }}
            >
              <WishlistIcon
                color="#890CED"
                width="150px"
                height="150px"
                viewBox="24"
              />
            </div>
            <div
              className="absolute top-[-15px] right-[-30px] pointer-events-none opacity-50 group-hover:opacity-0 transition-opacity duration-300 z-10"
              style={{ transform: "rotate(-35deg)" }}
            >
              <WishlistIcon
                color="#5E5E5E"
                width="150px"
                height="150px"
                viewBox="24"
              />
            </div>
          </a>

          <a
            href={`/profile?section=games&type=dropped`}
            className="group overflow-hidden relative border border-opacity-50 border-[5px] border-customGray-800
              hover:border-primaryPurple-500    /* parent */
              rounded p-4 transition-colors duration-300"
          >
            {" "}
            <div className="relative z-20 cursor-default">
              <p className="text-3xl font-semibold text-white group-hover:text-primaryPurple-500 transition-text duration-300">8</p>
              <h2 className="text-xl text-white group-hover:text-primaryPurple-500 transition-text duration-300 group-hover:text-xl group-hover:font-semibold">Dropped</h2>
            </div>
            <div
              className="absolute top-[-10px] right-[-30px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
              style={{ transform: "rotate(-35deg)" }}
            >
              <DroppedIcon
                color="#890CED"
                width="130px"
                height="130px"
                viewBox="24"
              />
            </div>
            <div
              className="absolute top-[-10px] right-[-30px] pointer-events-none opacity-50 group-hover:opacity-0 transition-opacity duration-300 z-10"
              style={{ transform: "rotate(-35deg)" }}
            >
              <DroppedIcon
                color="#5E5E5E"
                width="130px"
                height="130px"
                viewBox="24"
              />
            </div>
          </a>

          <a
            href={`/profile?section=lists`}
            className="group overflow-hidden relative border border-opacity-50 border-[5px] border-customGray-800
              hover:border-primaryPurple-500    /* parent */
              rounded p-4 transition-colors duration-300"
          >
            {" "}
            <div className="relative z-20">
              <p className="text-3xl font-semibold text-white group-hover:text-primaryPurple-500 transition-text duration-300">258</p>
              <h2 className="text-xl text-white group-hover:text-primaryPurple-500 transition-text duration-300 group-hover:text-xl group-hover:font-semibold">Lists</h2>
            </div>
            <div
              className="absolute top-[-20px] right-[-30px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 "
              style={{ transform: "rotate(-35deg)" }}
            >
              <ListIcon
                color="#890CED"
                width="140px"
                height="140px"
                viewBox="24"
              />
            </div>
            <div
              className="absolute top-[-20px] right-[-30px] pointer-events-none opacity-50 group-hover:opacity-0 transition-opacity duration-300 z-10"
              style={{ transform: "rotate(-35deg)" }}
            >
              <ListIcon
                color="#5E5E5E"
                width="140px"
                height="140px"
                viewBox="24"
              />
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};

export default HomePageInfo;