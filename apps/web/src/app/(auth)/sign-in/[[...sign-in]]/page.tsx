import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <SignIn 
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-slate-800 border border-slate-700",
            headerTitle: "text-white",
            headerSubtitle: "text-slate-400",
            socialButtonsBlockButton: "bg-slate-700 border-slate-600 text-white hover:bg-slate-600",
            formFieldLabel: "text-slate-300",
            formFieldInput: "bg-slate-700 border-slate-600 text-white",
            footerActionLink: "text-blue-400 hover:text-blue-300",
          },
        }}
        afterSignInUrl="/dashboard"
        signUpUrl="/sign-up"
      />
    </div>
  );
}
