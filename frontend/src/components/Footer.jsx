import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const parseXML = (xmlText) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, 'application/xml');

  const getTextContent = (parent, tag) => parent.querySelector(tag)?.textContent || '';

  const links = Array.from(doc.querySelectorAll('links link')).map((item) => ({
    label: getTextContent(item, 'label'),
    href: getTextContent(item, 'href'),
  }));

  return {
    brand: {
      logo: getTextContent(doc, 'brand logo'),
      name: getTextContent(doc, 'brand name'),
    },
    author: getTextContent(doc, 'copyright author'),
    links,
  };
};

const Footer = () => {
  const [config, setConfig] = useState(null);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    fetch('/footer-config.xml')
      .then((res) => res.text())
      .then((text) => setConfig(parseXML(text)))
      .catch(() => {});
  }, []);

  const brandName = config?.brand?.name || 'Happy Groceries';
  const brandLogo = config?.brand?.logo || '🛒';
  const author = config?.author || 'Gaurav Kaloliya';
  const links = config?.links || [];

  return (
    <footer className="footer">
      <p>
        © {currentYear} {brandLogo} {brandName} | Created by {author}
      </p>
      <div className="footer-links">
        {links.map((link) => (
          <Link key={link.href} to={link.href} className="footer-link">
            {link.label}
          </Link>
        ))}
      </div>
    </footer>
  );
};

export default Footer;
