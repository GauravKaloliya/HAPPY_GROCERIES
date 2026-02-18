import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, Star, Heart, Truck, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

const About = () => {
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('Message sent! We\'ll get back to you soon 💌');
    setContactForm({ name: '', email: '', subject: '', message: '' });
  };

  const team = [
    { name: 'Alice Johnson', role: 'Founder & CEO', emoji: '👩‍💼' },
    { name: 'Bob Smith', role: 'Head of Operations', emoji: '👨‍🌾' },
    { name: 'Carol White', role: 'Customer Success', emoji: '👩‍💻' },
    { name: 'David Brown', role: 'Delivery Manager', emoji: '👨‍🚚' },
  ];

  const values = [
    { icon: Heart, title: 'Passion for Fresh', desc: 'We believe everyone deserves access to fresh, quality food', color: 'bg-pink-100 text-pink-600' },
    { icon: Shield, title: 'Quality First', desc: 'Rigorous quality checks on every product we deliver', color: 'bg-green-100 text-green-600' },
    { icon: Truck, title: 'Fast Delivery', desc: 'From farm to your doorstep in record time', color: 'bg-blue-100 text-blue-600' },
    { icon: Star, title: 'Customer Love', desc: 'Your satisfaction is our top priority', color: 'bg-yellow-100 text-yellow-600' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-20 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-100 via-green-50 to-blue-100 dark:from-pink-900/20 dark:via-green-900/10 dark:to-blue-900/20" />
        
        {/* Floating Emojis */}
        <div className="absolute top-10 left-10 text-6xl opacity-20 animate-float">🥕</div>
        <div className="absolute top-20 right-20 text-5xl opacity-20 animate-float" style={{ animationDelay: '0.5s' }}>🍎</div>
        <div className="absolute bottom-20 left-1/4 text-5xl opacity-20 animate-float" style={{ animationDelay: '1s' }}>🥛</div>
        
        <div className="relative max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="gradient-text">Our Story</span> 📖
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
            Happy Groceries started with a simple mission: to make grocery shopping 
            a delightful experience. We believe that fresh, quality food should be 
            accessible to everyone, delivered with a smile! 🌟
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '10K+', label: 'Happy Customers', emoji: '😊' },
              { value: '74+', label: 'Products', emoji: '🛍️' },
              { value: '5', label: 'Categories', emoji: '📂' },
              { value: '2hr', label: 'Avg Delivery', emoji: '⚡' },
            ].map((stat, index) => (
              <div key={index} className="text-center glass rounded-2xl p-6">
                <div className="text-4xl mb-2">{stat.emoji}</div>
                <div className="text-3xl font-bold gradient-text">{stat.value}</div>
                <div className="text-gray-600 dark:text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 px-4 bg-white/50 dark:bg-gray-900/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            <span className="gradient-text">Our Values</span> 💎
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div key={index} className="glass rounded-2xl p-6 text-center card-hover">
                <div className={`w-16 h-16 rounded-2xl ${value.color} flex items-center justify-center mx-auto mb-4`}>
                  <value.icon className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{value.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            <span className="gradient-text">Meet the Team</span> 👥
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {team.map((member, index) => (
              <div key={index} className="glass rounded-2xl p-6 text-center card-hover">
                <div className="text-6xl mb-4">{member.emoji}</div>
                <h3 className="font-bold text-gray-900 dark:text-white">{member.name}</h3>
                <p className="text-pink-500 text-sm">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-4 bg-white/50 dark:bg-gray-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div>
              <h2 className="text-3xl font-bold mb-6">
                <span className="gradient-text">Get in Touch</span> 📞
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                Have questions or feedback? We'd love to hear from you! 
                Reach out to us through any of the channels below.
              </p>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">Visit Us</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      123 Fresh Street<br />
                      Green City, GC 12345
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">Call Us</h3>
                    <p className="text-gray-600 dark:text-gray-400">+1 (555) 123-4567</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">Email Us</h3>
                    <p className="text-gray-600 dark:text-gray-400">hello@happygroceries.com</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-yellow-100 text-yellow-600 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">Working Hours</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Mon - Sat: 8AM - 10PM<br />
                      Sunday: 9AM - 8PM
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="glass rounded-2xl p-8">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Send us a Message 💌
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-pink-400"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-pink-400"
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-pink-400"
                    placeholder="How can we help?"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Message
                  </label>
                  <textarea
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    rows="4"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-pink-400"
                    placeholder="Tell us more..."
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-pink-400 to-pink-500 text-white font-bold hover:shadow-xl transition-all flex items-center justify-center space-x-2"
                >
                  <Send className="w-5 h-5" />
                  <span>Send Message</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Preview */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">
            <span className="gradient-text">Frequently Asked Questions</span> ❓
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            {[
              { q: 'How fast is delivery?', a: 'We deliver within 2 hours for most locations!' },
              { q: 'What payment methods?', a: 'We accept cards, COD, and digital wallets.' },
              { q: 'Can I track my order?', a: 'Yes! Track in real-time on the orders page.' },
              { q: 'Freshness guarantee?', a: '100% fresh or your money back!' },
            ].map((faq, index) => (
              <div key={index} className="glass rounded-xl p-6">
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{faq.q}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
