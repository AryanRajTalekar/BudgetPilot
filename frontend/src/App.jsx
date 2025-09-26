import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import Quote from "./pages/Quote";
import ExplanationPage from "./pages/ExplanationPage";
import TimelinePage from "./pages/FeaturesPage";
import Testimonials from "./pages/Testimonials";

export default function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={
          <>
            <LandingPage />
            <Quote />
            <ExplanationPage />
            <TimelinePage />
            <Testimonials />
          </>
        } />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}
