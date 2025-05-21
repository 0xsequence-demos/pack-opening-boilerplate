export const packOpeningStates = [
  "idle",
  "startingOpeningProcess",
  "commiting",
  "revealing",
  "revealBackup",
  "receiving",
  "success",
  "fail",
] as const;

export type PackOpeningState = (typeof packOpeningStates)[number];
