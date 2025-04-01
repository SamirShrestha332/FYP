import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Signup from "./component/Signup";
import Login from "./component/Login";
import Homepage from "./component/Homepage";
import AdminLogin from "./component/admin/AdminLogin";
import Dashboard from "./component/admin/Dashboard";
import Users from "./component/admin/Users";
import Jobs from "./component/admin/Jobs";
import Applications from "./component/admin/Applications";
import Settings from "./component/admin/Settings";
import UserProfile from "./component/UserProfile";
import UserSettings from "./component/UserSettings";
import UserApplications from "./component/UserApplications";
import ProtectedRoute from "./component/ProtectedRoute";
import JobSection from "./component/JobSection";
import "./App.css";
import "./component/admin/AdminStyles.css";
import OTPVerification from './component/OTPVerification';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Homepage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-otp" element={<OTPVerification />} />
        
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
        
        <Route path="/jobs" element={
          <ProtectedRoute>
            <JobSection />
          </ProtectedRoute>
        } />
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
        <Route path="/admin/settings" element={<Settings />} />
      </Routes>
    </Router>
  );
}

export default App;
