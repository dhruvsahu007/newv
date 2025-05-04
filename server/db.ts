import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import dotenv from 'dotenv';
dotenv.config();

// console.log("DATABASE_URL = ", process.env.DATABASE_URL);
const DATABASE_URL='postgresql://neondb_owner:npg_NVqaXS3r1Oxk@ep-wild-frost-a5xvr7wy.us-east-2.aws.neon.tech/neondb?sslmode=require';

neonConfig.webSocketConstructor = ws;

if (!DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: DATABASE_URL });
export const db = drizzle({ client: pool, schema });
