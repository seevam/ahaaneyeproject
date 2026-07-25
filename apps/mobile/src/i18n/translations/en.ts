const en = {
  // ── Welcome screen ────────────────────────────────────────────────────────
  welcome: {
    tagline: 'Impact an Eye Every Day',
    subtitle: 'Your daily eye medication reminders,\nmade simple and reliable.',
    getStarted: 'Get Started',
    alreadyHaveAccount: 'Already have an account?',
    signIn: 'Sign In',
  },

  // ── Login screen ──────────────────────────────────────────────────────────
  login: {
    title: 'Welcome Back',
    subtitle: 'Enter your phone number to sign in',
    phonePlaceholder: 'Phone number',
    signInButton: 'Sign In',
    // Errors
    errorPhone: 'Please enter your phone number',
    errorFailed: 'Sign In Failed',
    errorDefault: 'Please check your phone number and try again',
    noAccountTitle: 'No Account Found',
    noAccountMessage: "We couldn't find an account for this number. Please sign up first.",
    // Footer
    noAccount: "Don't have an account?",
    signUp: 'Sign Up',
    continueAsGuest: 'Continue as Guest',
  },

  // ── Signup screen ─────────────────────────────────────────────────────────
  signup: {
    title: 'Create Account',
    subtitle: 'Enter your name and phone number to get started',
    namePlaceholder: 'Full name',
    phonePlaceholder: 'Phone number',
    createButton: 'Create Account',
    alreadyHaveAccount: 'Already have an account?',
    signIn: 'Sign In',
    // Errors
    errorName: 'Please enter your name',
    errorPhone: 'Please enter your phone number',
    errorFailed: 'Sign Up Failed',
    errorDefault: 'Please try again',
  },

  // ── Common ────────────────────────────────────────────────────────────────
  common: {
    error: 'Error',
    ok: 'OK',
    loading: 'Loading...',
  },
} as const;

export type TranslationKeys = typeof en;
export default en;
