import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./Global.css";
import Beach from "./pages/BeachFile/Beach";
import Period from "./pages/PeriodFile/Period";
import DaybyDay from "./pages/DaybyDayFile/DaybyDay";
import CodBarreReader from "./pages/CodBarreReaderFile/CodBarreReader";
import BeachPlanPeriod from "./pages/BeachPlanPeriodFile/BeachPlanPeriod";
import BeachPlanMorning from "./pages/BeachPlanMorningFile/BeachPlanMorning";
import BeachPlanAfternoon from "./pages/BeachPlanAfternoonFile/BeachPlanAfternoon";
import Navbar from "./components/Navbar";

const App = () => {
  return (
    <Router>
      <div>
        <Navbar />
        <Routes>
          <Route path="/Parasols" element={<Beach />} />
          <Route path="/" element={<Beach />} />
          <Route path="/period" element={<Period />} />
          <Route path="/daybyday" element={<DaybyDay />} />
          <Route path="/codbarrereader" element={<CodBarreReader />} />
          <Route path="/beachplanperiod" element={<BeachPlanPeriod />} />
          <Route path="/daybyday" element={<DaybyDay />} />
          <Route path="/beachplanmorning" element={<BeachPlanMorning />} />
          <Route path="/beachplanafternoon" element={<BeachPlanAfternoon />} />
        </Routes>
      </div>
    </Router>
  );
};
export default App;
