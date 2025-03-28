import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const scrollableElement = document.querySelector(".your-scrollable-class"); // Replace with the selector for your scrollable container
    if (scrollableElement) {
      scrollableElement.scrollTo(0, 0);
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname]);
  
  return null;
};

export default ScrollToTop;
