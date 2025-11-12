import { useState, useEffect } from 'react'
import './App.css'
import { trackInitiateCheckout, trackSchedule, trackPurchase } from './utils/tracking'
import portraitImg from './assets/portrait.jpg'
import clientPhoto1 from './assets/1-compressed.jpg'
import clientPhoto2 from './assets/2-compressed.jpg'
import clientPhoto3 from './assets/3-compressed.jpg'
import clientPhoto4 from './assets/4-compressed.jpg'

function App() {
  const [showEmailPopup, setShowEmailPopup] = useState(false)
  const [emailSubmitted, setEmailSubmitted] = useState(false)
  const [faqOpen, setFaqOpen] = useState({})
  const [currentTestimonial, setCurrentTestimonial] = useState(0)

  // Exit-intent popup
  useEffect(() => {
    const handleMouseLeave = (e) => {
      if (e.clientY <= 0 && !emailSubmitted && !localStorage.getItem('emailCaptured')) {
        setShowEmailPopup(true)
      }
    }

    // Show popup after 30 seconds if not already shown
    const timer = setTimeout(() => {
      if (!emailSubmitted && !localStorage.getItem('emailCaptured')) {
        setShowEmailPopup(true)
      }
    }, 30000)

    document.addEventListener('mouseout', handleMouseLeave)
    return () => {
      document.removeEventListener('mouseout', handleMouseLeave)
      clearTimeout(timer)
    }
  }, [emailSubmitted])

  // Setup Acuity Scheduling tracking
  useEffect(() => {
    // Listen for Acuity scheduling events
    window.addEventListener('message', function(event) {
      // Make sure message is from Acuity Scheduling
      if (event.origin !== 'https://app.acuityscheduling.com') return;

      try {
        const data = JSON.parse(event.data);

        // Track when user successfully schedules an appointment
        if (data.type === 'appointment.scheduled') {
          console.log('Appointment scheduled:', data);

          // Track Schedule event
          trackSchedule({
            contentName: data.appointmentType || 'Astrology Reading',
            contentCategory: 'Booking'
          });

          // If payment was made, track Purchase event
          if (data.payment && data.payment.amount) {
            trackPurchase(
              data.payment.amount,
              data.payment.currency || 'EUR',
              {
                contentName: data.appointmentType || 'Astrology Reading',
                appointmentId: data.id
              }
            );
          }
        }
      } catch (e) {
        // Ignore messages that aren't JSON
      }
    });
  }, [])

  const handleBookingClick = () => {
    // Track conversion event with both client and server-side tracking
    trackInitiateCheckout()
  }

  const toggleFAQ = (index) => {
    setFaqOpen(prev => ({ ...prev, [index]: !prev[index] }))
  }

  // Testimonial carousel navigation
  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(nextTestimonial, 6000)
    return () => clearInterval(interval)
  }, [])

  const services = [
    {
      id: 1,
      title: 'Natal Chart Reading',
      duration: '75 minutes',
      price: '€99',
      description: 'Deep dive into your birth chart using whole sign houses and sect. We\'ll explore your personality, life themes, and what the planets reveal about your path.',
      popular: true
    },
    {
      id: 2,
      title: 'Timing (Electional) Consultation',
      duration: '60 minutes',
      price: '€75',
      description: 'Using electional astrology to find the best timing for important events—launches, moves, decisions. We will find the best timing for your launch',
      popular: false
    },
    {
      id: 3,
      title: 'Astrocartography',
      duration: '60 minutes',
      price: '€75',
      description: 'Explore how different places around the world light up different parts of your chart. Great for anyone considering a move or curious about where they might thrive.',
      popular: false
    }
  ]

  const testimonials = [
    {
      name: 'J.L.',
      role: 'Designer',
      text: 'The natal chart reading was incredibly accurate and insightful. Jurgis helped me understand patterns in my life that I\'d been struggling with for years.',
      rating: 5
    },
    {
      name: 'Noe C.',
      role: 'Artist',
      text: 'I was skeptical at first, but the transit reading gave me much clarity to understand what and why is happening in my life.',
      rating: 5
    },
    {
      name: 'W. S.',
      role: 'Graphic Designer',
      text: 'It was very accurate what I have been through with my childhood and family, and my weak points to take care of.',
      rating: 5
    },
    {
      name: 'H. S.',
      role: 'UX Designer',
      text: 'I had been struggling alone every day, feeling trapped in my own patterns. But through your reading, I was able to see those problems from a new perspective and found what feels like a breakthrough. Thank you so much.',
      rating: 5
    }
  ]

  const faqs = [
    {
      question: 'What do I need for a reading?',
      answer: 'You\'ll need your exact birth date, time, and location.'
    },
    {
      question: 'How long does a reading take?',
      answer: 'Sessions range from 45-75 minutes depending on the service.'
    },
    {
      question: 'Are readings conducted in person or online?',
      answer: 'Readings can be conducted either in person (Bali - Canggu/Ubud) or via video call (Zoom), making them accessible from anywhere in the world.'
    },
    {
      question: 'What if I need to reschedule?',
      answer: 'You can reschedule up to 24 hours before your appointment with no penalty. Cancellations within less than 24 hours receive a partial 50% refund.'
    },
    {
      question: 'Do you offer refunds?',
      answer: 'If you\'re not completely satisfied with your reading, I offer a 100% money-back guarantee within a day of your session.'
    },
    {
      question: 'Can astrology predict the future?',
      answer: 'Astrology reveals timing and potential outcomes, but you always have free will. I focus on empowering you to make informed decisions rather than making absolute predictions.'
    }
  ]

  return (
    <div className="astrology-page">


      {/* Header */}
      <header className="header">
        <nav className="header-nav">
          <a href="#about">About</a>
          <a href="#services">Services</a>
          <a href="#testimonials">Reviews</a>
          <a href="#faq">FAQ</a>
          <a href="#booking">Book</a>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">Ancient astrology for the modern world</h1>
          <a href="#booking" className="cta-button" onClick={handleBookingClick}>book a reading</a>
          <p className="guarantee-text">sessions from €75 • if it doesn't resonate, I'll refund you</p>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="trust-bar">
        <div className="trust-item">
          <div className="trust-number">50+</div>
          <div className="trust-label">paid readings given</div>
        </div>
        <div className="trust-item">
          <div className="trust-number">4</div>
          <div className="trust-label">years practicing</div>
        </div>
        <div className="trust-item">
          <div className="trust-number">☾</div>
          <div className="trust-label">trusted 2000+ year old techniques</div>
        </div>
      </section>

      {/* Services Section - Moved up for conversion optimization */}
      <section id="services" className="section services-section">
        <div className="container">
          <h2 className="section-title">Consultation types</h2>
          <div className="services-grid">
            {services.map((service) => (
              <div key={service.id} className={`service-card ${service.popular ? 'popular' : ''}`}>
                {service.popular && <div className="popular-badge">most requested</div>}
                <h3 className="service-title">{service.title}</h3>
                <div className="service-meta">
                  <span className="service-duration">{service.duration}</span>
                  <span className="service-price">{service.price}</span>
                </div>
                <p className="service-description">{service.description}</p>
                <a href="#booking" className="service-cta" onClick={handleBookingClick}>BOOK A READING</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section - Concise one-liner version */}
      <section id="about" className="section about-section-brief">
        <div className="container">
          <div className="about-brief">
            <div className="about-brief-image">
              <img src={portraitImg} alt="Jurgis Lietunovas - Hellenistic Astrologer" loading="lazy" />
            </div>
            <div className="about-brief-text">
              <h2>Hi, I'm Jurgis</h2>
              <p>
                Former luxury brand art director turned Hellenistic astrologer. I use 2000-year-old techniques to help you understand the mechanics of your life patterns. Based in Bali, reading charts worldwide.
              </p>
              <a href="#booking" className="cta-button-secondary" onClick={handleBookingClick}>book a reading</a>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="section testimonials-section">
        <div className="container">
          <h2 className="section-title">Kind words from past clients</h2>
          <div className="testimonials-carousel">
            <button className="carousel-button prev" onClick={prevTestimonial} aria-label="Previous testimonial">
              ←
            </button>

            <div className="testimonial-card-carousel">
              <div className="stars">{'★'.repeat(testimonials[currentTestimonial].rating)}</div>
              <p className="testimonial-text">"{testimonials[currentTestimonial].text}"</p>
              <div className="testimonial-author">
                <div className="author-name">{testimonials[currentTestimonial].name}</div>
                <div className="author-role">{testimonials[currentTestimonial].role}</div>
              </div>
            </div>

            <button className="carousel-button next" onClick={nextTestimonial} aria-label="Next testimonial">
              →
            </button>
          </div>

          <div className="carousel-dots">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={`dot ${index === currentTestimonial ? 'active' : ''}`}
                onClick={() => setCurrentTestimonial(index)}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Why This Works Section */}
      <section className="section why-section">
        <div className="container">
          <h2 className="section-title">Not your Instagram horoscope</h2>
          <div className="why-content">
            <p className="why-main">Real techniques. Real patterns. Real clarity.</p>
            <p className="why-description">
              No manifestation speak. No cosmic bypassing. Just ancient methods that actually map what you're experiencing.
            </p>
          </div>
        </div>
      </section>

      {/* Client Moments Section */}
      <section className="section client-moments-section">
        <div className="container">
          <h2 className="section-title">Real feedback from real clients</h2>
          <p className="section-subtitle">Moments from previous readings</p>
        </div>
        <div className="client-photos-carousel">
          <div className="client-photos-track">
            <div className="client-photo">
              <img src={clientPhoto1} alt="Happy client during natal chart reading session" loading="lazy" />
            </div>
            <div className="client-photo">
              <img src={clientPhoto2} alt="Client giving thumbs up during astrology consultation" loading="lazy" />
            </div>
            <div className="client-photo">
              <img src={clientPhoto3} alt="Satisfied client during chart reading" loading="lazy" />
            </div>
            <div className="client-photo">
              <img src={clientPhoto4} alt="Smiling client during astrology session" loading="lazy" />
            </div>
            {/* Duplicate for seamless loop */}
            <div className="client-photo">
              <img src={clientPhoto1} alt="Happy client during natal chart reading session" loading="lazy" />
            </div>
            <div className="client-photo">
              <img src={clientPhoto2} alt="Client giving thumbs up during astrology consultation" loading="lazy" />
            </div>
            <div className="client-photo">
              <img src={clientPhoto3} alt="Satisfied client during chart reading" loading="lazy" />
            </div>
            <div className="client-photo">
              <img src={clientPhoto4} alt="Smiling client during astrology session" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2>Ready to understand your patterns?</h2>
          <p>Let's look at your chart</p>
          <a href="#booking" className="cta-button large" onClick={handleBookingClick}>book a session</a>
          <p className="guarantee-text">if the reading doesn't click with you, just let me know</p>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="section faq-section">
        <div className="container">
          <h2 className="section-title">FAQ</h2>
          <div className="faq-list">
            {faqs.map((faq, index) => (
              <div key={index} className="faq-item">
                <button
                  className={`faq-question ${faqOpen[index] ? 'active' : ''}`}
                  onClick={() => toggleFAQ(index)}
                >
                  {faq.question}
                  <span className="faq-icon">{faqOpen[index] ? '−' : '+'}</span>
                </button>
                {faqOpen[index] && (
                  <div className="faq-answer">{faq.answer}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Section */}
      <section id="booking" className="section booking-section">
        <div className="container">
          <h2 className="section-title">What to expect</h2>
          <div className="booking-content">
            <div className="booking-info">
              
              <p>
                We'll meet via video call or in person (Bali). After you book, you'll get:
              </p>
              <ul>
                <li>A questionnaire to help me prepare for your session via e-mail</li>
                <li>Video call link sent 12 hours before your appointment</li>
                <li>Recording of the session for your records</li>
              </ul>
              <div className="guarantee-box">
                <h4>☾ My promise</h4>
                <p>If the reading doesn't resonate with you or feel helpful, just reach out within a day and I'll give you a full refund. Simple as that.</p>
              </div>
            </div>

            {/* Acuity Scheduling Iframe */}
            <div className="scheduling-container">
              <iframe
                src="https://app.acuityscheduling.com/schedule.php?owner=37428029&ref=embedded_csp"
                title="Schedule Appointment"
                width="100%"
                height="800"
                style={{ border: 0 }}
                allow="payment"
                loading="lazy"
              ></iframe>
              <script src="https://embed.acuityscheduling.com/js/embed.js" type="text/javascript"></script>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="section contact-section">
        <div className="container">
          <h2 className="section-title">Say hello</h2>
          <div className="contact-content">
            <p>
              Questions? Want to chat first? Just reach out.
            </p>
            <div className="contact-methods">
              <a href="mailto:j.lietunovas@gmail.com" className="contact-link">
                Email: j.lietunovas@gmail.com
              </a>
              <div className="social-links">
                <a href="https://instagram.com/naive.magic" target="_blank" rel="noopener noreferrer">
                  Instagram
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <p>&copy; 2025 Jurgis Lietunovas - Astrology Readings</p>
          <p className="footer-note">All consultations are for guidance and entertainment purposes</p>
        </div>
      </footer>
    </div>
  )
}

export default App
