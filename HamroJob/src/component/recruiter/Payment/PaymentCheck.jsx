import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

// This component will check if the user has an active payment plan
// If not, it will redirect to the payment page
const PaymentCheck = ({ children }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [hasValidPlan, setHasValidPlan] = useState(false);
  
  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/recruiter/login');
      return;
    }
    
    const user = JSON.parse(userData);
    
    // Check if user has a payment plan
    const paymentPlan = localStorage.getItem('paymentPlan');
    
    if (paymentPlan) {
      const plan = JSON.parse(paymentPlan);
      
      // Check if plan is valid (not expired)
      const expiryDate = new Date(plan.expiryDate);
      const today = new Date();
      
      if (expiryDate > today && plan.paymentCompleted) {
        setHasValidPlan(true);
        setLoading(false);
        return;
      }
    }
    
    // If we get here, check with the server if the user has an active plan
    fetch(`http://localhost:5000/api/payment/plan/${user.id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    .then(response => response.json())
    .then(data => {
      if (data.hasPlan) {
        // If server confirms user has a plan, update localStorage
        const plan = data.plan;
        const paymentPlan = {
          plan: plan.plan,
          expiryDate: plan.expiry_date,
          jobPostsRemaining: plan.job_posts_remaining || -1,
          transactionId: plan.transaction_id || 'server-verified',
          paymentCompleted: true
        };
        
        localStorage.setItem('paymentPlan', JSON.stringify(paymentPlan));
        setHasValidPlan(true);
      } else {
        // No valid plan found
        setHasValidPlan(false);
      }
      setLoading(false);
    })
    .catch(error => {
      console.error('Error checking payment plan:', error);
      setLoading(false);
      setHasValidPlan(false);
    });
  }, [navigate]);
  
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            border: '4px solid rgba(0, 0, 0, 0.1)',
            borderLeft: '4px solid #3498db',
            borderRadius: '50%',
            width: '30px',
            height: '30px',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p>Checking subscription status...</p>
        </div>
      </div>
    );
  }
  
  // If user has a valid plan, render the children components
  // Otherwise, redirect to payment page
  return hasValidPlan ? children : <Navigate to="/recruiter/payment" />;
};

export default PaymentCheck;