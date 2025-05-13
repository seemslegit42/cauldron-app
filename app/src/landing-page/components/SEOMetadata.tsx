import React from 'react';
import { Helmet } from 'react-helmet';

export default function SEOMetadata() {
  return (
    <Helmet>
      <title>CauldronOS | AI-Native Command Center for Enterprise Operations</title>
      <meta name="description" content="CauldronOS combines cybersecurity, business intelligence, and workflow automation in a unified platform with human-supervised AI at its core." />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://cauldronos.ai/" />
      <meta property="og:title" content="CauldronOS | AI-Native Command Center for Enterprise Operations" />
      <meta property="og:description" content="Where Digital Alchemy Meets Enterprise Intelligence. Brew potent concoctions of cybersecurity, business intelligence, and workflow automation." />
      <meta property="og:image" content="https://cauldronos.ai/og-image.jpg" />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content="https://cauldronos.ai/" />
      <meta property="twitter:title" content="CauldronOS | AI-Native Command Center for Enterprise Operations" />
      <meta property="twitter:description" content="Where Digital Alchemy Meets Enterprise Intelligence. Brew potent concoctions of cybersecurity, business intelligence, and workflow automation." />
      <meta property="twitter:image" content="https://cauldronos.ai/twitter-image.jpg" />
      
      {/* Keywords */}
      <meta name="keywords" content="AI, cybersecurity, business intelligence, workflow automation, enterprise operations, Sentient Loop, digital alchemy" />
      
      {/* Canonical URL */}
      <meta name="canonical" content="https://cauldronos.ai/" />
      
      {/* Favicon */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      
      {/* Additional Meta Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="author" content="CauldronOS" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    </Helmet>
  );
}
