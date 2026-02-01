// src/components/BaseSEO.tsx
import React from 'react';
import { Helmet } from 'react-helmet-async';

interface BaseSEOProps {
  title?: string;
  description?: string;
  ogImage?: string;
  canonicalUrl?: string;
  ogType?: 'website' | 'article' | 'blog' | 'product' | 'profile';
  schemaType?: string;
  keywords?: string;
  noindex?: boolean;
  breadcrumbSchema?: Record<string, unknown> | null;
  additionalSchema?: Record<string, unknown> | null;
  children?: React.ReactNode;
}

const BaseSEO: React.FC<BaseSEOProps> = ({
  title = "YatraMaker: Budget-Based Travel Planning - Find Destinations Within Your Budget",
  description = "India's first budget-first travel planner. Enter your budget ₹ and discover destinations you can actually afford. Complete cost breakdowns - flights, hotels, activities. Start with your budget, not your destination.",
  ogImage = "https://yatramaker.com/assets/yatramaker-og-image.jpg",
  canonicalUrl = "https://yatramaker.com",
  ogType = 'website',
  schemaType = 'Organization',
  keywords = "budget travel India, travel within budget, affordable trips India, budget travel planner, YatraMaker, trip cost calculator, India travel packages",
  noindex = false,
  breadcrumbSchema = null,
  additionalSchema = null,
  children
}) => {

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://yatramaker.com/#organization",
    "name": "YatraMaker",
    "url": "https://yatramaker.com",
    "logo": "https://yatramaker.com/assets/logos/Yatra_Maker_Logo.png",
    "description": "Budget-first travel planning platform for Indian travelers",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Dhanbad",
      "addressRegion": "Jharkhand",
      "addressCountry": "IN",
      "postalCode": "828130"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "email": "support@yatramaker.com",
      "url": "https://yatramaker.com/contact",
      "availableLanguage": ["English", "Hindi"]
    },
    "sameAs": [
      "https://www.facebook.com/people/YatraMaker/61563261184870/",
      "https://www.instagram.com/yatra_maker/",
      "https://x.com/YatraMaker",
      "https://www.linkedin.com/company/yatramaker/",
      "https://www.youtube.com/channel/UCRrdz0oPnpJNUxOb5TgPeSQ/"
    ],
    "founder": {
      "@type": "Person",
      "name": "Anand N"
    },
    "foundingDate": "2024-09-01"
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://yatramaker.com/#website",
    "url": "https://yatramaker.com",
    "name": "YatraMaker",
    "description": description,
    "publisher": {
      "@id": "https://yatramaker.com/#organization"
    },
    "potentialAction": [{
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://yatramaker.com/search?budget={budget}&location={location}"
      },
      "query-input": {
        "@type": "PropertyValueSpecification",
        "valueRequired": true,
        "valueName": "budget",
        "valuePattern": "[0-9]+"
      }
    }],
    "inLanguage": "en-IN"
  };

  const mainEntitySchema = schemaType !== 'Organization' ? {
    "@context": "https://schema.org",
    "@type": schemaType,
    "@id": canonicalUrl,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": canonicalUrl
    },
    "headline": title,
    "description": description,
    "image": ogImage,
    "publisher": {
      "@id": "https://yatramaker.com/#organization"
    },
    "datePublished": "2024-09-01T00:00:00+05:30",
    "dateModified": new Date().toISOString(),
    "author": {
      "@id": "https://yatramaker.com/#organization"
    }
  } : null;

  return (
    <Helmet>
      <html lang="en" />

      {/* Core Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      {/* Robots */}
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <>
          <meta name="robots" content="index, follow" />
          <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
          <meta name="bingbot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        </>
      )}

      {/* Canonical */}
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title} />
      <meta property="og:site_name" content="YatraMaker" />
      <meta property="og:locale" content="en_IN" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@YatraMaker" />
      <meta name="twitter:creator" content="@YatraMaker" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content={title} />

      {/* Geo & Language */}
      <meta name="language" content="English" />
      <meta name="geo.region" content="IN-JH" />
      <meta name="geo.placename" content="Dhanbad" />
      <meta name="geo.position" content="23.7954;86.4270" />
      <meta name="ICBM" content="23.7954, 86.4270" />

      {/* Mobile / App */}
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      <meta name="theme-color" content="#4f46e5" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="YatraMaker" />
      <link rel="apple-touch-icon" href="https://yatramaker.com/assets/logos/Yatra_Maker_Logo.png" />

      {/* Microsoft */}
      <meta name="application-name" content="YatraMaker" />
      <meta name="msapplication-TileColor" content="#4f46e5" />
      <meta name="msapplication-TileImage" content="https://yatramaker.com/assets/logos/Yatra_Maker_Logo.png" />
      <meta name="msapplication-config" content="https://yatramaker.com/browserconfig.xml" />

      {/* Favicon */}
      <link rel="icon" href="https://yatramaker.com/favicon.ico" />
      <link rel="icon" type="image/png" sizes="32x32" href="https://yatramaker.com/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="https://yatramaker.com/favicon-16x16.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="https://yatramaker.com/apple-touch-icon.png" />

      {/* Manifest */}
      <link rel="manifest" href="https://yatramaker.com/site.webmanifest" />

      {/* Structured Data — Organization */}
      <script type="application/ld+json">
        {JSON.stringify(organizationSchema)}
      </script>

      {/* Structured Data — WebSite */}
      <script type="application/ld+json">
        {JSON.stringify(websiteSchema)}
      </script>

      {/* Structured Data — Main Entity (page-specific, only when schemaType !== Organization) */}
      {mainEntitySchema && (
        <script type="application/ld+json">
          {JSON.stringify(mainEntitySchema)}
        </script>
      )}

      {/* Structured Data — Breadcrumb (optional, passed per-page) */}
      {breadcrumbSchema && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      )}

      {/* Structured Data — Additional (optional, passed per-page) */}
      {additionalSchema && (
        <script type="application/ld+json">
          {JSON.stringify(additionalSchema)}
        </script>
      )}

      {children}
    </Helmet>
  );
};

export default BaseSEO;