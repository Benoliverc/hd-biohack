import type { MessageKey } from "@/lib/i18n";

export function accountApiMessage(message: string, t: (key: MessageKey) => string) {
  if (message === "Choose a different password.") return t("settings.chooseDifferentPassword");
  if (message === "Type your account email to confirm.") return t("settings.deleteConfirmMismatch");
  if (
    message === "Password must be at least 8 characters" ||
    message === "Password must be at least 8 characters."
  ) {
    return t("login.passwordTooShort");
  }
  if (message.includes("Email or password") || /didn['’]t work/i.test(message)) {
    return t("login.genericAuthError");
  }
  return message;
}
