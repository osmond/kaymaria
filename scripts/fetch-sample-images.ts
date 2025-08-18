import fs from "fs";
import path from "path";

const plants = [
  { id: "p1", query: "fiddle-leaf-fig" },
  { id: "p2", query: "snake-plant" },
  { id: "p3", query: "spider-plant" },
  { id: "p4", query: "pothos" },
  { id: "p5", query: "peace-lily" },
  { id: "p6", query: "zz-plant" },
  { id: "p7", query: "aloe-vera" },
  { id: "p8", query: "boston-fern" },
  { id: "p9", query: "rubber-plant" },
  { id: "p10", query: "philodendron" },
  { id: "p11", query: "chinese-evergreen" },
  { id: "p12", query: "jade-plant" },
  { id: "p13", query: "monstera" },
  { id: "p14", query: "english-ivy" },
  { id: "p15", query: "parlor-palm" },
  { id: "p16", query: "money-tree" },
  { id: "p17", query: "croton-plant" },
  { id: "p18", query: "dracaena" },
  { id: "p19", query: "orchid" },
  { id: "p20", query: "african-violet" },
];

async function main() {
  const outDir = path.join(__dirname, "..", "public", "sample-images");
  await fs.promises.mkdir(outDir, { recursive: true });

  for (const plant of plants) {
    const url = `https://source.unsplash.com/600x400/?${plant.query}`;
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`Failed to fetch ${url}: ${res.status}`);
      continue;
    }
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filePath = path.join(outDir, `${plant.id}.jpg`);
    await fs.promises.writeFile(filePath, buffer);
    console.log(`saved ${filePath}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

