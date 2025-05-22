import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Signup from "./component/Signup";
import Login from "./component/Login";
import ForgotPassword from "./component/ForgotPassword";
import Homepage from "./component/Homepage";
import AdminLogin from "./component/admin/AdminLogin";
import Dashboard from "./component/admin/Dashboard";
import Users from "./component/admin/Users";
import Jobs from "./component/admin/Jobs";
import Applications from "./component/admin/Applications";
import Payments from "./component/admin/Payments";
import Settings from "./component/admin/Settings";
import UserProfile from "./component/UserProfile";
import UserSettings from "./component/UserSettings";
import UserApplications from "./component/UserApplications";
import ProtectedRoute from "./component/ProtectedRoute";
import JobSection from "./component/JobSection";
import "./App.css";
import JobApplicationPage from './component/JobApplicationPage';
import "./component/admin/AdminStyles.css";
import OTPVerification from './component/OTPVerification';
import RecruiterSignup from './component/recruiter/RecruiterSignup';
import RecruiterLogin from './component/recruiter/RecruiterLogin';
import RecruiterForgotPassword from './component/recruiter/RecruiterForgotPassword';
import RecruiterDashboard from './component/recruiter/RecruiterDashboard';
import RecruiterJobs from './component/recruiter/RecruiterJobs';
import RecruiterPostJob from './component/recruiter/RecruiterPostJob';
import RecruiterApplicants from './component/recruiter/RecruiterApplicants';
import RecruiterProfile from './component/recruiter/RecruiterProfile';
import RecruiterEditJob from './component/recruiter/RecruiterEditJob';
import AboutUs from './component/AboutUs';
import TermsOfService from './component/TermsOfService';
import PaymentCheck from './component/recruiter/Payment/PaymentCheck';


import JobDetail from './component/JobDetail';
import Esewapayment from './component/recruiter/Payment/EsewaPayment.jsx';
import ProtectedJobRoute from './component/recruiter/ProtectedJobRoute';

import PaymentSuccess from './component/recruiter/Payment/PaymentSuccess';
import PaymentInvoice from './component/recruiter/Payment/PaymentInvoice';
import ApplicationDetails from './component/ApplicationDetails';
// Add this import at the top with your other imports


function App() {
  return (
 
    
    
    <Router>
      <Routes>
      
        {/* Public Routes */}
        <Route path="/" element={<Homepage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<OTPVerification />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/privacy" element={<TermsOfService />} />
        <Route path="/help" element={<TermsOfService />} />
        
        {/* Application details routes - both formats */}
        <Route path="/application/:applicationId" element={
          <ProtectedRoute>
            <ApplicationDetails />
          </ProtectedRoute>
        } />
        <Route path="/application-details/:applicationId" element={
          <ProtectedRoute>
            <ApplicationDetails />
          </ProtectedRoute>
        } />
        
        {/* Recruiter Routes */}
        <Route path="/recruiter/payment" element={
          <ProtectedRoute>
            <Esewapayment />
          </ProtectedRoute>
        } />
        <Route path="/recruiter/payment/success" element={
          <ProtectedRoute>
            <PaymentSuccess />
          </ProtectedRoute>
        } />
        <Route path="/recruiter/payment/invoice/:transactionId" element={
          <ProtectedRoute>
            <PaymentInvoice />
          </ProtectedRoute>
        } />
        <Route path="/payment/success" element={
          <Navigate to="/recruiter/payment/success" />
        } />
        <Route path="/payment/failure" element={<Navigate to="/recruiter/payment" />} />
        <Route path="/recruiter/signup" element={<RecruiterSignup />} />
        <Route path="/recruiter/login" element={<RecruiterLogin />} />
        <Route path="/recruiter/forgot-password" element={<RecruiterForgotPassword />} />
        <Route path="/recruiter/dashboard" element={
          <ProtectedRoute>
            <RecruiterDashboard />
          </ProtectedRoute>
        } />
        <Route path="/recruiter/jobs" element={
          <ProtectedRoute>
            <RecruiterJobs />
          </ProtectedRoute>
        } />
        {/* Update this route to use ProtectedJobRoute instead of ProtectedRoute */}
        <Route path="/recruiter/post-job" element={
          <ProtectedRoute>
            <PaymentCheck>
              <RecruiterPostJob />
            </PaymentCheck>
          </ProtectedRoute>
        } />
        <Route path="/recruiter/jobs/edit/:jobId" element={
          <ProtectedRoute>
            <RecruiterEditJob />
          </ProtectedRoute>
        } />
        <Route path="/recruiter/job/:id" element={
          <ProtectedRoute>
            <JobDetail isRecruiterView={true} />
          </ProtectedRoute>
        } />
        <Route path="/recruiter/applicants" element={
          <ProtectedRoute>
            <RecruiterApplicants />
          </ProtectedRoute>
        } />
        <Route path="/recruiter/profile" element={
          <ProtectedRoute>
            <RecruiterProfile />
          </ProtectedRoute>
        } />
        

        {/* User Routes - Protected */}
        <Route path="/profile" element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <UserSettings />
          </ProtectedRoute>
        } />
        <Route path="/applications" element={
          <ProtectedRoute>
            <UserApplications />
          </ProtectedRoute>
        } />
        
        {/* Add these new routes for jobs */}
        <Route path="/jobs" element={<JobSection />} />
        <Route path="/job/:id" element={<JobDetail />} />
        
        <Route path="/searches" element={
          <ProtectedRoute>
            <Homepage />
          </ProtectedRoute>
        } />
        <Route path="/events" element={
          <ProtectedRoute>
            <Homepage />
          </ProtectedRoute>
        } />
        <Route path="/saved-offers" element={
          <ProtectedRoute>
            <Homepage />
          </ProtectedRoute>
        } />
        <Route path="/following" element={
          <ProtectedRoute>
            <Homepage />
          </ProtectedRoute>
        } />
        <Route path="/notifications" element={
          <ProtectedRoute>
            <Homepage />
          </ProtectedRoute>
        } />
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/users" element={<Users />} />
        <Route path="/admin/jobs" element={<Jobs />} />
        <Route path="/admin/applications" element={<Applications />} />
        <Route path="/admin/payments" element={<Payments />} />
        <Route path="/admin/settings" element={<Settings />} />
        {/* Application route - Protected so only logged in users can apply */}
        <Route path="/apply/:jobId" element={
          <ProtectedRoute>
            <JobApplicationPage />
          </ProtectedRoute>
        } />
   
      </Routes>
    </Router>
    
  );
}

export default App;
