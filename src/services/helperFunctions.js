export const fetchTrendingGames = async (limit) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/trending-games?limit=${limit}`
    );
    const data = await response.json();

    if (Array.isArray(data)) {
      //Filter to remove games without a cover image
      const filteredGames = data.filter((game) => game.cover !== undefined);
      return filteredGames.slice(0, limit);
    } else {
      console.error("Expected an array but got:", data);
      return [];
    }
  } catch (error) {
    console.error("Error fetching trending games:", error);
    return [];
  }
};

export const fetchEvents = async (limit) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/events?limit=${limit}`
    );
    const data = await response.json();
    if (Array.isArray(data)) {
      return data;
    } else {
      console.error("Expected an array but got:", data);
      return [];
    }
  } catch (error) {
    console.error("Error fetching trending games:", error);
    return [];
  }
};

import axios from 'axios';

// Cache stored outside the component, persists across renders
const screenshotCache = {};

export async function fetchScreenshotsCached(gameId) {
  if (screenshotCache[gameId]) {
    console.log(`Using cached screenshots for game ID: ${gameId}`);
    return screenshotCache[gameId];
  }

  try {
    const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/screenshots`, { gameId });

    const sortedScreenshots = response.data.sort((a, b) => a.id - b.id);

    screenshotCache[gameId] = sortedScreenshots;
    return sortedScreenshots;
  } catch (err) {
    if (err.response?.status === 429) {
      console.error("Rate limited. Please wait before retrying.");
    } else {
      console.error("Error fetching screenshots:", err.message);
    }
    return [];
  }
}
