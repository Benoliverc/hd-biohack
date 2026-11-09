"use client";

import { useI18n, type MessageKey } from "@/lib/i18n";

const SECTIONS: { title: MessageKey; body: MessageKey }[] = [
  { title: "privacy.storeTitle", body: "privacy.storeBody" },
  { title: "privacy.useTitle", body: "privacy.useBody" },
  { title: "privacy.emailsTitle", body: "privacy.emailsBody" },
  { title: "privacy.choicesTitle", body: "privacy.choicesBody" },
];

export default function PrivacyPage() {
  const { t } = useI18n();

  return (
    <div className="mx-auto max-w-prose space-y-6" data-testid="privacy-page">
      <h1 className="type-title text-fg">{t("privacy.title")}</h1>
      <p className="type-body text-fg-secondary">{t("privacy.intro")}</p>

      {SECTIONS.map(({ title, body }) => (
        <section key={title} className="space-y-1.5">
          <h2 className="type-body font-medium text-fg">{t(title)}</h2>
          <p className="type-body text-fg-secondary">{t(body)}</p>
        </section>
      ))}

      <p className="type-caption text-fg-muted" data-testid="privacy-hd-note">
        {t("privacy.hdNote")}
      </p>

      <div className="space-y-1.5 border-t border-border/60 pt-4">
        <p className="type-caption text-fg-muted" data-testid="privacy-copyright">
          {t("privacy.copyright")}
        </p>
        <p className="type-caption text-fg-muted" data-testid="privacy-disclaimer">
          {t("home.trust.disclaimer")}
        </p>
      </div>
    </div>
  );
}
