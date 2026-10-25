import React from "react";
import { LangProvider } from "./i18n.jsx";

import Navbar from "./components/Navbar.jsx";
import Hero from "./components/Hero.jsx";
import ImpactStats from "./components/ImpactStats.jsx";
import About from "./components/About.jsx";
import Activities from "./components/Activities.jsx";
import GenZNatureExperience from "./components/GenZNatureExperience.jsx";
import ActivityRegistration from "./components/ActivityRegistration.jsx";
import ActivityProof from "./components/ActivityProof.jsx";
import GreenPoints from "./components/GreenPoints.jsx";
import Impact from "./components/Impact.jsx";
import Projects from "./components/Projects.jsx";
import PalmTrees from "./components/PalmTrees.jsx";
import Locations from "./components/Locations.jsx";
import Team from "./components/Team.jsx";
import Awards from "./components/Awards.jsx";
import Gallery from "./components/Gallery.jsx";
import UpcomingProjects from "./components/UpcomingProjects.jsx";
import JoinUs from "./components/JoinUs.jsx";
import Contact from "./components/Contact.jsx";
import Footer from "./components/Footer.jsx";

export default function App() {
  return (
    <LangProvider>
      <Navbar />
      <main>
        <Hero />
        <ImpactStats />
        <About />
        <Activities />
        <GenZNatureExperience />
        <ActivityRegistration />
        <ActivityProof />
        <GreenPoints />
        <Impact />
        <Projects />
        <PalmTrees />
        <Locations />
        <Team />
        <Awards />
        <Gallery />
        <UpcomingProjects />
        <JoinUs />
        <Contact />
      </main>
      <Footer />
    </LangProvider>
  );
}
