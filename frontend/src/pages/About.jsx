import { useState } from 'react';
import toast from 'react-hot-toast';
import { contactAPI } from '../api/contact';
import useActivityLog from '../hooks/useActivityLog';

const About = () => {
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useActivityLog('page_view', { section: 'about' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await contactAPI.submitMessage(contactForm);
      toast.success('Message sent! We\'ll get back to you soon 💌');
      setContactForm({ name: '', email: '', message: '' });
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
      console.error('Error submitting contact form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container">
      <section className="about-section">
        <h2>Our Story 📖</h2>
        <p>
          Happy Groceries started with a simple mission: to make grocery shopping 
          a delightful experience. We believe that fresh, quality food should be 
          accessible to everyone, delivered with a smile! 🌟
        </p>

        <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Contact Us 📞</h3>
        <div className="contact-info">
          <p>📍 Porbandar, Gujarat 360575</p>
          <p>📞 +91 9875124142</p>
          <p>✉️ support@happygroceries.shop</p>
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
          <button type="submit" className="btn-submit" disabled={isSubmitting}>
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </section>
    </div>
  );
};

export default About;
