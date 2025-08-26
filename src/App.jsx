import Navbar from "./components/Navbar";
import { SmoothCursor } from "./components/ui/smooth-cursor";
import LandingPage from "./pages/LandingPage";
import Quote from "./pages/Quote";

export default function App() {
  return (
    <div className="w-full h-screen">
      <SmoothCursor />
      <div className="relative w-full h-screen">
        <Navbar />
        <LandingPage />
        <Quote/>
      </div>
    </div>
  );
}
