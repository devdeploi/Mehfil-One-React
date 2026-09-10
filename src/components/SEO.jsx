import React from 'react';
import useSEO from '../hooks/useSEO';

const SEO = ({ title, description, canonicalUrl, schema }) => {
  useSEO({ title, description, canonicalUrl, schema });
  return null;
};

export default SEO;
