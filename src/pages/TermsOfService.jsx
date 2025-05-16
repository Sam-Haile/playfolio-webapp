import Header from "../components/Header";
import Footer from "../components/Footer";

const TermsOfService = () => (
  <div className="relative min-h-screen">
    <Header
      showSearchBar={true}
      showNavButtons={true}
      showLoginButtons={true}
      zIndex={1000}
    />

    <div className="md:mx-[15%] mx-[5%] pt-36 pb-52 max-w-3xl text-white">
      <h1 className="text-2xl font-bold mb-6">Terms of Service</h1>

      <p className="mb-4">
        Welcome to Playfolio. By using our website and services, you agree to the following terms and conditions. Please read them carefully.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">1. Use of the Service</h2>
      <p className="mb-4">
        Playfolio is a platform that allows users to track, rate, and review video games. You agree to use the site only for personal, non-commercial purposes unless explicitly authorized.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">2. Account Responsibility</h2>
      <p className="mb-4">
        You are responsible for maintaining the confidentiality of your account and any activity that occurs under it. Playfolio is not liable for any loss or damage from your failure to safeguard your login credentials.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">3. User Content</h2>
      <p className="mb-4">
        You retain ownership of any content (such as reviews or replies) you post on Playfolio. However, by submitting content, you grant us a worldwide, non-exclusive license to display, modify, and promote it within the platform. You agree not to post anything unlawful, offensive, or harmful.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">4. Intellectual Property</h2>
      <p className="mb-4">
        All trademarks, logos, and branding are property of their respective owners. Playfolio does not claim ownership of external game data. Game metadata and assets are sourced from third-party APIs, including IGDB and SteamGridDB.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">5. Termination</h2>
      <p className="mb-4">
        We reserve the right to suspend or terminate access to the service for violations of these terms or other behavior deemed harmful to the community.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">6. Disclaimer</h2>
      <p className="mb-4">
        Playfolio is provided “as is” without warranties of any kind. We make no guarantees about the accuracy, reliability, or availability of the platform. Use it at your own risk.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">7. Changes to These Terms</h2>
      <p className="mb-4">
        We may update these Terms of Service at any time. Continued use of the platform constitutes your acceptance of any changes. The latest version will always be available on this page.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">8. Contact</h2>
      <p>
        If you have questions about these Terms, please contact us at{" "}
        <a
          href="mailto:playfolio.contact@gmail.com"
          className="text-primaryPurple-500 underline"
        >
          playfolio.contact@gmail.com
        </a>.
      </p>
    </div>

    <div className="absolute bottom-0 w-full">
      <Footer />
    </div>
  </div>
);

export default TermsOfService;
