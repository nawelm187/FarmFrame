import type { Status } from "./data";
import type { Key } from "../i18n";
/** The translation key of each status word (FRESH, STALE...). The colours are keyed on the English status, only the word shown is translated. */
export const ST: Record<Status | "CALCULATED", Key> = { FRESH: "stFRESH", STALE: "stSTALE", UNAVAILABLE: "stUNAVAILABLE", ERROR: "stERROR", LOADING: "stLOADING", CALCULATED: "stCALCULATED" };
