import type { PowerType } from "./types";

// Exact enum values from PLAN.md / the backend's PowerType schema - keep in sync.
export const POWER_TYPES: PowerType[] = [
  "wind",
  "hydro",
  "solar",
  "geothermal",
  "natural gas",
  "coal",
  "nuclear",
  "waste heat",
];

// One distinct, muted color per type - used as a legend dot next to the type
// in the power sources table, and reused by the step-8c schedule grid legend
// so the two pages agree on what each color means.
export const POWER_TYPE_COLORS: Record<PowerType, string> = {
  wind: "#4A90A4",
  hydro: "#2E5C8A",
  solar: "#D9A441",
  geothermal: "#B4652A",
  "natural gas": "#8A8FBF",
  coal: "#4A4A4A",
  nuclear: "#4C9A5B",
  "waste heat": "#A63D5C",
};
