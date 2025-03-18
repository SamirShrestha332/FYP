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
import "./App.css";
import "./component/admin/AdminStyles.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Login />} />
        
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
