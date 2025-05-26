export const chestStates = ["idle", "busy", "failed", "opened"] as const;

export type ChestState = (typeof chestStates)[number];
