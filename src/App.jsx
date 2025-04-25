import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Onboarding from "./pages/Onboarding";
import Explore from "./pages/Explore";
import Results from "./pages/Results";
import GamePage from "./pages/GamePage";
import SignIn from "./pages/SignIn";
import CompanyPage from "./pages/CompanyPage";
import ScrollToTop from "./services/ScrollToTop";
import Profile from "./pages/Profile";
import ProtectedRoute from "./pages/ProtectedRoute";
import { AuthProvider } from "./useAuth";
import './styles/global.css';

const App = () => {
  return (

    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Onboarding />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/results" element={<Results />} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/game/:id/:slug?" element={<GamePage />} />
          <Route path="/company/:id/:slug?" element={<CompanyPage />} />
          <Route path="signup" element={<SignIn />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
