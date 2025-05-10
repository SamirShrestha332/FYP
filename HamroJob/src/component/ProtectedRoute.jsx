import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        
        if (!token || isLoggedIn !== 'true') {
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }
        
        // Set authentication
        // to true based on localStorage first to prevent redirecting
        // This helps avoid the login loop
        setIsAuthenticated(true);
        setLoading(false);
        
      
        try {
          const response = await axios.get('http://localhost:5000/api/users/verify', {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (response.data && response.data.valid === false) {
            // Only clear tokens if explicitly told the token is invalid
            localStorage.removeItem('token');
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('user');
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error('Token verification failed:', error);
          // Only clear tokens on explicit 401 Unauthorized
          if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('user');
            setIsAuthenticated(false);
          }
          // For all other errors, keep user logged in (network errors shouldn't log people out)
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // Default to trusting localStorage for auth state on errors
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};


export default ProtectedRoute;
