import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import SearchBar from "../components/SearchBar";
import Button from "../components/Button";
import { Link } from "react-router-dom";
import GameCard from "../components/GameCard";
import HorizontalLine from "../components/HorizontalLine";
import { fetchTrendingGames } from "../services/helperFunctions";

const ExplorePage = () => {
  const [popularGames, setPopularGames] = useState([]);

  useEffect(() => {
    const fetchGames = async () => {
      const data = await fetchTrendingGames(10);
      setPopularGames(data);
    };

    fetchGames();
  }, []);

  return (
    <div className="relative max-w-screen">
    </div>
  );
};

export default ExplorePage;
