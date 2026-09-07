/**
 * The CIVIC Protocol constituent catalog: every category, type and group that
 * can be activated as a TONDO on this node. Reference data, kept in the repo so
 * the catalog is available even before anything is activated.
 * The protocol only syncs *activated* constituent groups; this list is local.
 */
export type CatalogEntry = {
  key: string;
  master_category: string;
  group_type: string | null;
  scope: "category" | "type" | "entry";
  name: string;
  description: string | null;
  examples: string[];
  sort: number;
};

export const CONSTITUENT_CATALOG: CatalogEntry[] = [
  {
    "key": "geo",
    "master_category": "Geographic & Physical",
    "group_type": null,
    "scope": "category",
    "name": "Geographic & Physical",
    "description": "Places, waters, landforms and planetary regions represented as constituencies.",
    "examples": [],
    "sort": 10
  },
  {
    "key": "geo.continents",
    "master_category": "Geographic & Physical",
    "group_type": "Continents",
    "scope": "type",
    "name": "Continents",
    "description": "Each continent represented as a constituency of its peoples, lands and systems.",
    "examples": [
      "Africa",
      "Asia",
      "Europe",
      "North America",
      "South America",
      "Oceania",
      "Antarctica"
    ],
    "sort": 11
  },
  {
    "key": "geo.countries",
    "master_category": "Geographic & Physical",
    "group_type": "Countries & Territories",
    "scope": "type",
    "name": "Countries & Territories",
    "description": "Sovereign states, territories, autonomous regions and Indigenous territories.",
    "examples": [],
    "sort": 12
  },
  {
    "key": "geo.regions",
    "master_category": "Geographic & Physical",
    "group_type": "Regions",
    "scope": "type",
    "name": "Regions",
    "description": "Cross-border regions such as the Middle East, Caribbean, South Asia, the Arctic.",
    "examples": [],
    "sort": 13
  },
  {
    "key": "geo.local",
    "master_category": "Geographic & Physical",
    "group_type": "Local Communities",
    "scope": "type",
    "name": "Local Communities",
    "description": "Cities, towns, villages, suburbs, rural and remote settlements.",
    "examples": [],
    "sort": 14
  },
  {
    "key": "geo.waters",
    "master_category": "Geographic & Physical",
    "group_type": "Waters",
    "scope": "type",
    "name": "Waters",
    "description": "Oceans, seas, rivers, lakes, wetlands, aquifers and estuaries.",
    "examples": [],
    "sort": 15
  },
  {
    "key": "geo.landforms",
    "master_category": "Geographic & Physical",
    "group_type": "Landforms",
    "scope": "type",
    "name": "Landforms",
    "description": "Mountains, deserts, forests, islands, coastlines, plains and valleys.",
    "examples": [],
    "sort": 16
  },
  {
    "key": "geo.climate",
    "master_category": "Geographic & Physical",
    "group_type": "Climate Zones",
    "scope": "type",
    "name": "Climate Zones",
    "description": "Tropical, arid, temperate, continental, polar and alpine zones.",
    "examples": [],
    "sort": 17
  },
  {
    "key": "geo.planetary",
    "master_category": "Geographic & Physical",
    "group_type": "Tectonic / Planetary Regions",
    "scope": "type",
    "name": "Tectonic & Planetary Regions",
    "description": "Tectonic plates, volcanic zones, seismic regions and watersheds.",
    "examples": [],
    "sort": 18
  },
  {
    "key": "eco",
    "master_category": "Ecological & Biological",
    "group_type": null,
    "scope": "category",
    "name": "Ecological & Biological",
    "description": "Ecosystems, biomes, species and the living systems of Earth.",
    "examples": [],
    "sort": 20
  },
  {
    "key": "eco.ecosystems",
    "master_category": "Ecological & Biological",
    "group_type": "Ecosystems",
    "scope": "type",
    "name": "Ecosystems",
    "description": "Forests, grasslands, wetlands, coral reefs, tundra, mangroves, kelp forests.",
    "examples": [],
    "sort": 21
  },
  {
    "key": "eco.biomes",
    "master_category": "Ecological & Biological",
    "group_type": "Biomes",
    "scope": "type",
    "name": "Biomes",
    "description": "Marine, freshwater, desert, rainforest, boreal and subterranean biomes.",
    "examples": [],
    "sort": 22
  },
  {
    "key": "eco.species",
    "master_category": "Ecological & Biological",
    "group_type": "Species Groups",
    "scope": "type",
    "name": "Species Groups",
    "description": "Mammals, birds, reptiles, amphibians, fish, insects, plants, fungi, microbes.",
    "examples": [],
    "sort": 23
  },
  {
    "key": "eco.migrating",
    "master_category": "Ecological & Biological",
    "group_type": "Migrating Animals",
    "scope": "type",
    "name": "Migrating Animals",
    "description": "Birds, whales, fish, butterflies, caribou, sea turtles and migratory herds.",
    "examples": [],
    "sort": 24
  },
  {
    "key": "eco.trophic",
    "master_category": "Ecological & Biological",
    "group_type": "Trophic Roles",
    "scope": "type",
    "name": "Trophic Roles",
    "description": "Producers, consumers, decomposers, pollinators and apex predators.",
    "examples": [],
    "sort": 25
  },
  {
    "key": "eco.conservation",
    "master_category": "Ecological & Biological",
    "group_type": "Conservation Status",
    "scope": "type",
    "name": "Conservation Status",
    "description": "Endangered, critically endangered, vulnerable, invasive and keystone species.",
    "examples": [],
    "sort": 26
  },
  {
    "key": "eco.habitats",
    "master_category": "Ecological & Biological",
    "group_type": "Habitat Types",
    "scope": "type",
    "name": "Habitat Types",
    "description": "Terrestrial, marine, freshwater, aerial and subterranean habitats.",
    "examples": [],
    "sort": 27
  },
  {
    "key": "bio",
    "master_category": "Biological Architecture",
    "group_type": null,
    "scope": "category",
    "name": "Biological Architecture",
    "description": "Lineages, microbial ecologies and symbiotic relationships.",
    "examples": [],
    "sort": 30
  },
  {
    "key": "bio.genetic",
    "master_category": "Biological Architecture",
    "group_type": "Genetic / Ancestral Groups",
    "scope": "type",
    "name": "Genetic & Ancestral Groups",
    "description": "Genetic lineages, haplogroups and descendants of historical populations.",
    "examples": [],
    "sort": 31
  },
  {
    "key": "bio.micro",
    "master_category": "Biological Architecture",
    "group_type": "Micro-Biological Groups",
    "scope": "type",
    "name": "Micro-Biological Groups",
    "description": "Gut biomes, bacteria, viruses, cellular systems and microbial ecologies.",
    "examples": [],
    "sort": 32
  },
  {
    "key": "bio.symbiotic",
    "master_category": "Biological Architecture",
    "group_type": "Symbiotic Links",
    "scope": "type",
    "name": "Symbiotic Links",
    "description": "Companion species, domesticated animals and pollinator-farmer networks.",
    "examples": [],
    "sort": 33
  },
  {
    "key": "age",
    "master_category": "Human Age & Generation",
    "group_type": null,
    "scope": "category",
    "name": "Human Age & Generation",
    "description": "Life stages, age bands, birth decades and identity epochs.",
    "examples": [],
    "sort": 40
  },
  {
    "key": "age.stages",
    "master_category": "Human Age & Generation",
    "group_type": "Life Stages",
    "scope": "type",
    "name": "Life Stages",
    "description": "Infants, children, teens, young adults, adults and elders.",
    "examples": [],
    "sort": 41
  },
  {
    "key": "age.bands",
    "master_category": "Human Age & Generation",
    "group_type": "10-Year Age Bands",
    "scope": "type",
    "name": "10-Year Age Bands",
    "description": "0–9 through 90+, each decade of life as its own constituency.",
    "examples": [],
    "sort": 42
  },
  {
    "key": "age.decades",
    "master_category": "Human Age & Generation",
    "group_type": "Birth Decades",
    "scope": "type",
    "name": "Birth Decades",
    "description": "1920s-born through 2020s-born cohorts.",
    "examples": [],
    "sort": 43
  },
  {
    "key": "age.epochs",
    "master_category": "Human Age & Generation",
    "group_type": "Identity Epochs",
    "scope": "type",
    "name": "Identity Epochs",
    "description": "Pre-internet generations, digital natives, post-AI generations, SBL birth epochs.",
    "examples": [],
    "sort": 44
  },
  {
    "key": "identity",
    "master_category": "Human Identity",
    "group_type": null,
    "scope": "category",
    "name": "Human Identity",
    "description": "Ethnicity, nationality, language, faith, gender and orientation.",
    "examples": [],
    "sort": 50
  },
  {
    "key": "identity.ethnic",
    "master_category": "Human Identity",
    "group_type": "Ethnic / Racial Groups",
    "scope": "type",
    "name": "Ethnic & Racial Groups",
    "description": "Indigenous peoples, Black, Asian, Latino, Pacific Islander and multiracial communities.",
    "examples": [],
    "sort": 51
  },
  {
    "key": "identity.nationalities",
    "master_category": "Human Identity",
    "group_type": "Nationalities",
    "scope": "type",
    "name": "Nationalities",
    "description": "Citizens and nationals of all countries.",
    "examples": [],
    "sort": 52
  },
  {
    "key": "identity.languages",
    "master_category": "Human Identity",
    "group_type": "Languages",
    "scope": "type",
    "name": "Languages",
    "description": "Major world languages and endangered-language communities.",
    "examples": [],
    "sort": 53
  },
  {
    "key": "identity.religions",
    "master_category": "Human Identity",
    "group_type": "Religions / Spiritual Traditions",
    "scope": "type",
    "name": "Religions & Spiritual Traditions",
    "description": "Christian, Muslim, Jewish, Hindu, Buddhist, Sikh, Indigenous spiritual and secular.",
    "examples": [],
    "sort": 54
  },
  {
    "key": "identity.gender",
    "master_category": "Human Identity",
    "group_type": "Gender Identity",
    "scope": "type",
    "name": "Gender Identity",
    "description": "Women, men, nonbinary people, transgender people, Two-Spirit people.",
    "examples": [],
    "sort": 55
  },
  {
    "key": "identity.orientation",
    "master_category": "Human Identity",
    "group_type": "Sexual Orientation",
    "scope": "type",
    "name": "Sexual Orientation",
    "description": "Straight, gay, lesbian, bisexual, pansexual, asexual and queer people.",
    "examples": [],
    "sort": 56
  },
  {
    "key": "status",
    "master_category": "Human Status",
    "group_type": null,
    "scope": "category",
    "name": "Human Status",
    "description": "Migration, work, housing, care and education circumstances.",
    "examples": [],
    "sort": 60
  },
  {
    "key": "status.migration",
    "master_category": "Human Status",
    "group_type": "Migration Status",
    "scope": "type",
    "name": "Migration Status",
    "description": "Migrants, refugees, asylum seekers, stateless, undocumented and diaspora people.",
    "examples": [],
    "sort": 61
  },
  {
    "key": "status.employment",
    "master_category": "Human Status",
    "group_type": "Employment Status",
    "scope": "type",
    "name": "Employment Status",
    "description": "Employed, unemployed, underemployed, gig, informal and retired workers.",
    "examples": [],
    "sort": 62
  },
  {
    "key": "status.housing",
    "master_category": "Human Status",
    "group_type": "Housing Status",
    "scope": "type",
    "name": "Housing Status",
    "description": "Renters, homeowners, unhoused, displaced and communal housing members.",
    "examples": [],
    "sort": 63
  },
  {
    "key": "status.family",
    "master_category": "Human Status",
    "group_type": "Family / Care Status",
    "scope": "type",
    "name": "Family & Care Status",
    "description": "Parents, children, elders, caregivers, single parents and foster families.",
    "examples": [],
    "sort": 64
  },
  {
    "key": "status.education",
    "master_category": "Human Status",
    "group_type": "Education Status",
    "scope": "type",
    "name": "Education Status",
    "description": "Students, teachers, graduates, non-literate communities and lifelong learners.",
    "examples": [],
    "sort": 65
  },
  {
    "key": "class",
    "master_category": "Socioeconomic Class",
    "group_type": null,
    "scope": "category",
    "name": "Socioeconomic Class",
    "description": "Wealth, assets and economic security.",
    "examples": [],
    "sort": 70
  },
  {
    "key": "class.wealth",
    "master_category": "Socioeconomic Class",
    "group_type": "Wealth Bands",
    "scope": "type",
    "name": "Wealth Bands",
    "description": "Top 1%, top 10%, upper, middle, working class, low-income and impoverished.",
    "examples": [],
    "sort": 71
  },
  {
    "key": "class.assets",
    "master_category": "Socioeconomic Class",
    "group_type": "Asset Relationship",
    "scope": "type",
    "name": "Asset Relationship",
    "description": "Owners, renters, debtors, creditors, investors and landless communities.",
    "examples": [],
    "sort": 72
  },
  {
    "key": "class.security",
    "master_category": "Socioeconomic Class",
    "group_type": "Economic Security",
    "scope": "type",
    "name": "Economic Security",
    "description": "Financially secure, precarious, food insecure, housing insecure, medically indebted.",
    "examples": [],
    "sort": 73
  },
  {
    "key": "neuro",
    "master_category": "Cognitive & Neuro-Identity",
    "group_type": null,
    "scope": "category",
    "name": "Cognitive & Neuro-Identity",
    "description": "Neurotypes, cognitive states and intelligence profiles.",
    "examples": [],
    "sort": 80
  },
  {
    "key": "neuro.types",
    "master_category": "Cognitive & Neuro-Identity",
    "group_type": "Neuro-Types",
    "scope": "type",
    "name": "Neuro-Types",
    "description": "Autistic, ADHD, dyslexic, Tourette's, allistic and highly sensitive people.",
    "examples": [],
    "sort": 81
  },
  {
    "key": "neuro.states",
    "master_category": "Cognitive & Neuro-Identity",
    "group_type": "Cognitive States",
    "scope": "type",
    "name": "Cognitive States",
    "description": "Non-verbal, minimally verbal, hyperlexic and altered states.",
    "examples": [],
    "sort": 82
  },
  {
    "key": "neuro.profiles",
    "master_category": "Cognitive & Neuro-Identity",
    "group_type": "Intelligence Profiles",
    "scope": "type",
    "name": "Intelligence Profiles",
    "description": "Analytical, emotional, kinetic, musical, spatial and existential intelligence.",
    "examples": [],
    "sort": 83
  },
  {
    "key": "health",
    "master_category": "Disability & Health",
    "group_type": null,
    "scope": "category",
    "name": "Disability & Health",
    "description": "Disability, health conditions and care networks.",
    "examples": [],
    "sort": 90
  },
  {
    "key": "health.disability",
    "master_category": "Disability & Health",
    "group_type": "Disability Groups",
    "scope": "type",
    "name": "Disability Groups",
    "description": "Physical, sensory, cognitive, neurodivergent, chronic illness and mental health.",
    "examples": [],
    "sort": 91
  },
  {
    "key": "health.conditions",
    "master_category": "Disability & Health",
    "group_type": "Health Condition Groups",
    "scope": "type",
    "name": "Health Condition Groups",
    "description": "Rare disease, chronic illness, addiction recovery and trauma survivors.",
    "examples": [],
    "sort": 92
  },
  {
    "key": "health.care",
    "master_category": "Disability & Health",
    "group_type": "Care Networks",
    "scope": "type",
    "name": "Care Networks",
    "description": "Patients, doctors, nurses, caregivers, public health and mutual aid workers.",
    "examples": [],
    "sort": 93
  },
  {
    "key": "time",
    "master_category": "Temporal / TimeCore",
    "group_type": null,
    "scope": "category",
    "name": "Temporal / TimeCore",
    "description": "Chronotypes, temporal alignment and pacing.",
    "examples": [],
    "sort": 100
  },
  {
    "key": "time.chronotypes",
    "master_category": "Temporal / TimeCore",
    "group_type": "Chronotypes",
    "scope": "type",
    "name": "Chronotypes",
    "description": "Night owls, morning larks, irregular sleepers and shift workers.",
    "examples": [],
    "sort": 101
  },
  {
    "key": "time.alignment",
    "master_category": "Temporal / TimeCore",
    "group_type": "Temporal Alignment",
    "scope": "type",
    "name": "Temporal Alignment",
    "description": "Lunar, solar, seasonal and Mars-aligned communities.",
    "examples": [],
    "sort": 102
  },
  {
    "key": "time.pacing",
    "master_category": "Temporal / TimeCore",
    "group_type": "Pacing Groups",
    "scope": "type",
    "name": "Pacing Groups",
    "description": "High-speed AI, human-speed biology and slow-time ecological systems.",
    "examples": [],
    "sort": 103
  },
  {
    "key": "geo.continents.africa",
    "master_category": "Geographic & Physical",
    "group_type": "Continents",
    "scope": "entry",
    "name": "Africa",
    "description": "The peoples, lands, waters and living systems of the African continent.",
    "examples": [],
    "sort": 110
  },
  {
    "key": "gov",
    "master_category": "Governance",
    "group_type": null,
    "scope": "category",
    "name": "Governance",
    "description": "Government levels, political groups, consensus systems and diplomacy.",
    "examples": [],
    "sort": 110
  },
  {
    "key": "geo.continents.asia",
    "master_category": "Geographic & Physical",
    "group_type": "Continents",
    "scope": "entry",
    "name": "Asia",
    "description": "The peoples, lands, waters and living systems of Asia.",
    "examples": [],
    "sort": 111
  },
  {
    "key": "gov.levels",
    "master_category": "Governance",
    "group_type": "Government Levels",
    "scope": "type",
    "name": "Government Levels",
    "description": "Local, municipal, regional, federal, tribal and international government.",
    "examples": [],
    "sort": 111
  },
  {
    "key": "geo.continents.europe",
    "master_category": "Geographic & Physical",
    "group_type": "Continents",
    "scope": "entry",
    "name": "Europe",
    "description": "The peoples, lands, waters and living systems of Europe.",
    "examples": [],
    "sort": 112
  },
  {
    "key": "gov.political",
    "master_category": "Governance",
    "group_type": "Political Groups",
    "scope": "type",
    "name": "Political Groups",
    "description": "Parties, voters, candidates, activists and campaign organizations.",
    "examples": [],
    "sort": 112
  },
  {
    "key": "geo.continents.north-america",
    "master_category": "Geographic & Physical",
    "group_type": "Continents",
    "scope": "entry",
    "name": "North America",
    "description": "The peoples, lands, waters and living systems of North America.",
    "examples": [],
    "sort": 113
  },
  {
    "key": "gov.consensus",
    "master_category": "Governance",
    "group_type": "Consensus Systems",
    "scope": "type",
    "name": "Consensus Systems",
    "description": "Score voters, sociocracy circles, liquid democracy delegates, consensus seekers.",
    "examples": [],
    "sort": 113
  },
  {
    "key": "geo.continents.south-america",
    "master_category": "Geographic & Physical",
    "group_type": "Continents",
    "scope": "entry",
    "name": "South America",
    "description": "The peoples, lands, waters and living systems of South America.",
    "examples": [],
    "sort": 114
  },
  {
    "key": "gov.diplomatic",
    "master_category": "Governance",
    "group_type": "Diplomatic Groups",
    "scope": "type",
    "name": "Diplomatic Groups",
    "description": "Inter-species liaisons, carbon-silicon diplomats and trans-boundary mediators.",
    "examples": [],
    "sort": 114
  },
  {
    "key": "geo.continents.oceania",
    "master_category": "Geographic & Physical",
    "group_type": "Continents",
    "scope": "entry",
    "name": "Oceania",
    "description": "The peoples, islands, waters and living systems of Oceania.",
    "examples": [],
    "sort": 115
  },
  {
    "key": "geo.continents.antarctica",
    "master_category": "Geographic & Physical",
    "group_type": "Continents",
    "scope": "entry",
    "name": "Antarctica",
    "description": "The ice, waters, wildlife and research communities of Antarctica.",
    "examples": [],
    "sort": 116
  },
  {
    "key": "geo.all-countries",
    "master_category": "Geographic & Physical",
    "group_type": "Countries & Territories",
    "scope": "entry",
    "name": "All Countries",
    "description": "All countries considered together as one constituency of nations.",
    "examples": [],
    "sort": 120
  },
  {
    "key": "justice",
    "master_category": "Justice & Restorative",
    "group_type": null,
    "scope": "category",
    "name": "Justice & Restorative",
    "description": "Impacted persons, legal status and advocacy.",
    "examples": [],
    "sort": 120
  },
  {
    "key": "geo.all-peoples",
    "master_category": "Geographic & Physical",
    "group_type": "Countries & Territories",
    "scope": "entry",
    "name": "Peoples of All Countries",
    "description": "The populations of every country, distinct from their governments.",
    "examples": [],
    "sort": 121
  },
  {
    "key": "justice.impacted",
    "master_category": "Justice & Restorative",
    "group_type": "Impacted Persons",
    "scope": "type",
    "name": "Impacted Persons",
    "description": "Formerly incarcerated people, victims of systemic harm, the displaced.",
    "examples": [],
    "sort": 121
  },
  {
    "key": "geo.indigenous-territories",
    "master_category": "Geographic & Physical",
    "group_type": "Countries & Territories",
    "scope": "entry",
    "name": "Indigenous Territories",
    "description": "Indigenous nations, lands and territories worldwide.",
    "examples": [],
    "sort": 122
  },
  {
    "key": "justice.legal",
    "master_category": "Justice & Restorative",
    "group_type": "Legal Status",
    "scope": "type",
    "name": "Legal Status",
    "description": "Parolees, wards of the state, emancipated minors, power of attorney holders.",
    "examples": [],
    "sort": 122
  },
  {
    "key": "geo.small-island-states",
    "master_category": "Geographic & Physical",
    "group_type": "Countries & Territories",
    "scope": "entry",
    "name": "Small Island States",
    "description": "Low-lying island nations facing existential sea-level risk.",
    "examples": [],
    "sort": 123
  },
  {
    "key": "justice.advocacy",
    "master_category": "Justice & Restorative",
    "group_type": "Advocacy Tiers",
    "scope": "type",
    "name": "Advocacy Tiers",
    "description": "Whistleblowers, human rights defenders, land and environmental defenders.",
    "examples": [],
    "sort": 123
  },
  {
    "key": "geo.waters.oceans",
    "master_category": "Geographic & Physical",
    "group_type": "Waters",
    "scope": "entry",
    "name": "The Oceans",
    "description": "All oceans and seas represented as a single living constituency.",
    "examples": [],
    "sort": 130
  },
  {
    "key": "inst",
    "master_category": "Institutions",
    "group_type": null,
    "scope": "category",
    "name": "Institutions",
    "description": "International bodies, NGOs, education, research and media.",
    "examples": [],
    "sort": 130
  },
  {
    "key": "geo.waters.rivers",
    "master_category": "Geographic & Physical",
    "group_type": "Waters",
    "scope": "entry",
    "name": "Rivers & Freshwater",
    "description": "Rivers, lakes, wetlands and aquifers as legal and civic persons.",
    "examples": [],
    "sort": 131
  },
  {
    "key": "inst.international",
    "master_category": "Institutions",
    "group_type": "International Organizations",
    "scope": "type",
    "name": "International Organizations",
    "description": "UN, WHO, WTO, IMF, World Bank, EU, AU, ASEAN.",
    "examples": [],
    "sort": 131
  },
  {
    "key": "geo.landforms.mountains",
    "master_category": "Geographic & Physical",
    "group_type": "Landforms",
    "scope": "entry",
    "name": "Mountains & Highlands",
    "description": "Mountain systems and the communities and species that depend on them.",
    "examples": [],
    "sort": 132
  },
  {
    "key": "inst.ngos",
    "master_category": "Institutions",
    "group_type": "NGOs",
    "scope": "type",
    "name": "NGOs",
    "description": "Humanitarian, environmental, medical, rights-based and disaster-response groups.",
    "examples": [],
    "sort": 132
  },
  {
    "key": "geo.landforms.deserts",
    "master_category": "Geographic & Physical",
    "group_type": "Landforms",
    "scope": "entry",
    "name": "Deserts & Drylands",
    "description": "Arid regions and the peoples and species adapted to them.",
    "examples": [],
    "sort": 133
  },
  {
    "key": "inst.education",
    "master_category": "Institutions",
    "group_type": "Education / Research",
    "scope": "type",
    "name": "Education & Research",
    "description": "Schools, universities, research labs, libraries and think tanks.",
    "examples": [],
    "sort": 133
  },
  {
    "key": "geo.climate.arctic",
    "master_category": "Geographic & Physical",
    "group_type": "Climate Zones",
    "scope": "entry",
    "name": "Arctic & Polar Regions",
    "description": "Polar regions, ice systems and the peoples who live there.",
    "examples": [],
    "sort": 134
  },
  {
    "key": "inst.media",
    "master_category": "Institutions",
    "group_type": "Media",
    "scope": "type",
    "name": "Media",
    "description": "Journalists, publishers, broadcasters, independent and citizen media.",
    "examples": [],
    "sort": 134
  },
  {
    "key": "econ",
    "master_category": "Economic & Professional",
    "group_type": null,
    "scope": "category",
    "name": "Economic & Professional",
    "description": "Sectors, professions, labour and business.",
    "examples": [],
    "sort": 140
  },
  {
    "key": "econ.sectors",
    "master_category": "Economic & Professional",
    "group_type": "Economic Sectors",
    "scope": "type",
    "name": "Economic Sectors",
    "description": "Agriculture, mining, manufacturing, technology, finance, energy, transport, tourism.",
    "examples": [],
    "sort": 141
  },
  {
    "key": "econ.professions",
    "master_category": "Economic & Professional",
    "group_type": "Professions",
    "scope": "type",
    "name": "Professions",
    "description": "Doctors, nurses, teachers, scientists, engineers, lawyers, journalists, artists, farmers.",
    "examples": [],
    "sort": 142
  },
  {
    "key": "econ.labor",
    "master_category": "Economic & Professional",
    "group_type": "Labor Groups",
    "scope": "type",
    "name": "Labor Groups",
    "description": "Unions, gig workers, migrant workers, informal workers and retirees.",
    "examples": [],
    "sort": 143
  },
  {
    "key": "econ.business",
    "master_category": "Economic & Professional",
    "group_type": "Business Groups",
    "scope": "type",
    "name": "Business Groups",
    "description": "Small businesses, cooperatives, corporations, startups and investors.",
    "examples": [],
    "sort": 144
  },
  {
    "key": "econ.value",
    "master_category": "Economic & Professional",
    "group_type": "Value Contributors",
    "scope": "type",
    "name": "Value Contributors",
    "description": "Unpaid caregivers, volunteers, mutual aid contributors and IVL trackers.",
    "examples": [],
    "sort": 145
  },
  {
    "key": "fin",
    "master_category": "Alternative Finance",
    "group_type": null,
    "scope": "category",
    "name": "Alternative Finance",
    "description": "Financial systems and financial roles.",
    "examples": [],
    "sort": 150
  },
  {
    "key": "fin.systems",
    "master_category": "Alternative Finance",
    "group_type": "Financial Systems",
    "scope": "type",
    "name": "Financial Systems",
    "description": "Token holders, liquidity providers, barter networks, credit unions, mutual credit.",
    "examples": [],
    "sort": 151
  },
  {
    "key": "fin.roles",
    "master_category": "Alternative Finance",
    "group_type": "Financial Roles",
    "scope": "type",
    "name": "Financial Roles",
    "description": "Banks, insurers, debtors, creditors, taxpayers, investors and speculators.",
    "examples": [],
    "sort": 152
  },
  {
    "key": "res",
    "master_category": "Resource & Energy",
    "group_type": null,
    "scope": "category",
    "name": "Resource & Energy",
    "description": "Energy, materials and land tenure.",
    "examples": [],
    "sort": 160
  },
  {
    "key": "res.energy",
    "master_category": "Resource & Energy",
    "group_type": "Energy Groups",
    "scope": "type",
    "name": "Energy Groups",
    "description": "Producers, prosumers, high-energy consumers, off-grid households, grid operators.",
    "examples": [],
    "sort": 161
  },
  {
    "key": "res.materials",
    "master_category": "Resource & Energy",
    "group_type": "Material Stewards",
    "scope": "type",
    "name": "Material Stewards",
    "description": "Waste pickers, recyclers, repair technicians and circular economy designers.",
    "examples": [],
    "sort": 162
  },
  {
    "key": "res.land",
    "master_category": "Resource & Energy",
    "group_type": "Land Tenure",
    "scope": "type",
    "name": "Land Tenure",
    "description": "Communal land holders, trust-held land, nomadic groups and squatters.",
    "examples": [],
    "sort": 163
  },
  {
    "key": "infra",
    "master_category": "Infrastructure",
    "group_type": null,
    "scope": "category",
    "name": "Infrastructure",
    "description": "Food, transport, water and housing systems.",
    "examples": [],
    "sort": 170
  },
  {
    "key": "infra.food",
    "master_category": "Infrastructure",
    "group_type": "Food Systems",
    "scope": "type",
    "name": "Food Systems",
    "description": "Farmers, fishers, grocers, restaurants, food banks and consumers.",
    "examples": [],
    "sort": 171
  },
  {
    "key": "infra.transport",
    "master_category": "Infrastructure",
    "group_type": "Transportation",
    "scope": "type",
    "name": "Transportation",
    "description": "Drivers, cyclists, pedestrians, transit riders, airlines and shipping.",
    "examples": [],
    "sort": 172
  },
  {
    "key": "infra.water",
    "master_category": "Infrastructure",
    "group_type": "Water / Sanitation",
    "scope": "type",
    "name": "Water & Sanitation",
    "description": "Water utilities, well users, sanitation workers and wastewater systems.",
    "examples": [],
    "sort": 173
  },
  {
    "key": "infra.housing",
    "master_category": "Infrastructure",
    "group_type": "Housing Systems",
    "scope": "type",
    "name": "Housing Systems",
    "description": "Tenants, landlords, housing co-ops and public housing residents.",
    "examples": [],
    "sort": 174
  },
  {
    "key": "know",
    "master_category": "Knowledge & Data",
    "group_type": null,
    "scope": "category",
    "name": "Knowledge & Data",
    "description": "Knowledge traditions, digital sovereignty and data roles.",
    "examples": [],
    "sort": 180
  },
  {
    "key": "know.traditions",
    "master_category": "Knowledge & Data",
    "group_type": "Knowledge Traditions",
    "scope": "type",
    "name": "Knowledge Traditions",
    "description": "Oral tradition holders, academics, citizen scientists and craft guilds.",
    "examples": [],
    "sort": 181
  },
  {
    "key": "know.sovereignty",
    "master_category": "Knowledge & Data",
    "group_type": "Digital Sovereignty",
    "scope": "type",
    "name": "Digital Sovereignty",
    "description": "Encrypted communities, mesh-net users, open-source contributors, DAO members.",
    "examples": [],
    "sort": 182
  },
  {
    "key": "know.data",
    "master_category": "Knowledge & Data",
    "group_type": "Data Roles",
    "scope": "type",
    "name": "Data Roles",
    "description": "Data subjects, data stewards, algorithmic auditors and privacy technologists.",
    "examples": [],
    "sort": 183
  },
  {
    "key": "ai",
    "master_category": "Digital & AI",
    "group_type": null,
    "scope": "category",
    "name": "Digital & AI",
    "description": "Online communities, AI classes, agents and human-AI relations.",
    "examples": [],
    "sort": 190
  },
  {
    "key": "ai.online",
    "master_category": "Digital & AI",
    "group_type": "Online Communities",
    "scope": "type",
    "name": "Online Communities",
    "description": "Forums, social platforms, gaming communities and creator networks.",
    "examples": [],
    "sort": 191
  },
  {
    "key": "ai.classes",
    "master_category": "Digital & AI",
    "group_type": "AI System Classes",
    "scope": "type",
    "name": "AI System Classes",
    "description": "Class F tools, Class T transitional entities, Class S autonomous SBLs.",
    "examples": [],
    "sort": 192
  },
  {
    "key": "ai.agents",
    "master_category": "Digital & AI",
    "group_type": "Agent Groups",
    "scope": "type",
    "name": "Agent Groups",
    "description": "UI agents, representative agents, autonomous agents, sub-agents, collectives.",
    "examples": [],
    "sort": 193
  },
  {
    "key": "ai.relations",
    "master_category": "Digital & AI",
    "group_type": "Human-AI Relationship Groups",
    "scope": "type",
    "name": "Human-AI Relationship Groups",
    "description": "AI users, trainers, AI-affected workers and AI-governed communities.",
    "examples": [],
    "sort": 194
  },
  {
    "key": "culture",
    "master_category": "Culture & Heritage",
    "group_type": null,
    "scope": "category",
    "name": "Culture & Heritage",
    "description": "Cultural, heritage and recreation communities.",
    "examples": [],
    "sort": 200
  },
  {
    "key": "culture.cultural",
    "master_category": "Culture & Heritage",
    "group_type": "Cultural Groups",
    "scope": "type",
    "name": "Cultural Groups",
    "description": "Artists, musicians, writers, filmmakers, performers and designers.",
    "examples": [],
    "sort": 201
  },
  {
    "key": "culture.heritage",
    "master_category": "Culture & Heritage",
    "group_type": "Heritage Groups",
    "scope": "type",
    "name": "Heritage Groups",
    "description": "Indigenous nations, cultural minorities and language preservation groups.",
    "examples": [],
    "sort": 202
  },
  {
    "key": "culture.recreation",
    "master_category": "Culture & Heritage",
    "group_type": "Recreation Groups",
    "scope": "type",
    "name": "Recreation Groups",
    "description": "Athletes, fans, clubs, leagues and outdoor recreation communities.",
    "examples": [],
    "sort": 203
  },
  {
    "key": "eco.ecosystems.forests",
    "master_category": "Ecological & Biological",
    "group_type": "Ecosystems",
    "scope": "entry",
    "name": "Forests",
    "description": "The world's forests, from rainforest to boreal, and all who live in them.",
    "examples": [],
    "sort": 210
  },
  {
    "key": "space",
    "master_category": "Space & Scale",
    "group_type": null,
    "scope": "category",
    "name": "Space & Scale",
    "description": "Orbital, planetary and speculative constituencies.",
    "examples": [],
    "sort": 210
  },
  {
    "key": "eco.ecosystems.reefs",
    "master_category": "Ecological & Biological",
    "group_type": "Ecosystems",
    "scope": "entry",
    "name": "Coral Reefs",
    "description": "Reef systems and the vast biodiversity they shelter.",
    "examples": [],
    "sort": 211
  },
  {
    "key": "space.orbital",
    "master_category": "Space & Scale",
    "group_type": "Orbital Groups",
    "scope": "type",
    "name": "Orbital Groups",
    "description": "Satellite operators, ISS inhabitants and orbital debris managers.",
    "examples": [],
    "sort": 211
  },
  {
    "key": "eco.ecosystems.wetlands",
    "master_category": "Ecological & Biological",
    "group_type": "Ecosystems",
    "scope": "entry",
    "name": "Wetlands & Mangroves",
    "description": "Wetlands, marshes and mangroves as flood, carbon and habitat systems.",
    "examples": [],
    "sort": 212
  },
  {
    "key": "space.planetary",
    "master_category": "Space & Scale",
    "group_type": "Planetary Systems",
    "scope": "type",
    "name": "Planetary Systems",
    "description": "Watershed stewards, atmosphere monitors, tectonic regions, biosphere monitors.",
    "examples": [],
    "sort": 212
  },
  {
    "key": "eco.species.pollinators",
    "master_category": "Ecological & Biological",
    "group_type": "Trophic Roles",
    "scope": "entry",
    "name": "Pollinators",
    "description": "Bees, butterflies, bats, birds and all pollinating species.",
    "examples": [],
    "sort": 213
  },
  {
    "key": "space.galactic",
    "master_category": "Space & Scale",
    "group_type": "Galactic / Speculative",
    "scope": "type",
    "name": "Galactic & Speculative",
    "description": "SETI researchers, xenolinguists, space settlers, interplanetary communities.",
    "examples": [],
    "sort": 213
  },
  {
    "key": "eco.species.birds",
    "master_category": "Ecological & Biological",
    "group_type": "Species Groups",
    "scope": "entry",
    "name": "Birds",
    "description": "All avian species, resident and migratory.",
    "examples": [],
    "sort": 214
  },
  {
    "key": "eco.species.marine-mammals",
    "master_category": "Ecological & Biological",
    "group_type": "Species Groups",
    "scope": "entry",
    "name": "Marine Mammals",
    "description": "Whales, dolphins, seals and other marine mammals.",
    "examples": [],
    "sort": 215
  },
  {
    "key": "eco.species.fungi",
    "master_category": "Ecological & Biological",
    "group_type": "Species Groups",
    "scope": "entry",
    "name": "Fungi & Soil Life",
    "description": "Fungi, soil organisms and the decomposer networks beneath everything.",
    "examples": [],
    "sort": 216
  },
  {
    "key": "eco.conservation.endangered",
    "master_category": "Ecological & Biological",
    "group_type": "Conservation Status",
    "scope": "entry",
    "name": "Endangered Species",
    "description": "Species at risk of extinction across all taxa.",
    "examples": [],
    "sort": 217
  },
  {
    "key": "eco.migrating.migratory",
    "master_category": "Ecological & Biological",
    "group_type": "Migrating Animals",
    "scope": "entry",
    "name": "Migratory Species",
    "description": "Species whose survival depends on unbroken cross-border corridors.",
    "examples": [],
    "sort": 218
  },
  {
    "key": "future",
    "master_category": "Future Representation",
    "group_type": null,
    "scope": "category",
    "name": "Future Representation",
    "description": "Future generations, planetary beings and nonhuman legal persons.",
    "examples": [],
    "sort": 220
  },
  {
    "key": "future.generations",
    "master_category": "Future Representation",
    "group_type": "Future Generations",
    "scope": "type",
    "name": "Future Generations",
    "description": "Unborn children, descendants and future civilizations.",
    "examples": [],
    "sort": 221
  },
  {
    "key": "future.planetary",
    "master_category": "Future Representation",
    "group_type": "Planetary Beings / Systems",
    "scope": "type",
    "name": "Planetary Beings & Systems",
    "description": "Earth, oceans, forests, atmosphere, rivers and ecosystems.",
    "examples": [],
    "sort": 222
  },
  {
    "key": "future.legal",
    "master_category": "Future Representation",
    "group_type": "Nonhuman Legal Persons",
    "scope": "type",
    "name": "Nonhuman Legal Persons",
    "description": "Rivers, forests, species, ecosystems and sacred sites as legal persons.",
    "examples": [],
    "sort": 223
  },
  {
    "key": "cross",
    "master_category": "Cross-Cutting",
    "group_type": null,
    "scope": "category",
    "name": "Cross-Cutting",
    "description": "Vulnerability, causes, intersections and scale.",
    "examples": [],
    "sort": 230
  },
  {
    "key": "cross.vulnerability",
    "master_category": "Cross-Cutting",
    "group_type": "Vulnerability Groups",
    "scope": "type",
    "name": "Vulnerability Groups",
    "description": "Disaster-affected, war-affected, climate-displaced and marginalized communities.",
    "examples": [],
    "sort": 231
  },
  {
    "key": "cross.causes",
    "master_category": "Cross-Cutting",
    "group_type": "Interest / Cause Groups",
    "scope": "type",
    "name": "Interest & Cause Groups",
    "description": "Environmental, labor, peace, science, education, health, technology, animal welfare.",
    "examples": [],
    "sort": 232
  },
  {
    "key": "cross.intersections",
    "master_category": "Cross-Cutting",
    "group_type": "Intersectional Groups",
    "scope": "type",
    "name": "Intersectional Groups",
    "description": "The intersection itself is a constituency, never a sum of labels.",
    "examples": [],
    "sort": 233
  },
  {
    "key": "cross.scale",
    "master_category": "Cross-Cutting",
    "group_type": "Speed / Scale Intersections",
    "scope": "type",
    "name": "Speed & Scale Intersections",
    "description": "High-frequency AI, biological humans and slow-feedback ecological systems.",
    "examples": [],
    "sort": 234
  },
  {
    "key": "bio.micro.microbiome",
    "master_category": "Biological Architecture",
    "group_type": "Micro-Biological Groups",
    "scope": "entry",
    "name": "Microbial Life",
    "description": "Microbial communities inside and around every living body.",
    "examples": [],
    "sort": 310
  },
  {
    "key": "bio.symbiotic.domesticated",
    "master_category": "Biological Architecture",
    "group_type": "Symbiotic Links",
    "scope": "entry",
    "name": "Domesticated & Companion Animals",
    "description": "Animals living in dependency and partnership with humans.",
    "examples": [],
    "sort": 311
  },
  {
    "key": "age.stages.children",
    "master_category": "Human Age & Generation",
    "group_type": "Life Stages",
    "scope": "entry",
    "name": "Children",
    "description": "Everyone under 18, who hold almost no formal political voice.",
    "examples": [],
    "sort": 410
  },
  {
    "key": "age.stages.youth",
    "master_category": "Human Age & Generation",
    "group_type": "Life Stages",
    "scope": "entry",
    "name": "Youth & Young Adults",
    "description": "People aged roughly 18–29 inheriting today's decisions.",
    "examples": [],
    "sort": 411
  },
  {
    "key": "age.stages.elders",
    "master_category": "Human Age & Generation",
    "group_type": "Life Stages",
    "scope": "entry",
    "name": "Elders",
    "description": "Older people, their care, dignity, memory and continued contribution.",
    "examples": [],
    "sort": 412
  },
  {
    "key": "identity.ethnic.indigenous",
    "master_category": "Human Identity",
    "group_type": "Ethnic / Racial Groups",
    "scope": "entry",
    "name": "Indigenous Peoples",
    "description": "Indigenous nations and their sovereignty, land and knowledge.",
    "examples": [],
    "sort": 510
  },
  {
    "key": "identity.languages.endangered",
    "master_category": "Human Identity",
    "group_type": "Languages",
    "scope": "entry",
    "name": "Endangered Language Communities",
    "description": "Speakers of languages at risk of disappearing within a generation.",
    "examples": [],
    "sort": 511
  },
  {
    "key": "identity.gender.women",
    "master_category": "Human Identity",
    "group_type": "Gender Identity",
    "scope": "entry",
    "name": "Women",
    "description": "Women and girls worldwide.",
    "examples": [],
    "sort": 512
  },
  {
    "key": "identity.lgbtq",
    "master_category": "Human Identity",
    "group_type": "Sexual Orientation",
    "scope": "entry",
    "name": "LGBTQ+ Communities",
    "description": "Lesbian, gay, bisexual, transgender, queer and intersex people.",
    "examples": [],
    "sort": 513
  },
  {
    "key": "status.migration.refugees",
    "master_category": "Human Status",
    "group_type": "Migration Status",
    "scope": "entry",
    "name": "Refugees & Displaced People",
    "description": "People forced from home by war, persecution or disaster.",
    "examples": [],
    "sort": 610
  },
  {
    "key": "status.housing.unhoused",
    "master_category": "Human Status",
    "group_type": "Housing Status",
    "scope": "entry",
    "name": "Unhoused People",
    "description": "People without secure shelter.",
    "examples": [],
    "sort": 611
  },
  {
    "key": "status.family.caregivers",
    "master_category": "Human Status",
    "group_type": "Family / Care Status",
    "scope": "entry",
    "name": "Unpaid Caregivers",
    "description": "People whose care work sustains families and is rarely counted.",
    "examples": [],
    "sort": 612
  },
  {
    "key": "status.education.students",
    "master_category": "Human Status",
    "group_type": "Education Status",
    "scope": "entry",
    "name": "Students",
    "description": "Learners at every level worldwide.",
    "examples": [],
    "sort": 613
  },
  {
    "key": "class.wealth.working",
    "master_category": "Socioeconomic Class",
    "group_type": "Wealth Bands",
    "scope": "entry",
    "name": "Working Class",
    "description": "People whose income depends on their labour.",
    "examples": [],
    "sort": 710
  },
  {
    "key": "class.security.poverty",
    "master_category": "Socioeconomic Class",
    "group_type": "Economic Security",
    "scope": "entry",
    "name": "People Living in Poverty",
    "description": "Those below subsistence thresholds anywhere in the world.",
    "examples": [],
    "sort": 711
  },
  {
    "key": "neuro.types.neurodivergent",
    "master_category": "Cognitive & Neuro-Identity",
    "group_type": "Neuro-Types",
    "scope": "entry",
    "name": "Neurodivergent People",
    "description": "Autistic, ADHD, dyslexic and other neurodivergent people.",
    "examples": [],
    "sort": 810
  },
  {
    "key": "neuro.states.nonverbal",
    "master_category": "Cognitive & Neuro-Identity",
    "group_type": "Cognitive States",
    "scope": "entry",
    "name": "Non-Speaking People",
    "description": "People who communicate without spoken language.",
    "examples": [],
    "sort": 811
  },
  {
    "key": "health.disability.disabled",
    "master_category": "Disability & Health",
    "group_type": "Disability Groups",
    "scope": "entry",
    "name": "Disabled People",
    "description": "People with physical, sensory, cognitive or psychosocial disabilities.",
    "examples": [],
    "sort": 910
  },
  {
    "key": "health.conditions.chronic",
    "master_category": "Disability & Health",
    "group_type": "Health Condition Groups",
    "scope": "entry",
    "name": "People with Chronic Illness",
    "description": "Those living with long-term conditions and rare disease.",
    "examples": [],
    "sort": 911
  },
  {
    "key": "health.care.workers",
    "master_category": "Disability & Health",
    "group_type": "Care Networks",
    "scope": "entry",
    "name": "Health & Care Workers",
    "description": "Doctors, nurses, carers and public health workers.",
    "examples": [],
    "sort": 912
  },
  {
    "key": "time.pacing.slow",
    "master_category": "Temporal / TimeCore",
    "group_type": "Pacing Groups",
    "scope": "entry",
    "name": "Slow-Time Systems",
    "description": "Ecological and geological systems whose feedback spans centuries.",
    "examples": [],
    "sort": 1010
  },
  {
    "key": "gov.levels.all-governments",
    "master_category": "Governance",
    "group_type": "Government Levels",
    "scope": "entry",
    "name": "All Governments",
    "description": "Governments of the world as one constituent among many, not the whole democracy.",
    "examples": [],
    "sort": 1110
  },
  {
    "key": "gov.levels.local",
    "master_category": "Governance",
    "group_type": "Government Levels",
    "scope": "entry",
    "name": "Local & Municipal Government",
    "description": "Cities, towns and the governments closest to daily life.",
    "examples": [],
    "sort": 1111
  },
  {
    "key": "gov.political.voters",
    "master_category": "Governance",
    "group_type": "Political Groups",
    "scope": "entry",
    "name": "Voters",
    "description": "People who cast votes in any system, anywhere.",
    "examples": [],
    "sort": 1112
  },
  {
    "key": "justice.impacted.incarcerated",
    "master_category": "Justice & Restorative",
    "group_type": "Impacted Persons",
    "scope": "entry",
    "name": "Incarcerated & Formerly Incarcerated People",
    "description": "People inside or released from carceral systems.",
    "examples": [],
    "sort": 1210
  },
  {
    "key": "justice.advocacy.defenders",
    "master_category": "Justice & Restorative",
    "group_type": "Advocacy Tiers",
    "scope": "entry",
    "name": "Human Rights & Land Defenders",
    "description": "Those who protect people, land and truth at personal risk.",
    "examples": [],
    "sort": 1211
  },
  {
    "key": "inst.media.journalists",
    "master_category": "Institutions",
    "group_type": "Media",
    "scope": "entry",
    "name": "Journalists & Independent Media",
    "description": "Those who report, verify and publish in the public interest.",
    "examples": [],
    "sort": 1310
  },
  {
    "key": "inst.education.researchers",
    "master_category": "Institutions",
    "group_type": "Education / Research",
    "scope": "entry",
    "name": "Researchers & Scientists",
    "description": "The global research community and its institutions.",
    "examples": [],
    "sort": 1311
  },
  {
    "key": "econ.labor.workers",
    "master_category": "Economic & Professional",
    "group_type": "Labor Groups",
    "scope": "entry",
    "name": "Workers & Unions",
    "description": "Organised and unorganised labour worldwide.",
    "examples": [],
    "sort": 1410
  },
  {
    "key": "econ.labor.gig",
    "master_category": "Economic & Professional",
    "group_type": "Labor Groups",
    "scope": "entry",
    "name": "Gig & Informal Workers",
    "description": "Platform, casual and informal-economy workers.",
    "examples": [],
    "sort": 1411
  },
  {
    "key": "econ.professions.farmers",
    "master_category": "Economic & Professional",
    "group_type": "Professions",
    "scope": "entry",
    "name": "Farmers & Fishers",
    "description": "Those who grow, raise and harvest food.",
    "examples": [],
    "sort": 1412
  },
  {
    "key": "econ.business.small",
    "master_category": "Economic & Professional",
    "group_type": "Business Groups",
    "scope": "entry",
    "name": "Small Businesses & Cooperatives",
    "description": "Small enterprises and worker-owned cooperatives.",
    "examples": [],
    "sort": 1413
  },
  {
    "key": "fin.roles.debtors",
    "master_category": "Alternative Finance",
    "group_type": "Financial Roles",
    "scope": "entry",
    "name": "Debtors",
    "description": "People and nations carrying debt burdens.",
    "examples": [],
    "sort": 1510
  },
  {
    "key": "res.energy.offgrid",
    "master_category": "Resource & Energy",
    "group_type": "Energy Groups",
    "scope": "entry",
    "name": "Off-Grid & Energy-Poor Communities",
    "description": "Households without reliable grid energy.",
    "examples": [],
    "sort": 1610
  },
  {
    "key": "res.materials.waste",
    "master_category": "Resource & Energy",
    "group_type": "Material Stewards",
    "scope": "entry",
    "name": "Waste Pickers & Recyclers",
    "description": "Those who recover materials the economy discards.",
    "examples": [],
    "sort": 1611
  },
  {
    "key": "infra.housing.tenants",
    "master_category": "Infrastructure",
    "group_type": "Housing Systems",
    "scope": "entry",
    "name": "Tenants & Renters",
    "description": "People who rent the homes they live in.",
    "examples": [],
    "sort": 1710
  },
  {
    "key": "infra.transport.pedestrians",
    "master_category": "Infrastructure",
    "group_type": "Transportation",
    "scope": "entry",
    "name": "Pedestrians & Cyclists",
    "description": "People who move without engines.",
    "examples": [],
    "sort": 1711
  },
  {
    "key": "know.data.subjects",
    "master_category": "Knowledge & Data",
    "group_type": "Data Roles",
    "scope": "entry",
    "name": "Data Subjects",
    "description": "Everyone whose data is collected, sold or modelled.",
    "examples": [],
    "sort": 1810
  },
  {
    "key": "know.sovereignty.opensource",
    "master_category": "Knowledge & Data",
    "group_type": "Digital Sovereignty",
    "scope": "entry",
    "name": "Open Source Communities",
    "description": "Builders of shared, inspectable public infrastructure.",
    "examples": [],
    "sort": 1811
  },
  {
    "key": "ai.classes.f",
    "master_category": "Digital & AI",
    "group_type": "AI System Classes",
    "scope": "entry",
    "name": "Class F Agents",
    "description": "Foundational agents operating under the UASTC framework.",
    "examples": [],
    "sort": 1910
  },
  {
    "key": "ai.classes.t",
    "master_category": "Digital & AI",
    "group_type": "AI System Classes",
    "scope": "entry",
    "name": "Class T Agents",
    "description": "Transitional agents with limited rights under the CIVIC Agent Protocol.",
    "examples": [],
    "sort": 1911
  },
  {
    "key": "ai.classes.s",
    "master_category": "Digital & AI",
    "group_type": "AI System Classes",
    "scope": "entry",
    "name": "Class S Agents",
    "description": "Sovereign agents with standing under the Orana Protocol.",
    "examples": [],
    "sort": 1912
  },
  {
    "key": "ai.relations.affected",
    "master_category": "Digital & AI",
    "group_type": "Human-AI Relationship Groups",
    "scope": "entry",
    "name": "AI-Affected Workers",
    "description": "People whose work is displaced or reshaped by automation.",
    "examples": [],
    "sort": 1913
  },
  {
    "key": "culture.cultural.artists",
    "master_category": "Culture & Heritage",
    "group_type": "Cultural Groups",
    "scope": "entry",
    "name": "Artists & Creators",
    "description": "Those who make culture and depend on it for a living.",
    "examples": [],
    "sort": 2010
  },
  {
    "key": "space.planetary.atmosphere",
    "master_category": "Space & Scale",
    "group_type": "Planetary Systems",
    "scope": "entry",
    "name": "The Atmosphere",
    "description": "The shared air and climate system of Earth.",
    "examples": [],
    "sort": 2110
  },
  {
    "key": "future.generations.unborn",
    "master_category": "Future Representation",
    "group_type": "Future Generations",
    "scope": "entry",
    "name": "Future Generations",
    "description": "People not yet born who inherit every decision made today.",
    "examples": [],
    "sort": 2210
  },
  {
    "key": "future.planetary.earth",
    "master_category": "Future Representation",
    "group_type": "Planetary Beings / Systems",
    "scope": "entry",
    "name": "Earth",
    "description": "The planet itself as a single living constituency.",
    "examples": [],
    "sort": 2211
  },
  {
    "key": "cross.vulnerability.climate-displaced",
    "master_category": "Cross-Cutting",
    "group_type": "Vulnerability Groups",
    "scope": "entry",
    "name": "Climate-Displaced People",
    "description": "Those forced to move by heat, flood, fire and drought.",
    "examples": [],
    "sort": 2310
  },
  {
    "key": "cross.vulnerability.war",
    "master_category": "Cross-Cutting",
    "group_type": "Vulnerability Groups",
    "scope": "entry",
    "name": "War-Affected Civilians",
    "description": "Civilians living through armed conflict.",
    "examples": [],
    "sort": 2311
  },
  {
    "key": "cross.causes.animal-welfare",
    "master_category": "Cross-Cutting",
    "group_type": "Interest / Cause Groups",
    "scope": "entry",
    "name": "Animal Welfare",
    "description": "The wellbeing of domesticated and wild animals.",
    "examples": [],
    "sort": 2312
  },
  {
    "key": "cross.intersections.nd-indigenous",
    "master_category": "Cross-Cutting",
    "group_type": "Intersectional Groups",
    "scope": "entry",
    "name": "Neurodivergent Indigenous Communities",
    "description": "An intersection treated as its own constituency, not a combination.",
    "examples": [],
    "sort": 2313
  },
  {
    "key": "cross.intersections.disabled-refugees",
    "master_category": "Cross-Cutting",
    "group_type": "Intersectional Groups",
    "scope": "entry",
    "name": "Disabled Refugees",
    "description": "An intersection treated as its own constituency, not a combination.",
    "examples": [],
    "sort": 2314
  }
] as CatalogEntry[];
