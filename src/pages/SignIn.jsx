import React, { useState, useEffect } from "react";
import { signUpUser, loginUser } from "../authService";
import { useNavigate, useLocation } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import {
  getAuth,
  onAuthStateChanged,
  sendEmailVerification,
} from "firebase/auth";
import { db } from "../firebaseConfig";
import Logo from "../assets/icons/logo.svg";
import LogoIcon from "../assets/icons/logoicon.svg";
import VerticalLine from "../assets/icons/verticalLine.svg";
import Header from "../components/Header";
const SignIn = () => {
  const auth = getAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSignUp, setIsSignUp] = useState(
    location.state?.showLogin ? false : true
  );
  const [formData, setFormData] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    privacyPolicy: false,
    rememberMe: false,
  });

  // CAN DELETE
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("✅ User is authenticated:", user);
        console.log("User UID:", user.uid);
        console.log("User Email:", user.email);
        console.log("User Display Name:", user.username);
      } else {
        console.log("❌ No authenticated user.");
      }
    });

    return () => unsubscribe(); // Cleanup subscription when component unmounts
  }, []);

  const [error, setError] = useState("");
  const [unverifiedUser, setUnverifiedUser] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    const {
      username,
      email,
      password,
      firstName,
      lastName,
      confirmPassword,
      privacyPolicy,
    } = formData;

    if (isSignUp) {
      if (!firstName || !lastName || !email || !password || !confirmPassword) {
        setError("⚠️ All fields are required.");
        return;
      }
      if (password !== confirmPassword) {
        setError("⚠️ Passwords do not match.");
        return;
      }
      if (!privacyPolicy) {
        setError("⚠️ You must agree to the privacy policy.");
        return;
      }

      try {
        await signUpUser(email, password, username, firstName, lastName);
        navigate("/"); // Redirect to homepage after sign-up
      } catch (error) {
        handleAuthError(error);
      }
    } else {
      if (!(email || username) || !password) {
        setError("⚠️ Email or Username and password are required.");
        return;
      }

      try {
        const result = await loginUser(email || username, password);

        if (result.error === "unverified") {
          setUnverifiedUser(result.user); // ✅ Store user to resend verification email
          setError("⚠️ Please verify your email before logging in.");
          return;
        }

        navigate("/"); // ✅ Redirect to homepage if successful
      } catch (error) {
        handleAuthError(error);
      }
    }
  };

  // ✅ Function to Resend Email Verification
  const handleResendEmail = async () => {
    if (unverifiedUser) {
      try {
        await sendEmailVerification(unverifiedUser);
        setError("✅ Verification email sent! Please check your inbox.");
      } catch (err) {
        console.error("Error resending email:", err);
        setError("❌ Failed to send verification email. Try again later.");
      }
    }
  };

  /**
   * Convert Firebase Auth Errors into User-Friendly Messages
   */
  const handleAuthError = (error) => {
    let errorMessage = "❌ Something went wrong. Please try again.";

    switch (error.code) {
      case "auth/email-already-in-use":
        errorMessage = "⚠️ This email is already in use. Try logging in.";
        break;
      case "auth/invalid-email":
        errorMessage = "⚠️ Invalid email format. Please enter a valid email.";
        break;
      case "auth/weak-password":
        errorMessage = "⚠️ Password must be at least 6 characters long.";
        break;
      case "auth/wrong-password":
      case "auth/invalid-credential":
        errorMessage = "⚠️ Incorrect email or password. Please try again.";
        break;
      case "auth/user-not-found":
        errorMessage = "⚠️ No account found with this email. Sign up instead.";
        break;
      case "auth/network-request-failed":
        errorMessage = "⚠️ Network error. Check your internet connection.";
        break;
      default:
        console.error("Firebase Error:", error);
        errorMessage = "❌ " + error.message; // Show full message for debugging
    }

    setError(errorMessage);
  };

  return (
    <div className="max-w-screen h-screen grid grid-cols-2 overflow-hidden">
      {/* Left Side */}
      <div className="flex flex-col h-full">
        {/* Header Section */}
        <div className="mx-[20%] h-[00px]">
          <div className="bg-customBlack text-white relative h-[75px] flex w-full">
            <div className="flex items-center">
              <a href="/">
                <img src={LogoIcon} alt="Playfolio Logo" className="h-8 mr-2" />
              </a>
              <a href="/">
                <img src={Logo} alt="Playfolio" className="h-4 mr-10" />
              </a>
              <img src={VerticalLine} alt="Vertical Line" className="mr-10" />
              <nav className="hidden md:flex space-x-10">
                <a href="/home" className="hover:primaryPurple-500">
                  Home
                </a>
                <a href="/explore" className="hover:text-primaryPurple-500">
                  Explore
                </a>
              </nav>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="flex-1 flex items-center justify-center overflow-hidden">
          <div className="w-full max-w-lg mx-[20%]">
            <form
              onSubmit={handleSubmit}
              className="sign-up-form flex flex-col justify-center"
            >
              <h1 className="text-5xl font-bold text-left w-full">
                {isSignUp ? "Sign Up" : "Log In"}
              </h1>

              {error && (
                <div className="text-left w-full gap-x-2 mb-2">
                  <p className="error-message">{error}</p>
                  {unverifiedUser && (
                    <p
                      className="text-white font-bold hover:text-primaryPurple-500 cursor-pointer hover:underline"
                      onClick={handleResendEmail}
                    >
                      Send Verification Email
                    </p>
                  )}
                </div>
              )}

              <div className="w-full">
                {isSignUp && (
                  <div className="w-full form-group">
                    <div className="grid grid-cols-2 gap-3 w-full">
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="First Name"
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Last Name"
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div className="w-full form-group">
                      <input
                        type="text"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Email"
                        className="w-full p-2 border border-gray-300 rounded-md "
                      />
                    </div>
                  </div>
                )}
              </div>
              {!isSignUp && (

                <div className="w-full form-group">
                  <input
                    type="text"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email / Username"
                    className="w-full p-2 border border-gray-300 rounded-md "
                  />
                </div>
              )}

              {isSignUp && (
                <div className="w-full form-group">
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Username"
                    className="w-full p-2 border border-gray-300 rounded-md "
                  />
                </div>
              )}

              <div className="w-full form-group">
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  className="w-full p-2 border border-gray-300 rounded-md "
                />
              </div>

              {isSignUp && (
                <div className="w-full form-group">
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter Password"
                    className="w-full border border-gray-300 rounded-md"
                  />
                </div>
              )}

              {isSignUp && (
                <div className="w-full h-full flex justify-start my-2 ">
                  <input
                    id="privacyPolicy"
                    type="checkbox"
                    name="privacyPolicy"
                    checked={formData.privacyPolicy}
                    onChange={handleChange}
                    className="mr-2 h-5 w-5  "
                    />
                  <label htmlFor="privacyPolicy" className="text-sm">
                    I agree to the{" "}
                    <a
                      href="/privacy-policy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primaryPurple-500 hover:underline"
                    >
                      Privacy Policy
                    </a>
                  </label>
                </div>
              )}

              <button type="submit" className="sign-up-button w-full my-2">
                {isSignUp ? "Sign Up" : "Log In"}
              </button>

              <p className="pt-6">
                {isSignUp ? "Already a member? " : "Don't have an account? "}
                <span
                  className="text-primaryPurple-500 hover:underline cursor-pointer"
                  onClick={() => setIsSignUp(!isSignUp)}
                >
                  {isSignUp ? "Log In" : "Sign Up"}
                </span>
              </p>
            </form>
          </div>
        </div>
      </div>
      {/* Right Side */}
      <div className="hidden md:block z-50 relative h-screen overflow-hidden">
        {/* Gradient overlay to prevent overflow */}
        <div
          className="absolute top-0 left-0 h-full w-[40%] pointer-events-none z-10"
          style={{
            background:
              "linear-gradient(to right, #121212 0%, transparent 90%)",
          }}
        ></div>

        {/* Image with controlled height */}
        <img
          src="./../images/signUpSplash.jpeg"
          alt="Splash Art"
          className="h-full w-full object-cover object-[60%]"
        />
      </div>{" "}
    </div>
  );
};

export default SignIn;
