import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Onboarding from "./pages/Onboarding";
import Explore from "./pages/Explore";
import Results from "./pages/Results";
import GamePage from "./pages/GamePage";
import SignIn from "./pages/SignIn";
import Company from "./pages/Company";
import Event from "./pages/Event";
import Genre from "./pages/Genre";
import Platform from "./pages/Platform";
import About from "./pages/About";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
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
          <Route path="/company/:id/:slug?" element={<Company />} />
          <Route path="/event/:id/:slug?" element={<Event />} />
          <Route path="/genre/:id/:slug?" element={<Genre />} />
          <Route path="/platform/:id/:slug?" element={<Platform />} />
          <Route path="signup" element={<SignIn />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
