import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// Only initialize Drizzle if DATABASE_URL is available
// This prevents build errors on Vercel where only Supabase env vars are used
const connectionString = process.env.DATABASE_URL

let db: ReturnType<typeof drizzle> | null = null

if (connectionString) {
  try {
    const globalForDb = global as unknown as {
      client: postgres.Sql | undefined;
    };

    const client = globalForDb.client ?? postgres(connectionString, { prepare: false });

    if (process.env.NODE_ENV !== "production") globalForDb.client = client;

    db = drizzle(client, { schema });
  } catch (error) {
    console.warn("Failed to initialize Drizzle DB client:", error)
    db = null
  }
} else {
  console.warn("DATABASE_URL not set - Drizzle DB client not initialized. Using Supabase for database operations.")
}

export { db }
