import React, { useState, useEffect } from "react";
import SearchIcon from "../assets/icons/search.svg";
import axios from "axios";

const IconSearchBar = ({
  width = "100%",
  margin = "0",
  padding = "0",
  className = "",
  onSelectIcon,       // callback if you want to handle icon selection
  onResults           // callback to return the array of icons fetched
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [icons, setIcons] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [placeholderText, setPlaceholderText] = useState("Search for an icon");

  // Update placeholder text on window resize
  useEffect(() => {
    const updatePlaceholder = () => {
      setPlaceholderText(
        window.innerWidth < 1150 ? "Search Icon" : "Search for an icon"
      );
    };
    updatePlaceholder();
    window.addEventListener("resize", updatePlaceholder);
    return () => window.removeEventListener("resize", updatePlaceholder);
  }, []);

  // Fetch icons from the server
  const fetchIcons = async (query) => {
    if (!query.trim()) {
      setIcons([]);
      onResults && onResults([]); // Clear parent results if search is empty
      return;
    }

    setLoading(true);

    try {
      // POST request to your local API endpoint for icons
      const response = await axios.post(
        "http://localhost:5000/api/steamgriddb/icons",
        { gameName: query }
      );

      // Ensure response structure is valid before using it
      if (response?.data?.success && Array.isArray(response.data.icons)) {
        setIcons(response.data.icons);
        onResults && onResults(response.data.icons); 
      } else {
        throw new Error("Invalid API response structure");
      }
    } catch (error) {
      console.error("Error fetching icons:", error);
      // Clear on error
      setIcons([]);
      onResults && onResults([]);
    }

    setLoading(false);
  };

  // Debounce the fetch to avoid hammering the API on every keystroke
  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      fetchIcons(searchTerm);
    }, 300);
    return () => clearTimeout(debounceTimeout);
  }, [searchTerm]);

  return (
    <div style={{ width, margin, padding }} className={`relative ${className}`}>
      
      
      <div className="relative">
        <input
          type="text"
          placeholder={placeholderText}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowSuggestions(true);
          }}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          onFocus={() => searchTerm.trim() !== "" && setShowSuggestions(true)}
          className="w-full px-4 py-2 pr-10 rounded-lg bg-[#515151] text-white placeholder-[#DCDCDC] focus:outline-none"
        />
        <button
          type="button"
          className="absolute right-3 top-1/2 transform -translate-y-1/2"
        >
          <img src={SearchIcon} alt="Search Icon" className="h-5 w-5" />
        </button>
      </div>

      {/* 
        If you want to show a suggestion dropdown (similar to a typeahead),
        you can add it here. For example:
      
        {showSuggestions && icons.length > 0 && (
          <ul className="absolute w-full bg-gray-800 mt-1 rounded-md">
            {icons.map((icon, index) => (
              <li
                key={index}
                onClick={() => {
                  onSelectIcon && onSelectIcon(icon);
                  setSearchTerm(""); // Reset the search or do as needed
                  setShowSuggestions(false);
                }}
                className="p-2 cursor-pointer hover:bg-gray-700"
              >
                <img src={icon.url} alt="icon" className="inline-block w-6 h-6 mr-2" />
                {icon.name || "Unnamed"}
              </li>
            ))}
          </ul>
        )}
      */}
    </div>
  );
};

export default IconSearchBar;
