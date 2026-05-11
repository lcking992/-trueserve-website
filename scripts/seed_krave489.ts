import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function main() {
  if (process.env.RUN_KRAVE489_SEED !== "true") {
    console.log("Skipping Krave 489 seed.");
    return;
  }

  const { seedKrave489 } = await import("../lib/krave489Seed");

  console.log("Seeding Krave 489...");
  const result = await seedKrave489();
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error("Krave 489 seed failed:", error);
  process.exit(1);
});
