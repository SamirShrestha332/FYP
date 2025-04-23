import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './PaymentStyles.css';
import RecruiterHeader from '../RecruiterHeader';
import { FaCheckCircle, FaArrowRight } from 'react-icons/fa';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState(null);
  
  useEffect(() => {
    const processPayment = async () => {
      try {
        setLoading(true);
        
        // Get URL parameters from eSewa callback
        const params = new URLSearchParams(window.location.search);
        const transactionId = params.get('transaction_uuid') || params.get('oid');
        const status = params.get('status') || 'success';
        const totalAmount = params.get('total_amount');
        
        // Get user data from localStorage
        const userData = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        
        if (!userData || !token) {
          setError('User session expired. Please log in again.');
          setTimeout(() => navigate('/recruiter/login'), 3000);
          return;
        }
        
        const user = JSON.parse(userData);
        
        // Get selected plan from localStorage
        const selectedPlan = localStorage.getItem('selectedPlan') || 'basic';
        
        // Define plan details
        const plans = {
          basic: {
            amount: 1000,
            tax: 50,
            title: "Basic Plan",
            description: "Post 1 job with 7-day visibility.",
            job_posts: 1,
            validity_days: 7
          },
          standard: {
            amount: 2000,
            tax: 100,
            title: "Standard Plan",
            description: "Post up to 3 jobs with 15-day visibility + featured badge.",
            job_posts: 3,
            validity_days: 15
          },
          premium: {
            amount: 3000,
            tax: 150,
            title: "Premium Plan",
            description: "Unlimited job posts, 30-day visibility + top placement.",
            job_posts: -1,
            validity_days: 30
          },
        };
        
        const plan = plans[selectedPlan];
        
        // Calculate expiry date
        const today = new Date();
        const expiryDate = new Date(today);
        expiryDate.setDate(today.getDate() + plan.validity_days);
        
        // Check if payment was already processed (to prevent duplicate processing)
        const existingPayment = localStorage.getItem('paymentPlan');
        if (existingPayment) {
          const paymentData = JSON.parse(existingPayment);
          if (paymentData.transactionId === transactionId) {
            console.log('Payment already processed, skipping API call');
            setPaymentDetails(paymentData);
            setLoading(false);
            return;
          }
        }
        
        // Store payment data in database
        const response = await axios.post(
          'http://localhost:5000/api/recruiter/payment-webhook',
          {
            transaction_id: transactionId,
            recruiter_id: user.id,
            amount: plan.amount + plan.tax + 10, // Add service charge
            plan_type: selectedPlan,
            payment_method: 'esewa',
            status: status,
            job_posts_allowed: plan.job_posts,
            validity_days: plan.validity_days,
            expiry_date: expiryDate.toISOString().split('T')[0]
          },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        console.log('Payment data stored:', response.data);
        
        // Store payment plan in localStorage for client-side tracking
        const paymentPlan = {
          plan: selectedPlan,
          expiryDate: expiryDate.toISOString().split('T')[0],
          jobPostsRemaining: plan.job_posts,
          transactionId: transactionId,
          amount: plan.amount + plan.tax + 10,
          paymentCompleted: true
        };
        
        localStorage.setItem('paymentPlan', JSON.stringify(paymentPlan));
        setPaymentDetails(paymentPlan);
        
      } catch (error) {
        console.error('Error processing payment:', error);
        
        // If it's a duplicate entry error, we can still consider it successful
        // since it means the payment was already processed
        if (error.response && error.response.data && 
            error.response.data.error && 
            error.response.data.error.includes('Duplicate entry')) {
          
          // Get selected plan from localStorage
          const selectedPlan = localStorage.getItem('selectedPlan') || 'basic';
          const plans = {
            basic: {
              amount: 1000,
              tax: 50,
              job_posts: 1,
              validity_days: 7
            },
            standard: {
              amount: 2000,
              tax: 100,
              job_posts: 3,
              validity_days: 15
            },
            premium: {
              amount: 3000,
              tax: 150,
              job_posts: -1,
              validity_days: 30
            },
          };
          
          const plan = plans[selectedPlan];
          const today = new Date();
          const expiryDate = new Date(today);
          expiryDate.setDate(today.getDate() + plan.validity_days);
          
          const params = new URLSearchParams(window.location.search);
          const transactionId = params.get('transaction_uuid') || params.get('oid');
          
          const paymentPlan = {
            plan: selectedPlan,
            expiryDate: expiryDate.toISOString().split('T')[0],
            jobPostsRemaining: plan.job_posts,
            transactionId: transactionId,
            amount: plan.amount + plan.tax + 10,
            paymentCompleted: true
          };
          
          localStorage.setItem('paymentPlan', JSON.stringify(paymentPlan));
          setPaymentDetails(paymentPlan);
        } else {
          setError('Failed to process payment. Please contact support.');
        }
      } finally {
        setLoading(false);
      }
    };
    
    processPayment();
  }, [navigate, location]);
  
  const handleContinue = () => {
    // Make sure the payment is marked as completed in localStorage
    const paymentPlan = JSON.parse(localStorage.getItem('paymentPlan') || '{}');
    paymentPlan.paymentCompleted = true;
    localStorage.setItem('paymentPlan', JSON.stringify(paymentPlan));
    
    // Navigate to post job page
    console.log('Navigating to post job page with payment plan:', paymentPlan);
    
    // Use window.location for a hard redirect to ensure it works
    window.location.href = '/recruiter/post-job';
  };
  
  return (
    <div className="payment-success-container">
      <RecruiterHeader />
      
      <div className="payment-success-content">
        {loading ? (
          <div className="payment-loading">
            <div className="loader"></div>
            <p>Processing your payment...</p>
          </div>
        ) : error ? (
          <div className="payment-error">
            <h2>Payment Error</h2>
            <p>{error}</p>
            <button onClick={() => navigate('/recruiter/dashboard')} className="back-button">
              Back to Dashboard
            </button>
          </div>
        ) : (
          <div className="payment-success-card">
            <div className="success-icon">
              <FaCheckCircle />
            </div>
            
            <h1>Payment Successful!</h1>
            <p>Thank you for your subscription to HamroJob.</p>
            
            {paymentDetails && (
              <div className="payment-details">
                <h3>Payment Details</h3>
                <div className="detail-row">
                  <span>Plan:</span>
                  <span>{paymentDetails.plan.charAt(0).toUpperCase() + paymentDetails.plan.slice(1)} Plan</span>
                </div>
                <div className="detail-row">
                  <span>Amount:</span>
                  <span>Rs. {paymentDetails.amount}</span>
                </div>
                <div className="detail-row">
                  <span>Transaction ID:</span>
                  <span>{paymentDetails.transactionId}</span>
                </div>
                <div className="detail-row">
                  <span>Valid Until:</span>
                  <span>{new Date(paymentDetails.expiryDate).toLocaleDateString()}</span>
                </div>
                <div className="detail-row">
                  <span>Job Posts:</span>
                  <span>{paymentDetails.jobPostsRemaining === -1 ? 'Unlimited' : paymentDetails.jobPostsRemaining}</span>
                </div>
              </div>
            )}
            
            <div className="success-actions">
              <button onClick={handleContinue} className="continue-button">
                Post a Job Now <FaArrowRight />
              </button>
              <button onClick={() => navigate('/recruiter/dashboard')} className="dashboard-button">
                Go to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;