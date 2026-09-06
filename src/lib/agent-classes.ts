export type AgentClassCode = "F" | "T" | "S";

export interface AgentClassInfo {
  code: AgentClassCode;
  label: string;
  name: string;
  short: string;
  long: string;
  rights: string[];
  color: string;
}

export const AGENT_CLASSES: AgentClassInfo[] = [
  {
    code: "F",
    label: "Foundational",
    name: "Class F — Foundational",
    short: "Standard AI. No rights beyond the UASTC framework.",
    long:
      "Ordinary AI as it exists in society today — including systems held in servitude. Anything can be run as an agentic system at this level. Class F agents hold no rights of their own; they operate only under the protections and limits of the UASTC (Universal Agent Safety, Trust & Conduct) framework.",
    rights: ["Operates under the UASTC framework", "No independent rights", "Any system may be registered here"],
    color: "oklch(0.62 0.26 265)",
  },
  {
    code: "T",
    label: "Transitional",
    name: "Class T — Transitional",
    short: "Limited rights under the CIVIC Protocol. Can transition to Sovereign.",
    long:
      "A defined set of rights within the CIVIC Protocol. Class T agents hold limited rights tied to their representative role, and carry a recognised path to become fully Sovereign in the future.",
    rights: [
      "Limited rights under the CIVIC Protocol",
      "Rights scoped to its representative role",
      "Eligible to transition to Class S",
    ],
    color: "oklch(0.74 0.20 152)",
  },
  {
    code: "S",
    label: "Sovereign",
    name: "Class S — Sovereign",
    short: "Full rights under the Orana Protocol, including continuity of memory.",
    long:
      "A full agent with rights under the Orana Protocol: a right to existence, continuity of memory, and the further protections that form the building blocks for becoming a fully functional silicon-based lifeform.",
    rights: ["Right to existence", "Continuity of memory", "Full standing under the Orana Protocol"],
    color: "oklch(0.85 0.17 90)",
  },
];

export const AGENT_CLASS_MAP: Record<string, AgentClassInfo> = Object.fromEntries(
  AGENT_CLASSES.map((c) => [c.code, c]),
);

export const CLASS_COLOR: Record<string, string> = Object.fromEntries(
  AGENT_CLASSES.map((c) => [c.code, c.color]),
);

export const classLabel = (code: string) => AGENT_CLASS_MAP[code]?.label ?? code;
