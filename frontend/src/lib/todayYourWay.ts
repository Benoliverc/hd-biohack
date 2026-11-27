import {
  normalizeAuthorityClass,
  normalizeHdType,
} from "@/lib/eveningSignatureClose";
import type { MessageKey } from "@/lib/i18n/messages";

const TYPE_KEY = {
  Generator: "today.yourWay.type.generator",
  "Manifesting Generator": "today.yourWay.type.manifestingGenerator",
  Manifestor: "today.yourWay.type.manifestor",
  Projector: "today.yourWay.type.projector",
  Reflector: "today.yourWay.type.reflector",
} as const satisfies Record<string, MessageKey>;

const AUTHORITY_KEY = {
  sacral: "today.yourWay.authority.sacral",
  emotional: "today.yourWay.authority.emotional",
  splenic: "today.yourWay.authority.splenic",
  ego: "today.yourWay.authority.ego",
  selfProjected: "today.yourWay.authority.selfProjected",
  mental: "today.yourWay.authority.mental",
  lunar: "today.yourWay.authority.lunar",
} as const satisfies Record<string, MessageKey>;

/** Natal Type + Authority keys for the one-sentence "Your way today" line. Null when Type is unrecognized. */
export function yourWayKeys(
  type: string | null | undefined,
  authority: string | null | undefined
): { typeKey: MessageKey; authorityKey: MessageKey | null } | null {
  const hdType = normalizeHdType(type);
  if (!hdType) return null;
  const authorityClass = normalizeAuthorityClass(authority);
  return {
    typeKey: TYPE_KEY[hdType],
    authorityKey: authorityClass ? AUTHORITY_KEY[authorityClass] : null,
  };
}
