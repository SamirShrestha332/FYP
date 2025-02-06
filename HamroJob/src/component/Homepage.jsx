import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Signup from "./component/Signup";
import Login from "./component/Login";

function Homepage() {
  return (
   <>
   <div className="container">
<div className="homepage"></div>
<div className="jobsection"></div>
<div className="About_us_section"></div>
<div className="skillcontent_section"></div>

   </div>
   </>
  );
}

export default Homepage;
