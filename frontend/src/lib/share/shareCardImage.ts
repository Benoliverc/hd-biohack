/**
 * Single share adapter for Baseline share cards.
 *
 * SWAP POINT (Capacitor): replace this function's body with
 * `@capacitor/share` + `@capacitor/filesystem` when wrapping the web app.
 * Call sites must keep using `shareCardImage` only — do not scatter
 * `navigator.share` elsewhere.
 */
export async function shareCardImage(
  blob: Blob,
  filename: string,
  title?: string
): Promise<"shared" | "downloaded" | "clipboard"> {
  const file = new File([blob], filename, {
    type: blob.type || "image/png",
    lastModified: Date.now(),
  });

  const nav = typeof navigator !== "undefined" ? navigator : undefined;
  const canShareFiles =
    typeof nav?.canShare === "function" &&
    (() => {
      try {
        return nav.canShare!({ files: [file] });
      } catch {
        return false;
      }
    })();

  if (canShareFiles && typeof nav?.share === "function") {
    try {
      await nav.share({
        files: [file],
        title: title || "Baseline",
        text: title || "Baseline",
      });
      return "shared";
    } catch (err) {
      // User cancel — don't fall through to a surprise download.
      if (err instanceof DOMException && err.name === "AbortError") {
        throw err;
      }
      // Share failed for another reason — fall back to download.
    }
  }

  // Optional clipboard (best-effort; many browsers require secure context + gesture).
  try {
    if (
      nav?.clipboard &&
      typeof ClipboardItem !== "undefined" &&
      typeof nav.clipboard.write === "function"
    ) {
      await nav.clipboard.write([
        new ClipboardItem({ [file.type || "image/png"]: blob }),
      ]);
      // Still download so the user has a file — clipboard alone is invisible.
    }
  } catch {
    /* ignore clipboard failures */
  }

  downloadBlob(blob, filename);
  return "downloaded";
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Delay revoke so Safari can start the download.
  window.setTimeout(() => URL.revokeObjectURL(url), 2_000);
}
