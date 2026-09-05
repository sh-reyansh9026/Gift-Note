import { SignIn } from "@clerk/clerk-react";

function Login() {
  return (
    <div className="min-h-screen bg-[#f5f5f3] flex items-center justify-center p-4">
      <SignIn
        routing="path"
        path="/login"
        signUpUrl="/signup"
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

export default Login;
