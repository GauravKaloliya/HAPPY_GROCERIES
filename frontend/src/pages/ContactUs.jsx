import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from '../api/axios';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    category: 'general',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (formData.phone.length !== 10) {
      newErrors.phone = 'Phone number must be 10 digits';
    }
    
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    
    try {
      await axios.post('/contact/submit/', {
        ...formData,
        ip_address: null, // Will be set by backend
        user_agent: navigator.userAgent,
      });
      
      toast.success('Message sent successfully! We\'ll get back to you soon.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        category: 'general',
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1 className="section-title">📞 Contact Us</h1>
      
      <div className="contact-layout">
        <div className="contact-info">
          <div className="contact-card">
            <div className="contact-icon">📍</div>
            <h3>Our Address</h3>
            <p>Happy Groceries Store<br />123 Main Street<br />Mumbai, Maharashtra<br />India - 400001</p>
          </div>
          
          <div className="contact-card">
            <div className="contact-icon">📞</div>
            <h3>Phone Numbers</h3>
            <p>Customer Care: +91 98765 43210<br />Support: +91 98765 43211<br />Business: +91 98765 43212</p>
          </div>
          
          <div className="contact-card">
            <div className="contact-icon">📧</div>
            <h3>Email Us</h3>
            <p>General: info@happygroceries.com<br />Support: support@happygroceries.com<br />Business: business@happygroceries.com</p>
          </div>
          
          <div className="contact-card">
            <div className="contact-icon">⏰</div>
            <h3>Business Hours</h3>
            <p>Monday - Friday: 9:00 AM - 9:00 PM<br />Saturday: 9:00 AM - 8:00 PM<br />Sunday: 10:00 AM - 6:00 PM</p>
          </div>
          
          <div className="contact-card">
            <div className="contact-icon">💬</div>
            <h3>Live Support</h3>
            <p>Available 24/7 on our website<br />Average response time: < 5 minutes</p>
            <button className="btn-live-chat">💬 Start Live Chat</button>
          </div>
        </div>
        
        <div className="contact-form-container">
          <h2>Send us a Message</h2>
          <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={errors.name ? 'error' : ''}
                />
                {errors.name && <div className="error-message">{errors.name}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="phone">Phone Number *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91"
                  className={errors.phone ? 'error' : ''}
                  maxLength="10"
                />
                {errors.phone && <div className="error-message">{errors.phone}</div>}
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'error' : ''}
              />
              {errors.email && <div className="error-message">{errors.email}</div>}
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="general">General Inquiry</option>
                  <option value="order">Order Support</option>
                  <option value="delivery">Delivery Issues</option>
                  <option value="payment">Payment Problems</option>
                  <option value="product">Product Questions</option>
                  <option value="account">Account Issues</option>
                  <option value="business">Business Partnership</option>
                  <option value="feedback">Feedback</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="subject">Subject *</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className={errors.subject ? 'error' : ''}
                />
                {errors.subject && <div className="error-message">{errors.subject}</div>}
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="message">Message *</label>
              <textarea
                id="message"
                name="message"
                rows="6"
                value={formData.message}
                onChange={handleChange}
                className={errors.message ? 'error' : ''}
                placeholder="Please describe your inquiry in detail..."
              />
              {errors.message && <div className="error-message">{errors.message}</div>}
            </div>
            
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Sending...' : '📤 Send Message'}
            </button>
          </form>
        </div>
      </div>
      
      <div className="contact-faq">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-grid">
          <div className="faq-item">
            <h4>How can I track my order?</h4>
            <p>You can track your order in the Orders section of your account or by clicking the tracking link in your order confirmation email.</p>
          </div>
          <div className="faq-item">
            <h4>What are your delivery hours?</h4>
            <p>We deliver from 9:00 AM to 9:00 PM, 7 days a week. Delivery slots can be selected during checkout.</p>
          </div>
          <div className="faq-item">
            <h4>How do I return a product?</h4>
            <p>Contact our customer support within 24 hours of delivery for returns. We offer free returns for damaged or incorrect items.</p>
          </div>
          <div className="faq-item">
            <h4>Do you offer same-day delivery?</h4>
            <p>Yes! We offer same-day delivery for orders placed before 2:00 PM in eligible areas.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;