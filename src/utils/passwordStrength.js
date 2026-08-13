// Checks a password against a basic "strong password" policy. Returns an
// error message describing the first unmet requirement, or null if the
// password is strong enough. Used on signup and password-reset forms.
export function getPasswordStrengthError(password) {
  if (password.length < 8) {
    return "Password must be at least 8 characters long.";
  }
  if (!/[a-z]/.test(password)) {
    return "Password must include at least one lowercase letter.";
  }
  if (!/[A-Z]/.test(password)) {
    return "Password must include at least one uppercase letter.";
  }
  if (!/[0-9]/.test(password)) {
    return "Password must include at least one number.";
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return "Password must include at least one special character (e.g. !@#$%).";
  }
  return null;
}
