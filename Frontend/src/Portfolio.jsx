import React, { useContext } from "react";
import { AuthContext } from "./Context/AuthProvider";
import Navbar from "./Components/Navbar";
import Hero from "./Section/Hero";
import About from "./Section/About";
import Contact from "./Section/Contact";
import Project from "./Section/Porject";
import Resume from "./Section/Resume";
import Skills from "./Section/Skills";
import Footer from "./Components/Footer";



export default function Portfolio() {
  const { toastVisible, toastMsg } = useContext(AuthContext);

  return (
    <>
      {/* background blobs */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -right-[140px] -top-[180px] h-[520px] w-[520px] rounded-full bg-gradient-to-br from-accent-light to-accent2-light opacity-[0.18] blur-[90px] dark:from-accent-dark dark:to-accent2-dark dark:opacity-[0.26]" />
        <div className="absolute -left-[180px] top-[620px] h-[420px] w-[420px] rounded-full bg-gradient-to-br from-accent-light to-accent2-light opacity-[0.18] blur-[90px] dark:from-accent-dark dark:to-accent2-dark dark:opacity-[0.26]" />
        <div className="absolute -right-[220px] top-[1500px] h-[480px] w-[480px] rounded-full bg-gradient-to-br from-accent-light to-accent2-light opacity-[0.18] blur-[90px] dark:from-accent-dark dark:to-accent2-dark dark:opacity-[0.26]" />
      </div>

      <Navbar />

      <main>
        {/* HERO */}
        <Hero />

        {/* ABOUT */}
        <About />

        {/* SKILLS */}
        <Skills />

        {/* PROJECTS */}
        <Project />

        {/* RESUME */}
        <Resume />

        {/* CONTACT */}
        <Contact />
      </main>

      <Footer />

      <div className={`toast ${toastVisible ? "toast-show" : ""}`}>
        {toastMsg}
      </div>
    </>
  );
}
