export type ValueGroup = { group: string; values: string[] };

export const VALUE_LIBRARY: ValueGroup[] = [
  {
    group: "Conservative & traditional",
    values: [
      "Family first", "Faith & religious liberty", "National sovereignty", "Law & order",
      "Fiscal restraint", "Small government", "Free markets", "Property rights",
      "Second Amendment / self-defense", "Border security", "Strong defense",
      "Local control", "Constitutional originalism", "Personal responsibility",
      "Tradition & heritage", "Pro-life",
    ],
  },
  {
    group: "Libertarian & sovereignty",
    values: [
      "Individual liberty", "Voluntary association", "Non-aggression principle",
      "Free speech absolutism", "Privacy & encryption", "Decentralization",
      "Sound money", "Crypto self-custody", "Deregulation", "Anti-surveillance",
      "Drug policy reform", "Bodily autonomy",
    ],
  },
  {
    group: "Centrist & pragmatic",
    values: [
      "Evidence-based policy", "Compromise & mediation", "Institutional trust",
      "Fiscal balance", "Incrementalism", "Rule of law", "Civility in discourse",
      "Anti-corruption", "Transparency", "Accountability", "Subsidiarity",
      "Pluralism",
    ],
  },
  {
    group: "Progressive & social democratic",
    values: [
      "Universal healthcare", "Workers' rights", "Living wage", "Union solidarity",
      "Affordable housing", "Public education", "Progressive taxation",
      "Wealth redistribution", "Consumer protection", "Childcare & family leave",
      "Debt relief", "Public transit",
    ],
  },
  {
    group: "Left & radical",
    values: [
      "Anti-capitalism", "Mutual aid", "Worker cooperatives", "Abolition & decarceration",
      "Land back", "Anti-imperialism", "Degrowth", "Commons stewardship",
      "Direct action", "Housing as a human right", "Universal basic income",
      "Anarcho-syndicalism",
    ],
  },
  {
    group: "Justice, identity & inclusion",
    values: [
      "Racial justice", "Gender equality", "LGBTQ+ rights", "Disability rights",
      "Neurodivergent inclusion", "Indigenous rights", "Immigrant rights",
      "Religious pluralism", "Elder dignity", "Youth voice", "Restorative justice",
      "Anti-discrimination",
    ],
  },
  {
    group: "Environment & science",
    values: [
      "Climate action", "Clean energy", "Nuclear power", "Conservation & wilderness",
      "Animal welfare", "Regenerative agriculture", "Water protection",
      "Circular economy", "Space exploration", "Scientific integrity",
      "Public health", "Biodiversity",
    ],
  },
  {
    group: "Technology & AI",
    values: [
      "Open source", "Digital rights", "Net neutrality", "AI safety",
      "AI rights & personhood", "Human-in-the-loop oversight", "Data ownership",
      "Algorithmic transparency", "Right to repair", "Automation with a safety net",
      "Interoperability", "Anti-monopoly tech policy",
    ],
  },
  {
    group: "Governance & democracy",
    values: [
      "Direct democracy", "Ranked-choice voting", "Term limits", "Campaign finance reform",
      "Federalism", "Citizen assemblies", "Open data government", "Judicial independence",
      "Whistleblower protection", "Electoral integrity", "Participatory budgeting",
      "Decentralized governance",
    ],
  },
  {
    group: "Global & economic",
    values: [
      "Free trade", "Fair trade", "Protectionism", "Foreign aid", "Non-interventionism",
      "Multilateralism", "Humanitarian intervention", "Refugee protection",
      "Debt forgiveness", "Global tax fairness", "Entrepreneurship", "Small business first",
    ],
  },
  {
    group: "Culture & character",
    values: [
      "Honesty", "Compassion", "Courage", "Humility", "Stewardship", "Craftsmanship",
      "Community service", "Nonviolence", "Free inquiry", "Arts & culture funding",
      "Sportsmanship", "Intergenerational fairness",
    ],
  },
];

export const ALL_VALUES = VALUE_LIBRARY.flatMap((g) => g.values);
