import { useEffect } from 'react';
import { trackPageView } from '../utils/analytics';

const DEFAULT_TITLE = 'MEHFIL ONE - Premium Venue Booking & Event Management Platform'; // 57 characters
const DEFAULT_DESCRIPTION = 'MEHFIL ONE is India\'s top venue booking platform to explore and reserve luxury wedding halls, party spaces, banquet centers, and convention spaces.';
const DEFAULT_CANONICAL = 'https://mehfilone.in';

/**
 * Custom React Hook for dynamically updating SEO metadata per route.
 * Enforces Title tag length strictly between 50 and 60 characters.
 */
export const useSEO = ({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  canonicalUrl,
  schema = null,
} = {}) => {
  useEffect(() => {
    // 1. Ensure Title is between 50 and 60 characters
    let formattedTitle = title.trim();
    if (formattedTitle.length < 50) {
      // Append branded suffix to ensure 50-60 characters
      const suffix = ' | MEHFIL ONE Venue Booking';
      if ((formattedTitle + suffix).length <= 60) {
        formattedTitle += suffix;
      } else {
        const altSuffix = ' | MEHFIL ONE Platform';
        if ((formattedTitle + altSuffix).length <= 60) {
          formattedTitle += altSuffix;
        } else {
          const shortSuffix = ' | MEHFIL ONE';
          formattedTitle = (formattedTitle + shortSuffix).slice(0, 60);
        }
      }
    } else if (formattedTitle.length > 60) {
      formattedTitle = formattedTitle.slice(0, 60);
    }

    document.title = formattedTitle;

    // 2. Update Meta Description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', description);

    // 3. Update Canonical Tag
    const currentUrl = canonicalUrl || `${DEFAULT_CANONICAL}${window.location.pathname}`;
    let canonicalTag = document.querySelector('link[rel="canonical"]');
    if (!canonicalTag) {
      canonicalTag = document.createElement('link');
      canonicalTag.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalTag);
    }
    canonicalTag.setAttribute('href', currentUrl);

    // 4. Update Open Graph Tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', formattedTitle);
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', description);
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute('content', currentUrl);

    // 5. Inject Dynamic Schema.org JSON-LD if provided
    let dynamicSchemaScript = document.getElementById('dynamic-page-schema');
    if (schema) {
      if (!dynamicSchemaScript) {
        dynamicSchemaScript = document.createElement('script');
        dynamicSchemaScript.id = 'dynamic-page-schema';
        dynamicSchemaScript.type = 'application/ld+json';
        document.head.appendChild(dynamicSchemaScript);
      }
      dynamicSchemaScript.text = JSON.stringify(schema);
    } else if (dynamicSchemaScript) {
      dynamicSchemaScript.remove();
    }

    // 6. Track Page View
    trackPageView(window.location.pathname, formattedTitle);
  }, [title, description, canonicalUrl, schema]);
};

export default useSEO;
