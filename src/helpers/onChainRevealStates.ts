export const onChainRevealStates = ["unknown", "ready", "pending"] as const;

export type OnChainRevealState = (typeof onChainRevealStates)[number];
