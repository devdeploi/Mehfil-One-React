import React, { useState, useEffect } from 'react';
import { FiDownload, FiSmartphone, FiTablet, FiMonitor, FiX } from 'react-icons/fi';
import './InstallPrompt.css';

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [deviceType, setDeviceType] = useState('mobile');

  useEffect(() => {
    // Detect device type based on screen width
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setDeviceType('mobile');
      } else if (width < 1024) {
        setDeviceType('tablet');
      } else {
        setDeviceType('PC');
      }
    };
    
    handleResize(); // Check immediately
    window.addEventListener('resize', handleResize);

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        handleDismiss();
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowPrompt(false);
      setIsClosing(false);
    }, 400); // Wait for the fadeOut animation to finish
  };

  if (!showPrompt && !isClosing) return null;

  return (
    <div className={`pwa-modal-overlay ${isClosing ? 'closing' : ''}`}>
      <div className={`pwa-modal-container ${isClosing ? 'closing' : ''}`}>
        <button className="pwa-close-btn" onClick={handleDismiss} aria-label="Close">
          <FiX size={22} />
        </button>

        <div className="pwa-animation-wrapper">
          <div className="pwa-phone-mockup">
            {deviceType === 'mobile' && <FiSmartphone size={48} className="phone-icon" />}
            {deviceType === 'tablet' && <FiTablet size={48} className="phone-icon" />}
            {deviceType === 'PC' && <FiMonitor size={48} className="phone-icon" />}
            <div className="pwa-download-arrow">
              <FiDownload size={20} />
            </div>
            <div className="pwa-pulse-ring"></div>
            <div className="pwa-pulse-ring delay"></div>
          </div>
        </div>

        <div className="pwa-modal-body">
          <h2 className="pwa-modal-title">Get the Full Experience</h2>
          <p className="pwa-modal-subtitle">
            Install <strong>MEHFIL-ONE</strong> on your {deviceType} for lightning-fast access, offline capabilities, and a seamless native feel.
          </p>
        </div>

        <div className="pwa-modal-footer">
          <button className="pwa-btn-primary" onClick={handleInstallClick}>
            <span className="pwa-btn-text">Install App Now</span>
            <div className="pwa-btn-shimmer"></div>
          </button>
          <button className="pwa-btn-secondary" onClick={handleDismiss}>
            Continue in Browser
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;
