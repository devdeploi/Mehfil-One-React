import React, { useRef, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './LandingPage.css';
import Navbar from '../../components/Navbar';

// Extracted Components
import Hero from './components/Hero';
import Features from './components/Features';
import Venues from './components/Venues';
import HowItWorks from './components/HowItWorks';
import Pricing from './components/Pricing';
import Footer from './components/Footer';
import SEO from '../../components/SEO';

const LandingPage = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const location = useLocation();

    // Section Refs for Scrolling
    const homeRef = useRef(null);
    const aboutRef = useRef(null);
    const venuesRef = useRef(null);
    const flowRef = useRef(null);
    const plansRef = useRef(null);

    const scrollToSection = (ref) => {
        ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    useEffect(() => {
        if (location.state?.scrollTo === 'venues') {
            setTimeout(() => {
                scrollToSection(venuesRef);
            }, 100);
        }
    }, [location]);

    const refs = { home: homeRef, about: aboutRef, venues: venuesRef, flow: flowRef, plans: plansRef };

    return (
        <div className="landing-container">
            <SEO 
                title="MEHFIL ONE - Premium Venue Booking & Event Management Platform"
                description="MEHFIL ONE is India's top venue booking platform to explore and reserve luxury wedding halls, party spaces, banquet centers, and convention spaces."
                canonicalUrl="https://mehfilone.in/"
            />
            <Navbar 
                scrollToSection={scrollToSection} 
                refs={refs} 
            />

            <Hero 
                homeRef={homeRef} 
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
                venuesRef={venuesRef}
            />

            <Venues venuesRef={venuesRef} />

            <Features aboutRef={aboutRef} />

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
