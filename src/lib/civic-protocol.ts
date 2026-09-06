/**
 * CIVIC Protocol identity + sync adapter.
 *
 * Today this runs purely locally: every profile gets a deterministic DID and
 * every save produces a canonical, hashable "profile document". When the
 * network node is live, only `pushProfileDocument` needs a real transport
 * (HTTP/IPFS) — every call site stays unchanged.
 */
import { sha256Hex } from "@/lib/hash";

export const DID_METHOD = "did:civic";

export function makeDid(userId: string): string {
  return `${DID_METHOD}:${userId}`;
}

export interface ProfileDocumentInput {
  userId: string;
  username: string | null;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  city: string | null;
  country: string | null;
  values: string[];
  walletAddress: string | null;
  version: number;
}

export interface ProfileDocument {
  did: string;
  type: "CivicProfile";
  version: number;
  node: string;
  profile: Omit<ProfileDocumentInput, "userId" | "version">;
  issuedAt: string;
  contentHash: string;
}

/** Canonical (key-sorted) JSON so hashes match across nodes. */
function canonical(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  const obj = value as Record<string, unknown>;
  return `{${Object.keys(obj)
    .sort()
    .map((k) => `${JSON.stringify(k)}:${canonical(obj[k])}`)
    .join(",")}}`;
}

export async function buildProfileDocument(input: ProfileDocumentInput): Promise<ProfileDocument> {
  const { userId, version, ...profile } = input;
  const body = {
    did: makeDid(userId),
    type: "CivicProfile" as const,
    version,
    node: "civil.quest",
    profile,
    issuedAt: new Date().toISOString(),
  };
  return { ...body, contentHash: await sha256Hex(canonical(body)) };
}

/**
 * Transport stub. Replace the body with a POST to the CIVIC Protocol node
 * (and/or an IPFS pin) once the endpoint exists — signature stays the same.
 */
export async function pushProfileDocument(
  doc: ProfileDocument,
): Promise<{ ok: boolean; pending: boolean; contentHash: string }> {
  if (typeof console !== "undefined") {
    console.info("[CIVIC Protocol] profile document queued", doc.did, doc.contentHash);
  }
  return { ok: true, pending: true, contentHash: doc.contentHash };
}
