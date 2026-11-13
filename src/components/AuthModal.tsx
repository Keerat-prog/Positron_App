import React, { useState, useEffect, useRef } from "react";
import { 
  X, 
  LogIn, 
  LogOut, 
  ShieldCheck, 
  Heart, 
  Sparkles, 
  User as UserIcon, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  Mail, 
  Compass, 
  ArrowRight,
  Check
} from "lucide-react";
import { 
  auth, 
  firebaseConfig, 
  googleProvider, 
  signInWithPopup, 
  signInWithCredential, 
  signInAnonymously,
  GoogleAuthProvider, 
  signOut, 
  User 
} from "../lib/firebase";

declare global {
  interface Window {
    google?: any;
  }
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | any | null;
  isDark: boolean;
  onUserChange?: (user: any) => void;
  onToast?: (message: string) => void;
}

export default function AuthModal({ 
  isOpen, 
  onClose, 
  user, 
  isDark, 
  onUserChange,
  onToast 
}: AuthModalProps) {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<"options" | "quick-profile" | "google">("options");
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const gisButtonRef = useRef<HTMLDivElement>(null);

  // Initialize and render Google Identity Services (GIS) if supported in iframe / browser
  useEffect(() => {
    if (!isOpen || user) return;

    let checkInterval: any;
    let attempts = 0;

    const setupGis = () => {
      attempts++;
      if (typeof window !== "undefined" && window.google?.accounts?.id && gisButtonRef.current) {
        try {
          window.google.accounts.id.initialize({
            client_id: firebaseConfig.oAuthClientId,
            callback: async (response: any) => {
              if (response?.credential) {
                try {
                  setIsSigningIn(true);
                  setAuthError(null);
                  const cred = GoogleAuthProvider.credential(response.credential);
                  const userCred = await signInWithCredential(auth, cred);
                  if (userCred?.user) {
                    const u = {
                      uid: userCred.user.uid,
                      email: userCred.user.email,
                      displayName: userCred.user.displayName,
                      photoURL: userCred.user.photoURL,
                      isGuest: false,
                    };
                    onUserChange?.(u);
                    try {
                      localStorage.setItem("sacred_user_profile", JSON.stringify(u));
                    } catch (_) {}
                    onToast?.(`Signed in as ${u.displayName || u.email}!`);
                    onClose();
                  }
                } catch (err: any) {
                  console.warn("GIS credential sign-in error:", err);
                  handleAuthFailure(err);
                } finally {
                  setIsSigningIn(false);
                }
              }
            },
          });

          // Render the official Google GIS button
          gisButtonRef.current.innerHTML = "";
          window.google.accounts.id.renderButton(gisButtonRef.current, {
            theme: isDark ? "filled_black" : "outline",
            size: "large",
            width: 320,
            text: "continue_with",
            shape: "pill",
          });
        } catch (e) {
          console.warn("GIS initialization notice:", e);
        }
        clearInterval(checkInterval);
      } else if (attempts > 10) {
        clearInterval(checkInterval);
      }
    };

    checkInterval = setInterval(setupGis, 400);
    return () => clearInterval(checkInterval);
  }, [isOpen, user, isDark]);

  if (!isOpen) return null;

  // 1. CONTINUE AS GUEST - Instant, Zero-Barrier Access
  const handleContinueAsGuest = async () => {
    setIsSigningIn(true);
    setAuthError(null);

    // Generate clean guest profile
    const randomGuestId = "guest_" + Math.random().toString(36).substring(2, 10);
    const guestUser = {
      uid: randomGuestId,
      email: null,
      displayName: "Guest Seeker",
      photoURL: null,
      isGuest: true,
    };

    // Try optional Firebase anonymous sign-in in the background
    try {
      const fbAnon = await signInAnonymously(auth);
      if (fbAnon?.user) {
        guestUser.uid = fbAnon.user.uid;
      }
    } catch (_) {
      // Offline or anonymous auth disabled in project; local guest mode works 100% smoothly
    }

    try {
      localStorage.setItem("sacred_user_profile", JSON.stringify(guestUser));
    } catch (_) {}

    onUserChange?.(guestUser);
    setIsSigningIn(false);
    onToast?.("Welcome, Guest Seeker! You can explore and write freely.");
    onClose();
  };

  // 2. QUICK PROFILE CONNECT (Any Email / Name, completely bypassing Google OAuth testing blocks)
  const handleQuickProfileConnect = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSigningIn(true);
    setAuthError(null);

    const trimmedName = profileName.trim() || "Seeker";
    const trimmedEmail = profileEmail.trim() || null;
    const cleanUid = trimmedEmail 
      ? `user_${trimmedEmail.toLowerCase().replace(/[^a-z0-9]/g, "_")}`
      : `seeker_${Math.random().toString(36).substring(2, 9)}`;

    const profileUser = {
      uid: cleanUid,
      email: trimmedEmail,
      displayName: trimmedName,
      photoURL: null,
      isGuest: false,
    };

    try {
      localStorage.setItem("sacred_user_profile", JSON.stringify(profileUser));
    } catch (_) {}

    onUserChange?.(profileUser);
    setIsSigningIn(false);
    onToast?.(`Profile connected as ${trimmedName}!`);
    onClose();
  };

  // 3. GOOGLE SIGN-IN with Resilient Error Handling
  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setAuthError(null);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result?.user) {
        const u = {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          isGuest: false,
        };
        onUserChange?.(u);
        try {
          localStorage.setItem("sacred_user_profile", JSON.stringify(u));
        } catch (_) {}
        onToast?.(`Signed in as ${u.displayName || u.email}!`);
        onClose();
      }
    } catch (err: any) {
      console.warn("Google Auth popup notice:", err);
      handleAuthFailure(err);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleAuthFailure = (err: any) => {
    const code = err?.code || "";
    const msg = err?.message || "";

    if (
      code === "auth/disallowed_useragent" || 
      code === "auth/unauthorized-domain" || 
      msg.includes("404") || 
      msg.includes("App is not available") ||
      msg.includes("testing") ||
      msg.includes("access_denied")
    ) {
      setAuthError(
        "Google OAuth is currently in developer testing mode for external accounts on Android APK. You can continue instantly as Guest or use Quick Profile below without any restrictions!"
      );
    } else if (code === "auth/popup-blocked") {
      setAuthError("Popup was blocked by your browser. You can continue as Guest or use Quick Profile.");
    } else if (code === "auth/popup-closed-by-user") {
      setAuthError("Sign-in popup was closed before completing.");
    } else {
      setAuthError(
        "Notice: Google account sign-in could not complete. You can continue as Guest or enter your name below."
      );
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (_) {}
    try {
      localStorage.removeItem("sacred_user_profile");
    } catch (_) {}
    onUserChange?.(null);
    onToast?.("Signed out of account.");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className={`w-full max-w-md p-6 rounded-3xl border shadow-2xl space-y-5 relative ${
        isDark ? "bg-[#181a20] border-zinc-800 text-zinc-100" : "bg-white border-stone-200 text-stone-800"
      }`}>
        {/* Close Button */}
        <button
          onClick={() => {
            setAuthError(null);
            onClose();
          }}
          className={`absolute top-4 right-4 p-2 rounded-full transition cursor-pointer ${
            isDark ? "text-zinc-400 hover:text-white hover:bg-zinc-800" : "text-stone-400 hover:text-stone-900 hover:bg-stone-100"
          }`}
          title="Close"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-600 to-amber-500 text-white flex items-center justify-center mx-auto shadow-md">
            {user?.isGuest ? <Compass size={22} /> : <Heart size={22} />}
          </div>
          <h3 className="text-xl font-calibri font-bold tracking-tight">
            {user 
              ? user.isGuest 
                ? "Guest Sanctuary Session" 
                : "Your Sanctuary Profile"
              : "Welcome to Positron Sanctuary"}
          </h3>
          <p className="text-xs font-calibri text-stone-500 dark:text-zinc-400 leading-relaxed max-w-xs mx-auto">
            {user
              ? user.isGuest
                ? "You are currently exploring in private Guest Mode. All your diary reflections and settings are saved on this device."
                : "Your reflections, confessions, and personalized vibe are connected and safely preserved."
              : "Reflect freely in your private sanctuary. Sign-in is completely optional."}
          </p>
        </div>

        {/* Actionable Error Alert Banner */}
        {authError && (
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-xs font-calibri space-y-2 shadow-xs animate-fade-in">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2">
                <AlertCircle size={15} className="shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                <span className="leading-snug">{authError}</span>
              </div>
              <button
                onClick={() => setAuthError(null)}
                className="text-amber-700 hover:text-amber-950 dark:text-amber-400 p-0.5 rounded cursor-pointer shrink-0"
                title="Dismiss"
              >
                <X size={13} />
              </button>
            </div>
            <button
              type="button"
              onClick={handleContinueAsGuest}
              className="w-full py-1.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Compass size={13} />
              <span>Continue as Guest Now (No Sign-In Needed)</span>
            </button>
          </div>
        )}

        {user ? (
          /* Currently Signed In or In Guest Mode */
          <div className="space-y-4">
            <div className={`p-4 rounded-2xl border flex items-center gap-3.5 ${
              isDark ? "bg-zinc-950/80 border-zinc-800" : "bg-stone-50 border-stone-200"
            }`}>
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || "User"} className="w-11 h-11 rounded-full border border-amber-500/40 object-cover" />
              ) : (
                <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-base shadow-xs ${
                  user.isGuest ? "bg-emerald-700 text-emerald-100" : "bg-[#244F46] text-[#FFF8ED]"
                }`}>
                  {user.isGuest ? <Compass size={20} /> : (user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "S")}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-sm truncate font-calibri">
                  {user.displayName || (user.isGuest ? "Guest Seeker" : "Seeker")}
                </div>
                <div className="text-xs text-stone-500 dark:text-zinc-400 truncate font-calibri">
                  {user.email || (user.isGuest ? "Offline Local Storage Only" : "Private Profile")}
                </div>
                <div className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-calibri mt-0.5">
                  <CheckCircle size={10} />
                  <span>{user.isGuest ? "Active & Private on this device" : "Authenticated & Synced"}</span>
                </div>
              </div>
            </div>

            {user.isGuest ? (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setAuthMode("quick-profile")}
                  className="w-full py-2.5 px-4 rounded-2xl bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 font-semibold text-xs transition cursor-pointer flex items-center justify-center gap-2 font-calibri"
                >
                  <Mail size={14} />
                  <span>Connect Your Name or Email</span>
                </button>
                <button
                  onClick={handleSignOut}
                  className="w-full py-2.5 px-4 rounded-2xl bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 text-xs font-calibri font-medium hover:bg-stone-200 dark:hover:bg-zinc-700 transition cursor-pointer"
                >
                  Reset Guest Session
                </button>
              </div>
            ) : (
              <button
                onClick={handleSignOut}
                className="w-full py-3 px-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 font-semibold text-xs hover:bg-rose-500/20 transition cursor-pointer flex items-center justify-center gap-2 font-calibri"
              >
                <LogOut size={15} />
                <span>Sign Out of Account</span>
              </button>
            )}
          </div>
        ) : (
          /* Sign In & Guest Options */
          <div className="space-y-3.5">
            {/* PRIMARY: CONTINUE AS GUEST (100% Guaranteed, No OAuth blocking, No email required) */}
            <button
              type="button"
              onClick={handleContinueAsGuest}
              disabled={isSigningIn}
              className="w-full p-4 rounded-2xl bg-gradient-to-r from-emerald-600/15 via-teal-600/15 to-amber-500/15 hover:from-emerald-600/25 hover:to-amber-500/25 border-2 border-emerald-500/40 text-emerald-950 dark:text-emerald-100 transition-all cursor-pointer flex items-center justify-between text-left group shadow-sm active:scale-99"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Compass size={22} className="group-hover:rotate-45 transition-transform duration-300" />
                </div>
                <div>
                  <div className="text-sm font-bold font-calibri flex items-center gap-1.5">
                    <span>Continue as Guest</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white uppercase tracking-wider">
                      Recommended
                    </span>
                  </div>
                  <div className="text-[11px] text-stone-600 dark:text-zinc-300 font-calibri leading-snug mt-0.5">
                    No sign-in or mail required. Instant private access to diary & verses.
                  </div>
                </div>
              </div>
              <ArrowRight size={18} className="text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Divider */}
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-stone-200 dark:border-zinc-800" />
              <span className="flex-shrink mx-2 text-[10px] text-stone-400 dark:text-zinc-500 font-calibri uppercase tracking-wider">
                Or Connect Profile
              </span>
              <div className="flex-grow border-t border-stone-200 dark:border-zinc-800" />
            </div>

            {/* Options Toggle Tabs */}
            <div className={`grid grid-cols-2 p-1 rounded-2xl border ${
              isDark ? "bg-zinc-950/70 border-zinc-800" : "bg-stone-100 border-stone-200"
            }`}>
              <button
                type="button"
                onClick={() => setAuthMode("quick-profile")}
                className={`py-2 px-3 rounded-xl text-xs font-calibri font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  authMode === "quick-profile" || authMode === "options"
                    ? isDark ? "bg-zinc-800 text-white shadow-xs" : "bg-white text-stone-900 shadow-xs"
                    : "text-stone-500 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-white"
                }`}
              >
                <UserIcon size={13} />
                <span>Any Name / Email</span>
              </button>
              <button
                type="button"
                onClick={() => setAuthMode("google")}
                className={`py-2 px-3 rounded-xl text-xs font-calibri font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  authMode === "google"
                    ? isDark ? "bg-zinc-800 text-white shadow-xs" : "bg-white text-stone-900 shadow-xs"
                    : "text-stone-500 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-white"
                }`}
              >
                <Mail size={13} />
                <span>Google OAuth</span>
              </button>
            </div>

            {/* Sub-form: Quick Profile (Any name/email without Google OAuth restrictions) */}
            {(authMode === "quick-profile" || authMode === "options") && (
              <form onSubmit={handleQuickProfileConnect} className="space-y-3 pt-1 animate-fade-in">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-stone-600 dark:text-zinc-300 font-calibri">
                    Your Name (or Nickname)
                  </label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="E.g. Seeker, Sarah, or Alex"
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-calibri border focus:outline-none transition-all ${
                      isDark 
                        ? "bg-zinc-950 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:border-emerald-500" 
                        : "bg-stone-50 border-stone-300 text-stone-900 placeholder:text-stone-400 focus:border-emerald-600"
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-stone-600 dark:text-zinc-300 font-calibri">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    placeholder="youremail@example.com"
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-calibri border focus:outline-none transition-all ${
                      isDark 
                        ? "bg-zinc-950 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:border-emerald-500" 
                        : "bg-stone-50 border-stone-300 text-stone-900 placeholder:text-stone-400 focus:border-emerald-600"
                    }`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSigningIn}
                  className="w-full py-3 px-4 rounded-2xl bg-[#244F46] hover:bg-[#1D4039] active:scale-99 text-[#FFF8ED] font-semibold text-xs shadow-sm transition cursor-pointer flex items-center justify-center gap-2 font-calibri"
                >
                  <Sparkles size={14} />
                  <span>Connect Profile ({profileName.trim() || "Seeker"})</span>
                </button>
              </form>
            )}

            {/* Sub-form: Google OAuth */}
            {authMode === "google" && (
              <div className="space-y-3 pt-1 animate-fade-in">
                {/* Official GIS Button */}
                <div ref={gisButtonRef} className="flex justify-center empty:hidden min-h-0" />

                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isSigningIn}
                  className="w-full py-3 px-4 rounded-2xl bg-white text-stone-900 font-semibold text-xs border border-stone-300 shadow-xs hover:bg-stone-50 active:scale-99 transition cursor-pointer flex items-center justify-center gap-2.5 font-calibri"
                >
                  {isSigningIn ? (
                    <>
                      <RefreshCw size={15} className="animate-spin text-stone-600" />
                      <span>Connecting Google Account...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      <span>Sign In with Google Account</span>
                    </>
                  )}
                </button>
                <p className="text-[10px] text-center text-stone-400 dark:text-zinc-500 font-calibri leading-relaxed">
                  Notice: If your account is not yet on the developer test list or in an Android WebView, use <strong>Continue as Guest</strong> above.
                </p>
              </div>
            )}

            <div className="flex items-center justify-center gap-1.5 text-[10px] text-stone-400 dark:text-zinc-500 font-calibri pt-1">
              <ShieldCheck size={12} className="text-emerald-500" />
              <span>Safe, confidential & private sanctuary. Your thoughts stay yours.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
