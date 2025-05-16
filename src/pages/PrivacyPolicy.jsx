import Header from "../components/Header";
import Footer from "../components/Footer";

const PrivacyPolicy = () => (
  <div className="relative min-h-screen">
    <Header
      showSearchBar={true}
      showNavButtons={true}
      showLoginButtons={true}
      zIndex={1000}
    />

    <div className="md:mx-[15%] mx-[5%] pt-36 pb-52 max-w-3xl text-white">
      <h1 className="text-2xl font-bold mb-6">Privacy Policy</h1>

      <p className="mb-4">
        Your privacy matters to us. This Privacy Policy outlines how Playfolio collects, uses, and protects your information.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">1. Information We Collect</h2>
      <p className="mb-4">
        When you create an account on Playfolio, we may collect your display name, email address, profile icon, reviews, ratings, and saved game collections. We do not request or store any sensitive personal information.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">2. How We Use Your Information</h2>
      <p className="mb-4">
        We use your information to personalize your experience, display your reviews and ratings, and help you manage your gaming library. We do not sell your data to third parties.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">3. Third-Party Services</h2>
      <p className="mb-4">
        Playfolio uses third-party services to operate:
        <ul className="list-disc list-inside mt-2 ml-4">
          <li><strong>Firebase</strong> – for authentication and data storage</li>
          <li><strong>IGDB API</strong> – for retrieving game metadata</li>
          <li><strong>SteamGridDB</strong> – for displaying game cover art and visual assets</li>
        </ul>
        These services may collect limited data (such as device type or IP address) as part of their normal operation. Their privacy policies apply independently.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">4. Data Storage and Security</h2>
      <p className="mb-4">
        All user data is stored securely using Firebase’s cloud infrastructure. We take reasonable precautions to protect your information, but no method of transmission over the internet is 100% secure.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">5. Your Rights</h2>
      <p className="mb-4">
        You may request to access, update, or delete your data at any time. Just contact us at{" "}
        <a
          href="mailto:playfolio.contact@gmail.com"
          className="text-primaryPurple-500 underline"
        >
          playfolio.contact@gmail.com
        </a>
        .
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">6. Cookies</h2>
      <p className="mb-4">
        Playfolio may use cookies or local storage to improve your experience — for example, to remember your last-used filter or save daily discovery queue results. These are never used for tracking across other sites.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">7. Changes to This Policy</h2>
      <p className="mb-4">
        We may update this Privacy Policy from time to time. If changes are made, the updated policy will always be available here.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">8. Contact</h2>
      <p>
        If you have any questions about this Privacy Policy, please email us at{" "}
        <a
          href="mailto:playfolio.contact@gmail.com"
          className="text-primaryPurple-500 underline"
        >
          playfolio.contact@gmail.com
        </a>.
      </p>

      <p className="mt-6 text-sm text-gray-400">Last updated: May 16, 2025</p>
    </div>

    <div className="absolute bottom-0 w-full">
      <Footer />
    </div>
  </div>
);

export default PrivacyPolicy;
