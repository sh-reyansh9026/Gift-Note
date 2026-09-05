import { SignUp } from "@clerk/clerk-react";

function Signup() {
  return (
    <div className="min-h-screen bg-[#f5f5f3] flex items-center justify-center p-4">
      <SignUp
        routing="path"
        path="/signup"
        signInUrl="/login"
        forceRedirectUrl="/dashboard"
        appearance={{
          elements: {
            rootBox: "w-full max-w-md",
            card: "shadow-xl rounded-2xl",
          },
        }}
      />
    </div>
  );
}

export default Signup;
