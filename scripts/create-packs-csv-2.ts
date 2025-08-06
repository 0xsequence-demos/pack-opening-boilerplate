import { tokenContractAddress, tokenContract2Address } from "./utils/constants";

function randInt(min = 0, max = 10) {
  return ~~(min + Math.random() * (max - min + 1));
}
console.log(
  "Pack Content ID, Item 1 Token Addr, Item 1 Token Type, Item 1 Token IDs, Item 1 Amounts, Item 2 Token Addr, Item 2 Token Type, Item 2 Token IDs, Item 2 Amounts",
);

function arr<T>(len: number, thing: (v: number) => T) {
  const val: T[] = [];
  for (let i = 0; i < len; i++) {
    val.push(thing(i));
  }
  return val;
}
let base721id = 1200;
for (let i = 0; i < 400; i++) {
  const num721s = Math.random() > 0.5 ? 1 : 2;
  const num1155s = Math.random() > 0.5 ? 1 : 2;
  const id1155 = ~~(Math.random() * 10);
  const tokens721 = arr(num721s, () => base721id++);
  const tokens1155 = arr(num1155s, (j) => id1155 + j);
  const tokenCounts1155 = tokens1155.map(() => randInt(3, 10));
  console.log(
    `${i + 1},${tokenContractAddress},721,"${tokens721.join(",")}","${tokens721.map(() => 1).join(",")}",${tokenContract2Address},1155,"${tokens1155.join(",")}","${tokenCounts1155.join(",")}"`,
  );
}
