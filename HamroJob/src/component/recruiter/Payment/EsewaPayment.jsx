import React, { useEffect, useState } from 'react';
import CryptoJS from 'crypto-js';
import { useNavigate } from 'react-router-dom';
import './PaymentStyles.css';

const EsewaPayment = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState('basic');
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  const merchantSecret = '8gBm/:&EnhH.1/q'; // Make sure this is your actual test key

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

  const generateFormData = (planKey) => {
    const plan = plans[planKey];
    const transaction_uuid = Date.now().toString();
    const product_code = 'EPAYTEST';
    const product_service_charge = 10;
    const product_delivery_charge = 0;
    const total = plan.amount + plan.tax + product_service_charge + product_delivery_charge;

    // Fields in exact order as signed_field_names
    const signedFields = {
      total_amount: total,
      transaction_uuid,
      product_code
    };

    const stringToSign = Object.entries(signedFields)
      .map(([key, value]) => `${key}=${value}`)
      .join(',');

    const hash = CryptoJS.HmacSHA256(stringToSign, merchantSecret);
    const signature = CryptoJS.enc.Base64.stringify(hash);

    return {
      amount: plan.amount,
      tax_amount: plan.tax,
      product_service_charge,
      product_delivery_charge,
      total_amount: total,
      transaction_uuid,
      product_code,
      signature
    };
  };

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      navigate('/recruiter/login');
    }

    const newFormData = generateFormData(selectedPlan);
    setFormData(newFormData);
    localStorage.setItem('selectedPlan', selectedPlan);
  }, [selectedPlan, navigate]);

  const handlePlanChange = (plan) => {
    setSelectedPlan(plan);
    const updatedFormData = generateFormData(plan);
    setFormData(updatedFormData);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Store plan details in localStorage before redirecting
    const plan = plans[selectedPlan];
    const today = new Date();
    let expiryDate = new Date(today);
    expiryDate.setDate(today.getDate() + plan.validity_days);
    
    // Store payment information in localStorage for client-side tracking
    const paymentPlan = {
        plan: selectedPlan,
        expiryDate: expiryDate.toISOString().split('T')[0],
        jobPostsRemaining: plan.job_posts,
        transactionId: formData.transaction_uuid,
        amount: formData.total_amount
    };
    
    localStorage.setItem('paymentPlan', JSON.stringify(paymentPlan));
    
    // Also store the transaction data for potential verification later
    localStorage.setItem('lastPaymentTransaction', formData.transaction_uuid);
    
    // Submit the form to eSewa
    document.getElementById('esewa-payment-form').submit();
  };

  useEffect(() => {
    // This runs after a successful payment/redirect back
    const checkPaymentStatus = async () => {
        const urlParams = new URLSearchParams(window.location.search);
        // Check if we have transaction data in the URL (eSewa callback includes this)
        const transactionId = urlParams.get('transaction_uuid') || localStorage.getItem('lastPaymentTransaction');
        
        if (transactionId) {
            try {
                // Get the user data from localStorage
                const userData = JSON.parse(localStorage.getItem('user'));
                
                // Get the payment plan from localStorage
                const paymentPlan = JSON.parse(localStorage.getItem('paymentPlan'));
                
                // If we have transaction ID and user data, send to our webhook
                if (userData && paymentPlan) {
                    // Calculate expiry date
                    const today = new Date();
                    const expiryDate = new Date(today);
                    const selectedPlan = localStorage.getItem('selectedPlan') || 'basic';
                    
                    // Define plan details
                    const plans = {
                      basic: { validity_days: 7, job_posts: 1 },
                      standard: { validity_days: 15, job_posts: 3 },
                      premium: { validity_days: 30, job_posts: -1 }
                    };
                    
                    expiryDate.setDate(today.getDate() + plans[selectedPlan].validity_days);
                    
                    const response = await fetch('http://localhost:5000/api/recruiter/payment-webhook', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        },
                        body: JSON.stringify({
                            transaction_id: transactionId,  // Changed from transaction_uuid to transaction_id
                            recruiter_id: userData.id,      // Changed from user_id to recruiter_id
                            amount: paymentPlan.amount,     // Changed from total_amount to amount
                            plan_type: selectedPlan,
                            payment_method: 'esewa',
                            status: 'completed',
                            job_posts_allowed: plans[selectedPlan].job_posts,
                            validity_days: plans[selectedPlan].validity_days,
                            expiry_date: expiryDate.toISOString().split('T')[0]
                        })
                    });
                    
                    const result = await response.json();
                    console.log('Payment data sent to webhook:', result);
                    
                    if (result.success) {
                        // Payment was successful
                        // Update the paymentPlan in localStorage to include paymentCompleted flag
                        paymentPlan.paymentCompleted = true;
                        localStorage.setItem('paymentPlan', JSON.stringify(paymentPlan));
                        
                        // Clear the lastPaymentTransaction from localStorage
                        localStorage.removeItem('lastPaymentTransaction');
                        
                        // Redirect to success page
                        navigate('/recruiter/payment/success');
                    } else {
                        console.error('Payment processing failed:', result.message);
                        alert('Payment processing failed. Please try again or contact support.');
                    }
                }
            } catch (error) {
                console.error('Error sending payment confirmation to server:', error);
            }
        }
    };
    
    checkPaymentStatus();
  }, [navigate]);

  // Update the form inputs to use your custom success URL
  return (
    <div className="payment-container">
      <div className="payment-header">
        <h1>Choose a Subscription Plan</h1>
        <p>Select the plan that best fits your hiring needs</p>
      </div>

      <div className="plans-container">
        {Object.keys(plans).map((planKey) => (
          <div
            key={planKey}
            className={`plan-card ${selectedPlan === planKey ? 'selected' : ''}`}
            onClick={() => handlePlanChange(planKey)}
          >
            <div className="plan-header">
              <h2>{plans[planKey].title}</h2>
              <div className="plan-price">
                <span className="currency">Rs.</span>
                <span className="amount">{plans[planKey].amount}</span>
              </div>
            </div>
            <div className="plan-features">
              <p>{plans[planKey].description}</p>
              <ul>
                <li>
                  <span className="feature-value">
                    {plans[planKey].job_posts === -1 ? 'Unlimited' : plans[planKey].job_posts}
                  </span>
                  job posts
                </li>
                <li>
                  <span className="feature-value">{plans[planKey].validity_days}</span> days validity
                </li>
                {planKey === 'standard' && <li>Featured job listing</li>}
                {planKey === 'premium' && (
                  <>
                    <li>Featured job listing</li>
                    <li>Priority placement in search</li>
                    <li>Detailed analytics</li>
                  </>
                )}
              </ul>
            </div>
            <div className="plan-footer">
              <button
                className={`select-plan-btn ${selectedPlan === planKey ? 'selected' : ''}`}
                onClick={() => handlePlanChange(planKey)}
              >
                {selectedPlan === planKey ? 'Selected' : 'Select Plan'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="payment-form-container">
        <h2>Complete Your Payment</h2>
        <p>You've selected the <strong>{plans[selectedPlan].title}</strong></p>

        <form
          id="esewa-payment-form"
          action="https://rc-epay.esewa.com.np/api/epay/main/v2/form"
          method="POST"
          onSubmit={handleSubmit}
        >
          <input type="hidden" name="amount" value={formData.amount} />
          <input type="hidden" name="tax_amount" value={formData.tax_amount} />
          <input type="hidden" name="product_service_charge" value={formData.product_service_charge} />
          <input type="hidden" name="product_delivery_charge" value={formData.product_delivery_charge} />
          <input type="hidden" name="total_amount" value={formData.total_amount} />
          <input type="hidden" name="transaction_uuid" value={formData.transaction_uuid} />
          <input type="hidden" name="product_code" value={formData.product_code} />
          <input type="hidden" name="signature" value={formData.signature} />
          <input type="hidden" name="signed_field_names" value="total_amount,transaction_uuid,product_code" />
          <input type="hidden" name="user_id" value={user?.id} />

          {/* Update success and failure URLs */}
          <input
            type="hidden"
            name="success_url"
            value="http://localhost:5173/recruiter/payment/success"
          />
          <input
            type="hidden"
            name="failure_url"
            value="http://localhost:5173/recruiter/payment/failure"
          />

          <button
            type="submit"
            className="payment-button"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Pay with eSewa'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EsewaPayment;
