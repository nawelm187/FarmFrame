/** Turns the account service's English errors into something the person can act on. Unknown errors are shown as they are. */
export function authMessage(raw: string): string {
  if (/invalid login credentials/i.test(raw)) return "Wrong email or password. If you created this account with an email link it has no password yet: use \"Set or reset my password\" below.";
  if (/email not confirmed/i.test(raw)) return "This email is not confirmed yet. Open the confirmation email, or use \"Email me a sign-in link\".";
  if (/already registered|already exists/i.test(raw)) return "That email already has an account. Sign in with its password, or use \"Set or reset my password\" below.";
  if (/rate limit|too many|security purposes/i.test(raw)) return "Too many emails were requested. Wait a minute and try again.";
  if (/password should be at least|weak password/i.test(raw)) return "The password is too short. Use 6 characters or more.";
  return raw;
}
