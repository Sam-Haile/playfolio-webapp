import React from "react";
import Logo from "../assets/icons/logo.svg";
import LogoIcon from "../assets/icons/logoicon.svg";
import GooglePlay from "../assets/icons/googleplay.png";
import AppStore from "../assets/icons/appstore.png";
import HorizontalLine from "../components/HorizontalLine";
const Footer = () => {
  return (
    <footer className="bg-footerGray text-white py-6">
      <div className="flex mx-[10%] py-2 justify-between">
        <div className="flex items-center ">
            <img src={LogoIcon} alt="Playfolio Logo" className="h-10 mr-4 " />
            <img src={Logo} alt="Playfolio" className="h-5 mr-10 " />
        </div>

        <div className="flex w-full justify-end items-center ">
        <a href="/" className="pr-6 text-sm hover:text-primaryPurple-500"> About </a>
        <a href="/" className="pr-6 text-sm hover:text-primaryPurple-500"> Contact </a>
        <a href="/" className="pr-6 text-sm hover:text-primaryPurple-500"> Terms of Service </a>
        <a href="/" className="text-sm hover:text-primaryPurple-500"> Privacy Policy </a>
        </div>
      </div>

      <HorizontalLine marginTop="mt-0" className="!z-0" marginBottom="mb-0" />

      <div className="flex mx-[10%] py-2 justify-between">
        <div className="flex items-center">
          <a href="/"> <img src={GooglePlay} alt="Playfolio Logo" className="h-8 mr-2" /></a>
          <a href="/"> <img src={AppStore} alt="Playfolio" className="h-8 mr-10" /></a>{" "}
        </div>

        <div>
          <p className="text-xs pt-1 ">© 2025 Playfolio. All rights reserved</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
