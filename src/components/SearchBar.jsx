import React, { useState, useEffect, useRef } from "react";
import SearchIcon from "../assets/icons/search.svg";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const SearchBar = ({ width = "100%", margin = "0", padding = "0", className = "" }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [placeholderText, setPlaceholderText] = useState("Search for a game");
  const navigate = useNavigate();

  const searchBarRef = useRef(null);

  useEffect(() => {
    const updatePlaceholder = () => {
      if (window.innerWidth < 1150) {
        setPlaceholderText("Search");
      } else {
        setPlaceholderText("Search for a game");
      }
    };
  
    // Set placeholder text on component mount
    updatePlaceholder();
  
    // Listen for resize
    window.addEventListener("resize", updatePlaceholder);
  
    return () => {
      window.removeEventListener("resize", updatePlaceholder);
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {

      // If click is outside the search bar container, hide suggestions
      if (
        searchBarRef.current &&
        !searchBarRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    }

    // Listen for all clicks
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchBarRef]);

  // Fetch Suggestions Function
  const fetchSuggestions = async (query) => {
    if (query.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/suggest?q=${encodeURIComponent(query)}`
      );
      setSuggestions(response.data.slice(0, 5));
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  };

  // Debounce Fetch
  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      fetchSuggestions(searchTerm);
    }, 0); 

    return () => clearTimeout(debounceTimeout);
  }, [searchTerm]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim() !== "") {
      setShowSuggestions(false); // Hide suggestions box
      navigate(`/results?query=${encodeURIComponent(searchTerm)}`);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setShowSuggestions(false); // Hide suggestions box
    navigate(`/game/${suggestion.id}`); // Navigate to the specific game page
  };

  return (
    <div style={{ width, margin, padding }} className={`relative ${className}`} ref={searchBarRef}>
      {/* Search Input */}
      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          placeholder={placeholderText}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowSuggestions(true);
          }}
          onBlur={() => setShowSuggestions(false)} // Hide on blur
          onFocus={() => {
            if (searchTerm.trim() !== "") setShowSuggestions(true); // Show on focus if searchTerm exists
          }}
          className={`w-full px-4 py-2 pr-10 bg-[#515151] text-white text-base placeholder-[#DCDCDC] focus:outline-none ${
            showSuggestions && suggestions.length > 0 ? "rounded-t-lg" : "rounded-lg"
          }`}
                />

        {/* Search Icon */}
        <button
          type="submit"
          className="absolute right-3 top-1/2 transform -translate-y-1/2"
        >
          <img src={SearchIcon} alt="Search Icon" className="h-5 w-5" />
        </button>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute w-full bg-[#515151] rounded-b-lg max-h-64 overflow-y-auto shadow-lg suggestions-dropdown">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              onMouseDown={() => handleSuggestionClick(suggestion)}
              className="px-4 py-2 text-base cursor-pointer hover:bg-[#404040] text-white "
            >
              {suggestion.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;