export type Localized = { en: string; pl: string };

export interface Highlight {
  title: Localized;
  problem: Localized;
  approach: Localized;
  impact: Localized;
}

export interface Job {
  company: string;
  hash: string;
  current: boolean;
  dot: string;
  role: Localized;
  period: string;
  periodEnd: Localized | null;
  context: Localized;
  highlights: Highlight[];
  points: Localized[];
  tech: string[];
}

export interface Cert {
  name: Localized;
  year: string;
  issuer: string;
  credly: boolean;
  url: string;
  badgeImage: string;
}

export interface Education {
  school: Localized;
  degreeTitle: Localized;
  field: Localized;
  location: Localized;
  year: string;
  crestImage: string;
}

export interface Metric {
  value: string;
  label: Localized;
}

export interface SkillGroup {
  label: Localized;
  items: string[];
}

export interface Profile {
  name: string;
  role: Localized;
  summary: Localized;
  email: string;
  phone: string;
  cv: string;
  links: { linkedin: string; github: string; credly: string };
}

export interface Content {
  profile: Profile;
  ui: Record<string, Localized>;
  metrics: Metric[];
  skills: SkillGroup[];
  jobs: Job[];
  certs: Cert[];
  education: Education;
}
