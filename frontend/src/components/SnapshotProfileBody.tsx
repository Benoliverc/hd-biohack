import { profilePresentation } from "@/lib/profilePresentation";

export function SnapshotProfileBody({ profile, copy }: { profile: string; copy: string }) {
  const { sections } = profilePresentation(profile, copy);
  return (
    <div className="type-body text-fg-secondary" data-testid="snapshot-profile-copy">
      {sections.length ? sections.map(({ name, brief }, index) => (
        <div key={`${index}:${name}`} className={index ? "mt-3" : undefined}>
          <h3 className="font-semibold">{name}</h3>
          <p className="mt-1 font-normal">{brief}</p>
        </div>
      )) : <p className="font-normal whitespace-pre-line">{copy}</p>}
    </div>
  );
}
