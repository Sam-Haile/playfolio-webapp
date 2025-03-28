import React, { useState, useEffect } from "react";
import SearchIcon from "../assets/icons/search.svg";
import axios from "axios";

const HeroSearchBar = ({ width = "100%", margin = "0", padding = "0", className = "", onSelectHero, onResults }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [heroes, setHeroes] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);
    const [placeholderText, setPlaceholderText] = useState("Search for a game banner");

    useEffect(() => {
        const updatePlaceholder = () => {
            setPlaceholderText(window.innerWidth < 1150 ? "Search Banner" : "Search for a game banner");
        };
        updatePlaceholder();
        window.addEventListener("resize", updatePlaceholder);
        return () => window.removeEventListener("resize", updatePlaceholder);
    }, []);

    const fetchHeroes = async (query) => {
        if (!query.trim()) {
            setHeroes([]); 
            onResults([]); // Ensure results are cleared when search is empty
            return;
        }
    
        setLoading(true);
    
        try {
            //HOW TO STOP THE ERROR HERE WHEN IM STARTING TO TYPE A SEARCH
            const response = await axios.post("http://localhost:5000/api/steamgriddb/heroes", { gameName: query });
    
            // ✅ Ensure response structure is valid before using it
            if (response?.data?.success && Array.isArray(response.data.heroes)) {
                setHeroes(response.data.heroes);
                onResults(response.data.heroes); 
            } else {
                throw new Error("Invalid API response structure"); // Trigger error handling
            }
        } catch (error) {
            console.error("Error fetching heroes:", error);
            
            // ✅ Handle errors gracefully
            setHeroes([]); // Clear results on error
            onResults([]); // Notify parent component of empty results
        }
    
        setLoading(false);
    };
    

    useEffect(() => {
        const debounceTimeout = setTimeout(() => {
            fetchHeroes(searchTerm);
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
                <button type="button" className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <img src={SearchIcon} alt="Search Icon" className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
};

export default HeroSearchBar;
