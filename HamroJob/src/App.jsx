import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Signup from "./component/Signup";
import Login from "./component/Login";
import Homepage from"./component/Homepage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<Homepage />} />
        <Route path="/" element={<Login />} />
        
      </Routes>
    </Router>
  );
}

export default App;
