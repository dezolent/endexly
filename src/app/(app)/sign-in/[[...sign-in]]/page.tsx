import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      {/*
       * fallbackRedirectUrl: where to go after sign-in when Clerk has no
       * explicit redirect_url (e.g., user navigated directly to /sign-in).
       * When middleware redirects here via auth.protect(), Clerk appends
       * redirect_url automatically and that takes precedence over this.
       */}
      <SignIn fallbackRedirectUrl="/admin" />
    </div>
  );
}
