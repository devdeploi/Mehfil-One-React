import React, { useRef, useState } from 'react';
import './LandingPage.css';
import Navbar from '../../components/Navbar';

// Extracted Components
import Hero from './components/Hero';
import Features from './components/Features';
import Venues from './components/Venues';
import HowItWorks from './components/HowItWorks';
import Pricing from './components/Pricing';
import Footer from './components/Footer';
const LandingPage = () => {
    const [activeTab, setActiveTab] = useState('dashboard');

    // Section Refs for Scrolling
    const homeRef = useRef(null);
    const aboutRef = useRef(null);
    const venuesRef = useRef(null);
    const flowRef = useRef(null);
    const plansRef = useRef(null);

    const scrollToSection = (ref) => {
        ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const refs = { home: homeRef, about: aboutRef, venues: venuesRef, flow: flowRef, plans: plansRef };

    return (
        <div className="landing-container">
            <Navbar 
                scrollToSection={scrollToSection} 
                refs={refs} 
            />

            <Hero 
                homeRef={homeRef} 
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
            />

            <Features aboutRef={aboutRef} />

            <Venues venuesRef={venuesRef} />

            <HowItWorks flowRef={flowRef} />

            <Pricing plansRef={plansRef} />

            <Footer 
                scrollToSection={scrollToSection} 
                refs={refs} 
            />
        </div>
    );
};

export default LandingPage;
