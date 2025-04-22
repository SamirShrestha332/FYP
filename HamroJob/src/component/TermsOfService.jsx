import React from 'react';
import { useNavigate } from 'react-router-dom';
import './TermsOfService.css';

function TermsOfService() {
  const navigate = useNavigate();
  
  return (
    <div className="terms-container">
      {/* Navigation */}
      <div className="nav">
        <div className="logo">
          <img className="logo-img" src="/src/assets/Logo.png" alt="HamroJob Logo" onClick={() => navigate('/')} />
        </div>
        <nav>
          <ul>
            <li><a href="/jobs">Jobs</a></li>
            <li><a href="/about-us">About Us</a></li>
          </ul>
        </nav>
        <button className="back-button" onClick={() => navigate(-1)}>
          <ion-icon name="arrow-back-outline"></ion-icon> Back
        </button>
      </div>
      
      <div className="terms-content">
        <h1>Terms of Service</h1>
        <p className="last-updated">Last Updated: June 2025</p>
        
        <div className="terms-section">
          <h2>1. Introduction</h2>
          <p>Welcome to HamroJob ("we," "our," or "us"). By accessing or using our website, mobile applications, or any services offered through them (collectively, the "Services"), you agree to comply with and be bound by these Terms of Service.</p>
          <p>Please read these Terms carefully. If you do not agree with these Terms, you should not use our Services.</p>
        </div>
        
        <div className="terms-section">
          <h2>2. Account Registration</h2>
          <p>To access certain features of our Services, you may need to register for an account. When you register, you agree to provide accurate, current, and complete information. You are responsible for maintaining the confidentiality of your account information, including your password.</p>
          <p>You are solely responsible for all activities that occur under your account. If you believe your account has been compromised, please contact us immediately.</p>
        </div>
        
        <div className="terms-section">
          <h2>3. Job Listings and Applications</h2>
          <p>HamroJob serves as a platform connecting job seekers with employers. We do not guarantee the accuracy of job listings or the legitimacy of employers using our platform.</p>
          <p>When applying for jobs through our platform, you understand that:</p>
          <ul>
            <li>Your application materials may be shared with the prospective employer</li>
            <li>We do not guarantee you will receive an interview or job offer</li>
            <li>We are not responsible for the hiring decisions or practices of employers</li>
          </ul>
        </div>
        
        <div className="terms-section">
          <h2>4. Employer Responsibilities</h2>
          <p>Employers using our platform agree to:</p>
          <ul>
            <li>Provide accurate job listings</li>
            <li>Comply with all applicable employment laws</li>
            <li>Maintain the confidentiality of applicant information</li>
            <li>Use applicant information solely for recruitment purposes</li>
          </ul>
        </div>
        
        <div className="terms-section">
          <h2>5. Prohibited Conduct</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Use our Services for any illegal purpose</li>
            <li>Post false, misleading, or fraudulent content</li>
            <li>Harass, intimidate, or discriminate against any user</li>
            <li>Attempt to gain unauthorized access to our systems or user accounts</li>
            <li>Use our Services to distribute spam, malware, or other harmful content</li>
            <li>Interfere with the proper functioning of our Services</li>
          </ul>
        </div>
        
        <div className="terms-section">
          <h2>6. Intellectual Property</h2>
          <p>Our Services and all content provided through them, including text, graphics, logos, images, and software, are owned by or licensed to HamroJob and are protected by intellectual property laws.</p>
          <p>You may not reproduce, distribute, modify, create derivative works of, publicly display, or use our intellectual property without our express written permission.</p>
        </div>
        
        <div className="terms-section">
          <h2>7. Privacy</h2>
          <p>Your privacy is important to us. Please review our <a href="/privacy">Privacy Policy</a> to understand how we collect, use, and share information about you.</p>
        </div>
        
        <div className="terms-section">
          <h2>8. Limitation of Liability</h2>
          <p>HamroJob is provided on an "as is" and "as available" basis. We make no warranties, express or implied, regarding the reliability, availability, or accuracy of our Services.</p>
          <p>To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use our Services.</p>
        </div>
        
        <div className="terms-section">
          <h2>9. Modifications to Terms</h2>
          <p>We may modify these Terms at any time by posting the revised terms on our website. Your continued use of our Services after such changes constitutes your acceptance of the revised Terms.</p>
        </div>
        
        <div className="terms-section">
          <h2>10. Termination</h2>
          <p>We reserve the right to suspend or terminate your access to our Services at any time for any reason, including violation of these Terms.</p>
        </div>
        
        <div className="terms-section">
          <h2>11. Contact Information</h2>
          <p>If you have any questions about these Terms, please contact us at:</p>
          <p>Email: legal@hamrojob.com</p>
          <p>Address: Kathmandu, Nepal</p>
        </div>
      </div>
      
      <footer className="terms-footer">
        <p>&copy; {new Date().getFullYear()} HamroJob. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default TermsOfService; 