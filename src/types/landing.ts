export type PlatformBranding = {
  name: string;
  description: string | null;
  logo: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
};

export type LandingStats = {
  schools: number;
  students: number;
  teachers: number;
  classes: number;
  parents: number;
  enrollments: number;
  subjects: number;
  results: number;
  applications: number;
};

export type SchoolLogo = {
  name: string;
  logo: string;
};
