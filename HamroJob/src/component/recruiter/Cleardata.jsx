import React from 'react';

// Function to clear all user-related data from localStorage
export const clearLocalStorage = () => {
  const keysToRemove = [
    'user',
    'token',
    'isLoggedIn',
    'userRole',
    'paymentPlan',
    'lastPaymentTransaction',
    'selectedPlan',
    'planId',
    'planName',
    'planPrice'
  ];

  keysToRemove.forEach(key => localStorage.removeItem(key));
  console.log('All user data cleared from localStorage');
};

// Component that provides a button to clear localStorage data
const ClearData = () => {
  const handleClearData = () => {
    clearLocalStorage();
    // Optionally redirect to login page after clearing data
    window.location.href = '/recruiter/login';
  };

  return (
    <div className="clear-data-container">
      <h3>Clear User Data</h3>
      <p>This will remove all your stored information and log you out.</p>
      <button 
        className="clear-data-btn" 
        onClick={handleClearData}
      >
        Clear All Data & Logout
      </button>
    </div>
  );
};

export default ClearData;



