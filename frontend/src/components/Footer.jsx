import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <p>
        © {currentYear} Happy Groceries 🛒 | Created by Gaurav Kaloliya
      </p>
    </footer>
  );
};

export default Footer;
