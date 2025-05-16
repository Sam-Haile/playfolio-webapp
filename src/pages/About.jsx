import Header from "../components/Header";
import Footer from "../components/Footer";

const About = () => (
  <div className="relative min-h-screen">
    <Header
      showSearchBar={true}
      showNavButtons={true}
      showLoginButtons={true}
      zIndex={1000}
    />

    <div className="md:mx-[15%] mx-[5%] pt-36 pb-24 max-w-3xl text-white">
      <h1 className="text-2xl font-bold mb-4">About Playfolio</h1>
      <p className="mb-4">
        Playfolio is a personal and social platform where gamers can track, rate, and reflect on the games they’ve played — and discover new ones through community reviews and shared experiences. Whether you’ve finished hundreds of titles or are just starting your collection, Playfolio gives you a space to document your journey and connect with others who love games as much as you do.
      </p>

      <p className="mb-4">
        As a solo-developed project, Playfolio was created out of a passion for gaming and the desire to give players a better way to organize their libraries, share thoughtful reviews, and engage in meaningful discussion around the games that define us.
      </p>

      <p className="mb-4">
        With Playfolio, you can:
        <ul className="list-disc list-inside mt-2 ml-4">
          <li>Track and rate games you've played</li>
          <li>Build and manage personal collections like backlog, wishlist, or dropped</li>
          <li>Write reviews and reply to others to share your thoughts</li>
          <li>Discover trending, top-rated, and similar titles</li>
          <li>Browse by developer, genre, or platform</li>
        </ul>
      </p>

      <p className="mb-4">
        Playfolio is platform-agnostic — whether you play on PC, console, handheld, or mobile, you're welcome here. A mobile version of the app is currently in development to make it even easier to track and engage with your games on the go.
      </p>

      <p className="mb-4">
        Special thanks to the <a href="https://api-docs.igdb.com/" className="text-primaryPurple-500 underline" target="_blank" rel="noopener noreferrer">IGDB API</a> for powering game metadata, and the <a href="https://www.steamgriddb.com/" className="text-primaryPurple-500 underline" target="_blank" rel="noopener noreferrer">SteamGridDB</a> for providing beautiful box art and assets.
      </p>

      <p>
        Playfolio is built by a gamer, for gamers — and it’s just getting started.
      </p>
    </div>

    <div className="absolute bottom-0 w-full">
      <Footer />
    </div>
  </div>
);

export default About;
