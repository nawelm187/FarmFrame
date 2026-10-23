import { t } from "../i18n";
/** Turns the account service's English errors into something the person can act on. Unknown errors are shown as they are. */
export function authMessage(raw: string): string {
  if (/invalid login credentials/i.test(raw)) return t("amWrong", { reset: t("prReset") });
  if (/email not confirmed/i.test(raw)) return t("amNotConfirmed", { link: t("prLink") });
  if (/already registered|already exists/i.test(raw)) return t("amExists", { reset: t("prReset") });
  if (/rate limit|too many|security purposes/i.test(raw)) return t("amRate");
  if (/password should be at least|weak password/i.test(raw)) return t("amShort");
  return raw;
}
