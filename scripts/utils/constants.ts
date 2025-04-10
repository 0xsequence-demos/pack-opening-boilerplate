import dotenv from "dotenv";
dotenv.config();

export const projectId = Number(process.env.VITE_PROJECT_ID);
export const collectionId = Number(process.env.VITE_COLLECTION_ID);
export const jwtAccessKey = process.env.JWT_ACCESS_KEY;
export const projectAccessKey = process.env.VITE_PROJECT_ACCESS_KEY;
export const tokenContractAddress = process.env.VITE_ITEMS_CONTRACT_ADDRESS;
