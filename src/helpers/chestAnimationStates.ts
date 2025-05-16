export const chestAnimationStates = [
  "idle",
  "unlocking",
  "strugglingToOpen",
  "opening",
  "hasProblem",
] as const;

export type ChestAnimationState = (typeof chestAnimationStates)[number];
