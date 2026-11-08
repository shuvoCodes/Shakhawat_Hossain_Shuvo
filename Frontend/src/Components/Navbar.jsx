import React, { useContext, useEffect, useState } from "react";
import { TiThMenuOutline } from "react-icons/ti";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../Context/AuthProvider";
import { BrandMark, BrandText } from "./BrandIdentity";

const navLinks = ["Home", "About", "Skills", "Projects", "Resume", "Contact"];

const Navbar = () => {
  const { theme, SUN_PATH, MOON_PATH, toggleTheme } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) return undefined;

    const firstFrame = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth" });
      });
    });
    return () => window.cancelAnimationFrame(firstFrame);
  }, [hash, pathname]);

  const renderLinks = (mobile = false) =>
    navLinks.map((label) => {
      const destination = pathname === "/"
        ? `#${label.toLowerCase()}`
        : `/#${label.toLowerCase()}`;
      const handleClick = () => {
        if (mobile) setMenuOpen(false);
        if (destination === `${pathname}${hash}` || (pathname === "/" && destination === hash)) {
          window.requestAnimationFrame(() => {
            document.getElementById(label.toLowerCase())?.scrollIntoView({ behavior: "smooth" });
          });
        }
      };
      return (
        <Link
          key={label}
          to={destination}
          onClick={handleClick}
          className={
            mobile
              ? "block rounded-xl px-4 py-3 text-sm font-medium text-secondary-light transition-colors hover:bg-accent-light/10 hover:text-primary-light dark:text-secondary-dark dark:hover:bg-accent-dark/10 dark:hover:text-primary-dark"
              : "rounded-full px-[15px] py-2.5 text-sm font-medium text-secondary-light transition-colors hover:bg-accent-light/10 hover:text-primary-light dark:text-secondary-dark dark:hover:bg-accent-dark/10 dark:hover:text-primary-dark"
          }
        >
          {label}
        </Link>
      );
    });

  return (
    <div className="sticky top-2 z-50 pt-[env(safe-area-inset-top,0px)] md:top-4">
      <nav className="glass-panel relative mx-auto mt-3.5 flex max-w-[1180px] flex-wrap items-center justify-between rounded-[24px] p-2.5 md:rounded-full">
        <Link to={pathname === "/" ? "#home" : "/#home"} className="brand-shell flex items-center gap-3 pl-1" aria-label="Shuvo home">
          <BrandMark className="brand-mark" />
          <BrandText />
        </Link>

        <div className="hidden gap-1 md:flex">{renderLinks()}</div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-[18px] w-[18px]"
            >
              {theme === "dark" ? SUN_PATH : MOON_PATH}
            </svg>
          </button>

          <Link to={pathname === "/" ? "#contact" : "/#contact"} className="btn-primary btn-sm hidden md:inline-flex">
            Let's Talk
          </Link>

          <button
            type="button"
            className="theme-toggle md:hidden"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
          >
            <TiThMenuOutline className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {menuOpen && (
          <div
            id="mobile-navigation"
            className="glass-panel absolute left-0 right-0 top-full z-50 mt-2 rounded-2xl bg-white/80 p-2 shadow-glass backdrop-blur-[50px] dark:bg-[#1E1B2D]/90 md:hidden"
          >
            <div className="flex flex-col">{renderLinks(true)}</div>
          </div>
        )}
      </nav>
    </div>
  );
};

export default Navbar;
