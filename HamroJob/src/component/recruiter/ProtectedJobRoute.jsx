import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedJobRoute = ({ children }) => {
  const location = useLocation();
  
  // Check if user is logged in as a recruiter
  const isRecruiterLoggedIn = () => {
    const userData = localStorage.getItem('user');
    if (!userData) return false;
    
    const user = JSON.parse(userData);
    return user && user.role === 'recruiter';
  };
  
  // Check if user has an active payment plan
  const hasActivePlan = () => {
    const paymentPlan = JSON.parse(localStorage.getItem('paymentPlan'));
    
    if (!paymentPlan) return false;
    
    // Check if plan is expired
    const expiryDate = new Date(paymentPlan.expiryDate);
    const currentDate = new Date();
    
    if (currentDate > expiryDate) {
      // Plan expired, remove from localStorage
      localStorage.removeItem('paymentPlan');
      return false;
    }
    
    // Check if user has remaining job posts
    if (paymentPlan.jobPostsRemaining === 0) {
      return false;
    }
    
    // If jobPostsRemaining is -1, it means unlimited posts
    return true;
  };
  
  if (!isRecruiterLoggedIn()) {
    // Redirect to login if not logged in
    return <Navigate to="/recruiter/login" state={{ from: location }} replace />;
  }
  
  if (!hasActivePlan()) {
    // Redirect to payment page if no active plan
    return <Navigate to="/recruiter/payment" state={{ from: location }} replace />;
  }
  
  // If logged in and has active plan, render the protected component
  return children;
};

export default ProtectedJobRoute;