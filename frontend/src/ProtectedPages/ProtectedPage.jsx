import { RedirectToSignIn, SignedIn, SignedOut } from "@clerk/clerk-react";

function ProtectedPage() {
  return (
    <>
      <SignedIn>
        <h2 className="text-xl font-semibold">This is a protected page</h2>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}

export default ProtectedPage;
