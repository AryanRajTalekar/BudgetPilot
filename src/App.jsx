import Navbar from "./components/Navbar";
import LandingPage from "./pages/LandingPage";
import Quote from "./pages/Quote";
import ExplanationPage from "./pages/ExplanationPage";

export default function App() {
  return (
    
      <div className="w-full overflow-hidden overflow-hidden-x">
        <Navbar />
        <LandingPage />
        <Quote />
        <ExplanationPage/>
      </div>

    
  );
}