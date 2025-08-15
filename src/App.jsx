import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import Features from "./components/Features";
import { SmoothCursor } from "./components/ui/smooth-cursor";

export default function App() {
  return (
    <>
    <div className="w-full h-screen bg-black">
      <SmoothCursor /> 
        <Navbar/>
        <HeroSection/>
        <Features/>
    </div>
    
    </>
  );
}
