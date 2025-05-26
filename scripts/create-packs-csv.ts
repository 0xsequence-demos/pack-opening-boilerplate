import fs from "node:fs";
import { SequenceCollections } from "@0xsequence/metadata";
import {
  jwtAccessKey,
  projectAccessKey,
  projectId,
  collectionId,
  tokenContractAddress,
} from "./utils/constants";

const csvFilePath = "./generated-packs.csv";

function randItem<T>(items: T[]) {
  return items[~~(Math.random() * items.length)];
}
function randInt(min = 0, max = 10) {
  return ~~(min + Math.random() * (max - min + 1));
}

async function main() {
  if (!jwtAccessKey || !projectAccessKey || !projectId?.toString()) {
    console.log("Bad Request. Missing env vars");
    return;
  }

  const collectionsService = new SequenceCollections(
    "https://metadata.sequence.app",
    jwtAccessKey,
  );
  const tokens = (
    await collectionsService.listTokens({
      projectId,
      collectionId,
    })
  ).tokens;

  const tools = tokens.filter((token) => token.properties?.type === "Tool");
  const resources = tokens.filter(
    (token) => token.properties?.type === "Resource",
  );

  const packRecipes: [string, number, string, number][] = [];

  for (let i = 0; i < 10000; i++) {
    const toolGrade = Math.random() > 0.75 ? "Refined" : "Crude";
    const item1 = randItem(
      tools.filter((t) => t.properties?.grade === toolGrade),
    );
    const resourceGrade = Math.random() > 0.75 ? "Refined" : "Crude";
    const item2 = randItem(
      resources.filter((t) => t.properties?.grade === resourceGrade),
    );
    packRecipes.push([
      item1.tokenId,
      1,
      item2.tokenId,
      resourceGrade === "Crude" ? randInt(5, 10) : randInt(3, 5),
    ]);
  }
  const csvValues = packRecipes.map((recipe, i) => [
    i + 1,
    tokenContractAddress,
    `"${recipe[0]},${recipe[2]}"`,
    `"${recipe[1]},${recipe[3]}"`,
  ]);
  const csvRows = csvValues.map((v) => v.join(","));
  const data = [
    // "Pack ID,Item 1 Token Addr,Item 1 Token IDs,Item 1 Amounts,Item 2 Token Addr,Item 2 Token IDs,Item 2 Amounts",
    "Pack ID,Item 1 Token Addr,Item 1 Token IDs,Item 1 Amounts",
  ]
    .concat(csvRows)
    .join("\n");

  fs.writeFile(csvFilePath, data, (err) => {
    if (err) {
      console.error(err);
    } else {
      console.log(`${csvFilePath} written successfully`);
    }
  });
}

main();
