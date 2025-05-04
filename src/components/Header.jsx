import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import Logo from "../assets/icons/logo.svg";
import LogoIcon from "../assets/icons/logoicon.svg";
import bannerPlaceholder from "../assets/icons/pfp.svg";
import VerticalLine from "../assets/icons/verticalLine.svg";
import SearchBar from "./SearchBar";
import HorizontalLine from "../components/HorizontalLine";
import { useAuth } from "../useAuth";
import DownArrow from "../assets/icons/downArrow.svg";

const Header = ({
  showSearchBar = false,
  showNavButtons = false,
  showLoginButtons = false,
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [src, setSrc] = useState(bannerPlaceholder);

  useEffect(() => {
    if (user?.profileIcon) {
      setSrc(user.profileIcon);
    }
  }, [user?.profileIcon]);

  // State and ref for dropdown delay logic
  const [showDropdown, setShowDropdown] = useState(false);
  const hideDropdownTimer = useRef(null);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error.message);
    }
  };

  // Hover logic for dropdown
  const handleMouseEnter = () => {
    if (hideDropdownTimer.current) {
      clearTimeout(hideDropdownTimer.current);
    }
    setShowDropdown(true);
  };

  const handleMouseLeave = () => {
    hideDropdownTimer.current = setTimeout(() => {
      setShowDropdown(false);
    }, 300);
  };

  const handleLogoClick = () => {
    navigate(user ? '/home' : '/');
  };

  return (
    <header className="mt-4 absolute top-0 left-0 w-full bg-opacity-90 z-[9999] ">
      <div className="mx-[15%] text-white h-auto flex items-center justify-between">
        <div className="flex items-center">
          <button onClick={handleLogoClick}>
            <img src={LogoIcon} alt="Playfolio Logo" className="h-10 mr-4" onContextMenu={(e) => e.preventDefault()}
            />
          </button>
          <button onClick={handleLogoClick}>
            <img src={Logo} alt="Playfolio" className="h-5 mr-4" onContextMenu={(e) => e.preventDefault()}
            />
          </button>
          <img src={VerticalLine} alt="Vertical Line" className="hidden lg:block md:block sm:hidden mr-4" />
          {showNavButtons && (
            <nav className="hidden md:flex space-x-10">
              <a href="/home" className="hover:text-primaryPurple-500">
                Home
              </a>
              {/* <a href="/explore" className="hover:text-primaryPurple-500">
                Explore
              </a> */}
            </nav>
          )}
        </div>

        {/* Right side: Search bar, Login buttons, or Profile */}
        <div className="flex items-center ml-auto">
          {/* Search bar */}
          {showSearchBar && location.pathname !== "/" && (
            <div className="flex w-auto justify-end">
              <SearchBar width="20vw" />
            </div>
          )}

          {/* placeholder keeps this entire box the same width during load */}
          {loading && (
            <div className="w-40 h-8" aria-hidden="true" />
          )}

           {/* Login/Sign Up */}
            {!loading && !user && showLoginButtons && (
            <div className="relative pl-4 w-[100%] h-[auto] flex space-x-4">
              <button
                className="text-primaryPurple-500 hover:text-primaryPurple-700"
                onClick={() =>
                  navigate("/signup", { state: { showLogin: true } })
                }
              >
                Log In
              </button>
              <button
                className="bg-primaryPurple-500 hover:bg-primaryPurple-700 text-white font-bold px-4 py-2 rounded-lg"
                onClick={() => navigate("/signup")}
              >
                Sign Up
              </button>
            </div>
          )}

          {/* Profile dropdown (if user is logged in) */}
          {user && (
            <div
              className="relative pl-4 w-40 z-50 "
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <button className="flex items-center px-2 py-1 focus:outline-none">

                  <img
                    src={src}
                    alt="Default Profile"
                    className="w-8 h-8 rounded-full object-cover shadow-lg flex-shrink-0"
                    onError={(e) => {
                      // only run once
                      e.currentTarget.onerror = null;
                      setSrc(bannerPlaceholder);
                    }}
                  />
                <p className="ml-2 flex-grow text-right">{user.username}</p>
                <img
                  src={DownArrow}
                  alt="Down arrow"
                  className="w-[20px] ml-1 flex-shrink-0"
                />
              </button>

              <div
                className={`absolute mt-2 w-32 bg-customGray-500 text-sm text-black rounded shadow-lg z-[1000] ${showDropdown ? "block" : "hidden"
                  }`}
              >
                <a
                  href="/profile"
                  className="block w-full text-left px-2 py-1 hover:bg-customGray-600 hover:rounded-t"
                >
                  Profile
                </a>

                <a
                  href={`/profile?section=games&type=played`}
                  className="block w-full text-left px-2 py-1 hover:bg-customGray-600 hover:rounded-t"
                >
                  Played
                </a>

                <a
                  href={`/profile?section=games&type=wishlist`}
                  className="block w-full text-left px-2 py-1 hover:bg-customGray-600 hover:rounded-t"
                >
                  Wishlist
                </a>

                <a
                  href={`/profile?section=games&type=backlog`}
                  className="block w-full text-left px-2 py-1 hover:bg-customGray-600 hover:rounded-t"
                >
                  Backlog
                </a>

                <a
                  href={`/profile?section=games&type=dropped`}          
                  className="block w-full text-left px-2 py-1 hover:bg-customGray-600 hover:rounded-t"
                >
                  Dropped
                </a>

                <a
                  href={`/profile?section=reviews`}
                  className="block w-full text-left px-2 py-1 hover:bg-customGray-600 hover:rounded-t"
                >
                  Reviews
                </a>

                <a
                  href={`/profile?section=lists`}
                  className="block w-full text-left px-2 py-1 hover:bg-customGray-600 hover:rounded-t"
                >
                  Lists
                </a>

                <HorizontalLine
                  marginTop="mt-0"
                  marginBottom="mb-0"
                  className="!z-0"
                  width="100%"
                  border="border-customGray-700"
                  borderThickness="border-t"
                />

                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-2 py-1 text-red-700 hover:bg-customGray-600 hover:rounded-b"
                >
                  Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
