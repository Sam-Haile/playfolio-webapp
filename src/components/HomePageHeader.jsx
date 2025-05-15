import PlayingIcon from "../assets/icons/PlayingIcon";
import BacklogIcon from "../assets/icons/BacklogIcon";
import WishlistIcon from "../assets/icons/WishlistIcon";
import DroppedIcon from "../assets/icons/DroppedIcon";
import ListIcon from "../assets/icons/ListIcon";
import ReviewIcon from "../components/ReviewIcon";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

const HomePageInfo = ({ user }) => {
  const [playedCount, setPlayedCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [backlogCount, setBacklogCount] = useState(0);
  const [droppedCount, setDroppedCount] = useState(0);

  useEffect(() => {
    if (!user?.uid) return;

    const fetchStatusCounts = async () => {
      try {
        const countsRef = doc(db, "users", user.uid, "statusesCount", "counts");
        const docSnap = await getDoc(countsRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setPlayedCount(data.Played || 0);
          setWishlistCount(data.Wishlist || 0);
          setBacklogCount(data.Backlog || 0);
          setDroppedCount(data.Dropped || 0);
        } else {
          console.log("No counts found");
        }
      } catch (error) {
        console.error("Error fetching status counts:", error);
      }
    };
    
    fetchStatusCounts();
  }, [user]);
  
  return (
    <div className="grid lg:grid-cols-[60%_40%] lg:grid-cols-[45%] lg:h-60 h-48 ">
      <div className="flex flex-col justify-center h-full w-full pr-4">
        <h1 className="text-4xl font-bold">{`Hello ${user?.username}, Welcome Back!`}</h1>
        <p className="font-light text-lg pt-2">
          Discover trending games, track your progress, <br /> and explore your
          collection
        </p>
      </div>

      <div className="w-full h-auto hidden lg:block md:hidden sm:hidden grid  cursor-default grid-cols-2 ">
        <div className="h-1/2 grid grid-cols-2 pb-2 gap-x-4">
          <a
            href={`/profile?section=games&type=played`}
            className="group overflow-hidden relative border border-opacity-50 border-[5px] border-footerGray
              hover:border-primaryPurple-500    /* parent */
              rounded p-4 transition-colors duration-300"
          >
            <div className="relative z-20">
              <p className="text-3xl font-semibold text-white group-hover:text-primaryPurple-500 transition-text duration-300">
                {playedCount}
              </p>
              <h2 className="text-xl text-white group-hover:text-primaryPurple-500 transition-text duration-300 group-hover:text-xl group-hover:font-semibold ">
                Played
              </h2>
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
                color="#2C2C2C"
                width="180px"
                height="180px"
                viewBox="24"
              />
            </div>
          </a>

          <a
            href={`/profile?section=games&type=backlog`}
            className="group overflow-hidden relative border border-opacity-50 border-[5px] border-footerGray
              hover:border-primaryPurple-500    /* parent */
              rounded p-4 transition-colors duration-300"
          >
            <div className="relative z-20">
              <p className="text-3xl font-semibold text-white group-hover:text-primaryPurple-500 transition-text duration-300">
                {backlogCount}
              </p>
              <h2 className="text-xl text-white group-hover:text-primaryPurple-500 transition-text duration-300 group-hover:text-xl group-hover:font-semibold">
                Backlogs
              </h2>
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
                color="#2C2C2C"
                width="150px"
                height="150px"
                viewBox="24"
              />
            </div>
          </a>

          {/* <a
            href={`/profile?section=reviews`}
            className="group overflow-hidden relative border border-opacity-50 border-[5px] border-footerGray
              hover:border-primaryPurple-500  
              rounded p-4 transition-colors duration-300"
          >
            {" "}
            <div className="relative z-20">
              <p className="text-3xl font-semibold text-white group-hover:text-primaryPurple-500 transition-text duration-300">
                N/a
              </p>
              <h2 className="text-xl text-white group-hover:text-primaryPurple-500 transition-text duration-300 group-hover:text-xl group-hover:font-semibold">
                Reviews
              </h2>
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
                color="#2C2C2C"
                width="150px"
                height="150px"
                viewBox="24"
              />
            </div>
          </a> */}
        </div>

        <div className="h-1/2 gap-x-4 grid pt-2 grid-cols-2">
          <a
            href={`/profile?section=games&type=wishlist`}
            className="group overflow-hidden relative border border-opacity-50 border-[5px] border-footerGray
              hover:border-primaryPurple-500    /* parent */
              rounded p-4 transition-colors duration-300"
          >
            {" "}
            <div className="relative z-20">
              <p className="text-3xl font-semibold text-white group-hover:text-primaryPurple-500 transition-text duration-300">
                {wishlistCount}
              </p>
              <h2 className="text-xl text-white group-hover:text-primaryPurple-500 transition-text duration-300 group-hover:text-xl group-hover:font-semibold">
                Wishlisted
              </h2>
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
                color="#2C2C2C"
                width="150px"
                height="150px"
                viewBox="24"
              />
            </div>
          </a>

          <a
            href={`/profile?section=games&type=dropped`}
            className="group overflow-hidden relative border border-opacity-50 border-[5px] border-footerGray
              hover:border-primaryPurple-500    /* parent */
              rounded p-4 transition-colors duration-300"
          >
            {" "}
            <div className="relative z-20 cursor-default">
              <p className="text-3xl font-semibold text-white group-hover:text-primaryPurple-500 transition-text duration-300">
                {droppedCount}
              </p>
              <h2 className="text-xl text-white group-hover:text-primaryPurple-500 transition-text duration-300 group-hover:text-xl group-hover:font-semibold">
                Dropped
              </h2>
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
                color="#2C2C2C"
                width="130px"
                height="130px"
                viewBox="24"
              />
            </div>
          </a>

          {/* <a
            href={`/profile?section=lists`}
            className="group overflow-hidden relative border border-opacity-50 border-[5px] border-footerGray
              hover:border-primaryPurple-500  
              rounded p-4 transition-colors duration-300"
          >
            {" "}
            <div className="relative z-20">
              <p className="text-3xl font-semibold text-white group-hover:text-primaryPurple-500 transition-text duration-300">
                N/a
              </p>
              <h2 className="text-xl text-white group-hover:text-primaryPurple-500 transition-text duration-300 group-hover:text-xl group-hover:font-semibold">
                Lists
              </h2>
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
                color="#2C2C2C"
                width="140px"
                height="140px"
                viewBox="24"
              />
            </div>
          </a> */}
        </div>
      </div>
    </div>
  );
};

export default HomePageInfo;
