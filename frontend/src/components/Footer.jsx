import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <p>
        © {currentYear} Happy Groceries 🛒 | Made with 💖 for fresh food lovers! | 
        <Link to="/about" style={{ color: 'var(--primary-pink)', textDecoration: 'none', marginLeft: '0.5rem' }}>
          Contact Us
        </Link>
      </p>
    </footer>
  );
};

export default Footer;
