/**
 * Deep dive essay body for Profile and Channel essays. A block is split on blank
 * lines. A non-first block whose first line is short (≤ 60 chars) and does not end
 * in . ! or ? is a section: that line becomes an h3, the rest a paragraph. Same
 * markup as the Type row sections.
 */
export function DeepDiveEssayBody({ text }: { text: string }) {
  const blocks = text.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  return (
    <>
      {blocks.map((block, i) => {
        const nl = block.indexOf("\n");
        const first = nl === -1 ? block : block.slice(0, nl);
        if (i > 0 && nl !== -1 && first.length <= 60 && !/[.!?]$/.test(first)) {
          return (
            <section key={i} className="mt-3">
              <h3 className="font-semibold">{first.replace(/:$/, "")}</h3>
              <p className="mt-1 font-normal">{block.slice(nl + 1).trim()}</p>
            </section>
          );
        }
        return (
          <p key={i} className={i === 0 ? "text-fg" : "mt-3"}>
            {block}
          </p>
        );
      })}
    </>
  );
}
