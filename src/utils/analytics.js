// Google Analytics 4 tracking utility for MEHFIL ONE

export const GA_TRACKING_ID = import.meta.env.VITE_GA_TRACKING_ID || 'G-MEHFILONE01';

/**
 * Track pageview in GA4
 * @param {string} path 
 * @param {string} title 
 */
export const trackPageView = (path, title) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_TRACKING_ID, {
      page_path: path,
      page_title: title,
    });
  }
};

/**
 * Track custom event in GA4
 * @param {string} action 
 * @param {object} params 
 */
export const trackEvent = (action, params = {}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, params);
  }
};
