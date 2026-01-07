//src/components/Footer.tsx
import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";
// import Subscribe from "./Subscribe";
import Subscribe from '@/components/Subscribe';

const FOOTER_SECTIONS = {
  company: {
    title: "Company",
    links: [
      { to: "/about", label: "About Us", title: "Learn about YatraMaker" },
      { to: "/contact", label: "Contact", title: "Get in touch with YatraMaker" },
      { to: "/news", label: "News", title: "YatraMaker company news" },
      { to: "/blog", label: "Blog", title: "YatraMaker travel blog" },
    ],
  },
  support: {
    title: "Support",
    links: [
      { to: "/faq", label: "FAQ", title: "Frequently Asked Questions" },
      { to: "/partner", label: "Partner", title: "Partner with YatraMaker" },
      { to: "/terms", label: "Terms of Service", title: "YatraMaker Terms of Service" },
      { to: "/privacy", label: "Privacy Policy", title: "YatraMaker Privacy Policy" },
    ],
  },
};

const SOCIAL_LINKS = [
  {
    href: "https://www.facebook.com/people/YatraMaker/61563261184870/",
    icon: FaFacebook,
    label: "Facebook",
  },
  {
    href: "https://x.com/YatraMaker",
    icon: FaTwitter,
    label: "Twitter",
  },
  {
    href: "https://www.instagram.com/yatra_maker/",
    icon: FaInstagram,
    label: "Instagram",
  },
  {
    href: "https://www.linkedin.com/company/yatramaker/",
    icon: FaLinkedin,
    label: "LinkedIn",
  },
];

const STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "YatraMaker",
  url: "https://www.yatramaker.com",
  logo: "https://www.yatramaker.com/logo.png",
  sameAs: SOCIAL_LINKS.map((l) => l.href),
  description:
    "YatraMaker offers personalized travel recommendations and comprehensive itineraries based on your total budget.",
  areaServed: "Worldwide",
  slogan: "Your Budget, Your Dream Destination",
};

interface FooterSectionProps {
  title: string;
  links: { to: string; label: string; title: string }[];
}

const FooterSection: React.FC<FooterSectionProps> = ({ title, links }) => (
  <div>
    <h6 className="mb-3 font-semibold text-white text-sm">{title}</h6>
    <ul className="space-y-2">
      {links.map(({ to, label, title }) => (
        <li key={to}>
          <Link
            to={to}
            title={title}
            className="text-gray-300 hover:text-white text-sm"
          >
            {label}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

interface SocialLinksProps {
  links: { href: string; icon: React.ComponentType; label: string }[];
}

const SocialLinks: React.FC<SocialLinksProps> = ({ links }) => (
  <div className="flex space-x-4 mt-3">
    {links.map(({ href, icon: Icon, label }) => (
      <a
        key={label}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        className="text-gray-300 hover:text-white text-lg"
      >
        <Icon />
      </a>
    ))}
  </div>
);

const ProductHuntBadge: React.FC = () => (
  <a
    href="https://www.producthunt.com/posts/yatramaker?embed=true&utm_source=badge-featured&utm_medium=badge"
    target="_blank"
    rel="noopener noreferrer"
  >
    <img
      src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=527712&theme=dark"
      alt="YatraMaker Product Hunt"
      width="250"
      height="54"
      loading="lazy"
      className="mt-4"
    />
  </a>
);

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <>
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(STRUCTURED_DATA)}</script>
      </Helmet>

      <footer className="bg-gray-900 text-gray-300 pt-10 pb-6 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2">
            <h5 className="text-white text-xl font-bold mb-2">
              <Link to="/">YatraMaker</Link>
            </h5>
            <p className="text-sm max-w-sm">
              Your smart travel companion for planning perfect trips based on
              your budget and preferences.
            </p>
            <ProductHuntBadge />
          </div>

          <FooterSection {...FOOTER_SECTIONS.company} />
          <FooterSection {...FOOTER_SECTIONS.support} />

          <div>
            <h6 className="mb-3 font-semibold text-white text-sm">Connect With Us</h6>
            <SocialLinks links={SOCIAL_LINKS} />
            <div className="mt-6">
              <h6 className="mb-2 font-semibold text-white text-sm">Stay Updated</h6>
              <p className="text-sm mb-3">Subscribe for exclusive travel deals and insights.</p>
              <Subscribe />
            </div>
          </div>
        </div>

        <div className="text-center mt-10 text-gray-500 text-sm">
          &copy; {currentYear} YatraMaker | All rights reserved
        </div>
      </footer>
    </>
  );
};

export default Footer;