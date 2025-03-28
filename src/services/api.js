import axios from "axios";

const API_KEY = "your_api_key_here"; // Replace with actual API key
const BASE_URL = "https://api.rawg.io/api";

export const fetchGameDetails = async (id) => {
  const response = await axios.get(`${BASE_URL}/games/${id}?key=${API_KEY}`);
  return response.data;
};
