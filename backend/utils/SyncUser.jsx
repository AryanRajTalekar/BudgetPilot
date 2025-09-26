import { useUser } from "@clerk/clerk-react";
import { useEffect } from "react";
import axios from "axios";

const SyncUser = () => {
  const { user, isSignedIn } = useUser();

  useEffect(() => {
    if (isSignedIn && user) {
      axios.post("http://localhost:5000/api/saveUser", {
        clerkId: user.id,
        email: user.primaryEmailAddress?.emailAddress,
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
      });
    }
  }, [isSignedIn, user]);

  return null;
};

export default SyncUser;
