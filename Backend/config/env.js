import { config } from "dotenv";
import { join } from "path";

config({ path: join(process.cwd(), ".env") });
console.log(
  "Environment loaded, GCP_BUCKET_NAME:",
  process.env.GCP_BUCKET_NAME
);
