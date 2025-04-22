import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const storePaymentData = async () => {
      try {
        // Get URL parameters
        const params = new URLSearchParams(window.location.search);
        const transactionId = params.get('oid') || params.get('transaction_uuid');
        const status = params.get('status') || 'success';
        
        // Get user data from localStorage
        const userData = JSON.parse(localStorage.getItem('user'));
        if (!userData) {
          console.error('User data not found');
          navigate('/recruiter/login');
          return;
        }
        
        // Get selected plan from localStorage
        const selectedPlan = localStorage.getItem('selectedPlan') || 'basic';
        
        // Define plan details
        const plans = {
          basic: { amount: 1000, job_posts: 1, validity_days: 7 },
          standard: { amount: 2000, job_posts: 3, validity_days: 15 },
          premium: { amount: 3000, job_posts: -1, validity_days: 30 }
        };
        
        // Calculate expiry date
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + plans[selectedPlan].validity_days);
        
        // Store payment data in database
        const paymentResponse = await fetch('http://localhost:5000/api/payment/store', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            transaction_id: transactionId,
            recruiter_id: userData.id,
            amount: plans[selectedPlan].amount,
            plan_type: selectedPlan,
            payment_method: 'esewa',
            status: 'completed'
          })
        });
        
        const paymentResult = await paymentResponse.json();
        console.log('Payment data stored:', paymentResult);
        
        // Store subscription data in database
        const subscriptionResponse = await fetch('http://localhost:5000/api/payment/subscription', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            recruiter_id: userData.id,
            plan: selectedPlan,
            expiry_date: expiryDate.toISOString(),
            is_active: 1
          })
        });
        
        const subscriptionResult = await subscriptionResponse.json();
        console.log('Subscription data stored:', subscriptionResult);
        
        // Store plan info in localStorage for client-side validation
        const paymentPlan = {
          plan: selectedPlan,
          expiryDate: expiryDate.toISOString(),
          jobPostsRemaining: plans[selectedPlan].job_posts,
          transactionId: transactionId,
          amount: plans[selectedPlan].amount,
          paymentCompleted: true
        };
        
        localStorage.setItem('paymentPlan', JSON.stringify(paymentPlan));
        
        // Redirect to post job page after a short delay
        setTimeout(() => {
          navigate('/recruiter/post-job');
        }, 2000);
      } catch (error) {
        console.error('Error storing payment data:', error);
        // Still redirect to post job page even if there's an error
        setTimeout(() => {
          navigate('/recruiter/post-job');
        }, 2000);
      }
    };
    
    storePaymentData();
  }, [navigate, location]);
  
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.successIcon}>✅</div>
        <h2 style={styles.title}>Payment Successful!</h2>
        <p style={styles.message}>
          Your payment has been processed successfully. Your subscription is now active.
        </p>
        <p style={styles.redirectMessage}>
          You will be redirected to the job posting page in a moment...
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    padding: '20px'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    padding: '40px',
    textAlign: 'center',
    maxWidth: '500px',
    width: '100%'
  },
  successIcon: {
    fontSize: '64px',
    marginBottom: '20px'
  },
  title: {
    fontSize: '24px',
    color: '#2ecc71',
    marginBottom: '20px'
  },
  message: {
    fontSize: '16px',
    color: '#555',
    marginBottom: '20px',
    lineHeight: '1.5'
  },
  redirectMessage: {
    fontSize: '14px',
    color: '#888',
    fontStyle: 'italic'
  }
};

export default PaymentSuccess;