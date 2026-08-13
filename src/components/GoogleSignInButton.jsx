import { supabase } from "../supabase/supabaseClient";

// "Continue with Google" - used on both the login and signup pages, since
// Google OAuth creates the account automatically on first use, so there's
// no separate "sign up" step for it. Kept as a plain white/bordered button
// rather than a BrickButton, since Google's brand guidelines call for a
// neutral button style rather than a custom color.
export default function GoogleSignInButton() {
  async function handleClick() {
    // Redirects the whole page to Google's consent screen. On success,
    // Google sends the browser back to redirectTo with a session Supabase
    // picks up automatically - App.jsx's existing session listener then
    // just sees a new logged-in user, same as any other login method.
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) alert(error.message);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="w-full flex items-center justify-center gap-3 px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 font-semibold hover:bg-gray-50 transition"
    >
      <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="#4285F4"
          d="M23.52 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.66Z"
        />
        <path
          fill="#34A853"
          d="M12 24c3.24 0 5.95-1.07 7.93-2.9l-3.88-3c-1.08.72-2.46 1.15-4.05 1.15-3.11 0-5.75-2.1-6.69-4.92H1.3v3.09A12 12 0 0 0 12 24Z"
        />
        <path
          fill="#FBBC05"
          d="M5.31 14.33A7.2 7.2 0 0 1 4.93 12c0-.81.14-1.6.38-2.33V6.58H1.3A12 12 0 0 0 0 12c0 1.94.46 3.77 1.3 5.42l4.01-3.09Z"
        />
        <path
          fill="#EA4335"
          d="M12 4.75c1.76 0 3.34.6 4.58 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.3 6.58l4.01 3.09C6.25 6.85 8.89 4.75 12 4.75Z"
        />
      </svg>
      Continue with Google
    </button>
  );
}
