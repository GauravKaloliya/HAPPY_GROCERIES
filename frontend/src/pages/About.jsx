import { useState } from 'react';
import toast from 'react-hot-toast';

const About = () => {
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('Message sent! We\'ll get back to you soon 💌');
    setContactForm({ name: '', email: '', message: '' });
  };

  const team = [
    { name: 'Gaurav Kaloliya', role: 'Founder & CEO', emoji: '👩‍💼' },
    { name: 'Bob Smith', role: 'Head of Operations', emoji: '👨‍🌾' },
    { name: 'Carol White', role: 'Customer Success', emoji: '👩‍💻' },
    { name: 'David Brown', role: 'Delivery Manager', emoji: '👨‍🚚' },
  ];

  return (
    <div className="container">
      <section className="about-section">
        <h2>Our Story 📖</h2>
        <p>
          Happy Groceries started with a simple mission: to make grocery shopping 
          a delightful experience. We believe that fresh, quality food should be 
          accessible to everyone, delivered with a smile! 🌟
        </p>

        <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Meet the Team 👥</h3>
        <div className="team-grid">
          {team.map((member, index) => (
            <div key={index} className="team-member">
              <div className="team-avatar">{member.emoji}</div>
              <h4>{member.name}</h4>
              <p>{member.role}</p>
            </div>
          ))}
        </div>

        <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Contact Us 📞</h3>
        <div className="contact-info">
          <p>📍 123 Fresh Street, Green City, GC 12345</p>
          <p>📞 +1 (555) 123-4567</p>
          <p>✉️ hello@happygroceries.com</p>
          <p>🕒 Mon - Sat: 8AM - 10PM | Sunday: 9AM - 8PM</p>
        </div>

        <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Send us a Message 💌</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={contactForm.name}
              onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
              placeholder="Your name"
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={contactForm.email}
              onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
              placeholder="Your email"
              required
            />
          </div>
          <div className="form-group">
            <label>Message</label>
            <textarea
              value={contactForm.message}
              onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
              placeholder="How can we help?"
              rows="4"
              required
            />
          </div>
          <button type="submit" className="btn-submit">
            Send Message
          </button>
        </form>
      </section>
    </div>
  );
};

export default About;
