import React from 'react';
import Navigation from './Navigation';
import './AboutUs.css';

function AboutUs() {
  return (
    <div className="about-us-container">
      {/* Use the Navigation component */}
      <Navigation />

      {/* Hero Section */}
      <div className="about-hero">
        <h1>About HamroJob</h1>
        <p>Connecting talent with opportunity in Nepal and beyond</p>
      </div>

      {/* Our Story Section */}
      <div className="about-section">
        <h2>Our Story</h2>
        <div className="about-content">
          <div className="about-image">
            <img src="/src/assets/team.jpg" alt="Our Team" />
          </div>
          <div className="about-text">
            <p>
              Founded in 2025, HamroJob was created with a simple mission: to bridge the gap between talented professionals and growing companies in Nepal.
            </p>
            <p>
              What started as a small project has grown into Nepal's premier job portal, connecting thousands of job seekers with their dream careers and helping businesses find the perfect candidates to fuel their growth.
            </p>
            <p>
              Our name "Hamro" means "ours" in Nepali, reflecting our commitment to creating a platform that truly belongs to the Nepali community and serves its unique needs in the job market.
            </p>
          </div>
        </div>
      </div>

      {/* Mission and Vision */}
      <div className="mission-vision">
        <div className="mission">
          <h2>Our Mission</h2>
          <p>To empower job seekers and employers by creating the most accessible, transparent and efficient hiring platform in Nepal.</p>
        </div>
        <div className="vision">
          <h2>Our Vision</h2>
          <p>To become the catalyst for employment growth in Nepal by connecting every qualified professional with meaningful career opportunities.</p>
        </div>
      </div>

      {/* Core Values */}
      <div className="about-section values-section">
        <h2>Our Core Values</h2>
        <div className="values-grid">
          <div className="value-card">
            <div className="value-icon">
              <ion-icon name="shield-checkmark-outline"></ion-icon>
            </div>
            <h3>Integrity</h3>
            <p>We are committed to honesty, transparency, and ethical practices in everything we do.</p>
          </div>
          <div className="value-card">
            <div className="value-icon">
              <ion-icon name="people-outline"></ion-icon>
            </div>
            <h3>Community</h3>
            <p>We build lasting relationships with job seekers, employers, and partners based on mutual respect.</p>
          </div>
          <div className="value-card">
            <div className="value-icon">
              <ion-icon name="trending-up-outline"></ion-icon>
            </div>
            <h3>Innovation</h3>
            <p>We continuously improve our platform to better serve the evolving needs of the Nepali job market.</p>
          </div>
          <div className="value-card">
            <div className="value-icon">
              <ion-icon name="ribbon-outline"></ion-icon>
            </div>
            <h3>Excellence</h3>
            <p>We strive for the highest quality in our service, supporting both employers and job seekers.</p>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="about-section team-section">
        <h2>Meet Our Team</h2>
        <div className="team-grid">
          <div className="team-member">
            <div className="member-photo">
              <img src="/src/assets/team-member-1.jpg" alt="Team Member" />
            </div>
            <h3>Samir Shrestha</h3>
            <p>Founder & CEO</p>
          </div>
          <div className="team-member">
            <div className="member-photo">
              <img src="/src/assets/team-member-2.jpg" alt="Team Member" />
            </div>
            <h3>Aarati Thapa</h3>
            <p>Chief Technology Officer</p>
          </div>
          <div className="team-member">
            <div className="member-photo">
              <img src="/src/assets/team-member-3.jpg" alt="Team Member" />
            </div>
            <h3>Rajesh Tamang</h3>
            <p>Head of Operations</p>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="about-section contact-section">
        <h2>Get In Touch</h2>
        <div className="contact-info">
          <div className="contact-item">
            <ion-icon name="location-outline"></ion-icon>
            <p>Kathmandu, Nepal</p>
          </div>
          <div className="contact-item">
            <ion-icon name="mail-outline"></ion-icon>
            <p>info@hamrojob.com</p>
          </div>
          <div className="contact-item">
            <ion-icon name="call-outline"></ion-icon>
            <p>+977 9812345678</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="about-footer">
        <p>&copy; 2025 HamroJob. All rights reserved.</p>
        <div className="social-links">
          <a href="#"><ion-icon name="logo-facebook"></ion-icon></a>
          <a href="#"><ion-icon name="logo-twitter"></ion-icon></a>
          <a href="#"><ion-icon name="logo-linkedin"></ion-icon></a>
          <a href="#"><ion-icon name="logo-instagram"></ion-icon></a>
        </div>
      </footer>
    </div>
  );
}

export default AboutUs; 