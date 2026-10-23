// Categories of a data report. `value` is what is stored in the database (always English, so reports can be read together); `key` is the translated label shown to the person.
export const REPORT_CATS = [
  { value: "Incorrect acquisition information", key: "rptCatAcq" },
  { value: "Incorrect drop information", key: "rptCatDrop" },
  { value: "Outdated information", key: "rptCatOutdated" },
  { value: "Incorrect item information", key: "rptCatItem" },
  { value: "Incorrect market information", key: "rptCatMarket" },
  { value: "Incorrect world state", key: "rptCatWorld" },
  { value: "Other", key: "rptCatOther" },
] as const;
