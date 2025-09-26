import React, { useEffect } from "react";
import { SiWebmoney } from "react-icons/si";
import { Button } from "../components/ui/button";
import { CoolMode } from "../components/magicui/cool-mode";
import { SignInButton, useUser } from "@clerk/clerk-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const { isSignedIn, user } = useUser();
  const navigate = useNavigate();
  
  useEffect(() => {
    const saveUser = async () => {
      if (isSignedIn && user) {
        try {
          // Save user to MongoDB
          await axios.post("http://localhost:5000/api/saveUser", {
            clerkId: user.id,
            name: user.fullName,
            email: user.primaryEmailAddress?.emailAddress,
          });

      


          // Redirect to dashboard automatically
          navigate("/dashboard");


        } catch (err) {
          console.error("❌ Error saving user:", err);
        }
      }
    };

    saveUser();




  }, [isSignedIn, user, navigate]);



  return (
    <div className="fixed top-0 left-0 w-full h-[7vw] max-h-20 px-4 md:px-8 flex items-center justify-between 
                    bg-transparent text-white z-100">
      {/* Logo Section */}
      <CoolMode>
        <div className="flex items-center gap-3 md:gap-4">
          <SiWebmoney size={40} />
          <h1 className="text-lg md:text-2xl lg:text-3xl font-semibold">
            BudgetPilot
          </h1>
        </div>
      </CoolMode>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <CoolMode>
          {isSignedIn ? (
            <Button
              onClick={() => navigate("/dashboard")}
              className="text-sm md:text-base font-semibold rounded-xl px-4 py-2 w-full sm:w-auto border border-transparent hover:underline transition duration-300 bg-transparent text-white"
            >
              Go to BudgetPilot
            </Button>
          ) : (
            <SignInButton mode="modal">
              <Button className="text-sm md:text-base font-semibold rounded-xl px-4 py-2 w-full sm:w-auto border border-transparent hover:underline transition duration-300 bg-transparent text-white">
                Login / Create Account
              </Button>
            </SignInButton>
          )}
        </CoolMode>
      </div>
    </div>
  );
};

export default Navbar;
