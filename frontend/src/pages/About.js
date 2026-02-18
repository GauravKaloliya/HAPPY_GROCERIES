import React from 'react';

const About = () => {
  return (
    <div className="container">
      <div className="about-section">
        <h2>About Happy Groceries 🛒</h2>
        
        <p>
          Welcome to Happy Groceries, your one-stop destination for fresh and quality groceries 
          delivered right to your doorstep. We believe that grocery shopping should be a delightful 
          experience, not a chore!
        </p>

        <p>
          Founded with the vision of making healthy eating accessible to everyone, Happy Groceries 
          brings you a wide selection of fresh fruits, vegetables, dairy products, snacks, and 
          beverages - all at competitive prices.
        </p>

        <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Our Mission</h3>
        <p>
          To provide the freshest products with the happiest service, making every meal a celebration 
          of good food and great moments.
        </p>

        <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Why Choose Us?</h3>
        <ul style={{ paddingLeft: '1.5rem', lineHeight: 2 }}>
          <li>🥗 Fresh products sourced daily from trusted suppliers</li>
          <li>🚚 Fast and reliable delivery to your doorstep</li>
          <li>💰 Competitive prices and exciting offers</li>
          <li>⭐ Quality guaranteed with easy returns</li>
          <li>🌟 Friendly customer service ready to help</li>
        </ul>

        <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Our Team</h3>
        <div className="team-grid">
          <div className="team-member">
            <div className="team-avatar">👨‍💼</div>
            <h4>Founder</h4>
            <p>Vision & Strategy</p>
          </div>
          <div className="team-member">
            <div className="team-avatar">👩‍🍳</div>
            <h4>Quality</h4>
            <p>Freshness Expert</p>
          </div>
          <div className="team-member">
            <div className="team-avatar">👨‍💻</div>
            <h4>Technology</h4>
            <p>Digital Innovation</p>
          </div>
          <div className="team-member">
            <div className="team-avatar">👩‍💼</div>
            <h4>Support</h4>
            <p>Customer Happiness</p>
          </div>
        </div>

        <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Connect With Us</h3>
        <div className="social-icons">
          <button className="social-icon" style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.5rem' }}>📧</button>
          <button className="social-icon" style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.5rem' }}>📱</button>
          <button className="social-icon" style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.5rem' }}>🐦</button>
          <button className="social-icon" style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.5rem' }}>📘</button>
          <button className="social-icon" style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.5rem' }}>📸</button>
        </div>

        <div className="contact-info">
          <h3 style={{ marginBottom: '1rem' }}>Contact Information</h3>
          <p>📍 123 Happy Street, Fresh City, FC 12345</p>
          <p>📞 +91 98765 43210</p>
          <p>✉️ hello@happygroceries.com</p>
        </div>
      </div>
    </div>
  );
};

export default About;
