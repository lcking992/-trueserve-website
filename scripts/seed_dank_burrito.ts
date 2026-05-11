import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function main() {
  if (process.env.RUN_DANK_BURRITO_SEED !== "true") {
    console.log("Skipping Dank Burrito seed.");
    return;
  }

  const { seedDankBurrito } = await import("../lib/dankBurritoSeed");

  console.log("Seeding Dank Burrito...");
  const result = await seedDankBurrito();
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error("Dank Burrito seed failed:", error);
  process.exit(1);
});
