import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// Lazy initialization to prevent build errors
let dbInstance: ReturnType<typeof drizzle> | null = null

export function getDb() {
  if (dbInstance) return dbInstance
  
  const connectionString = process.env.DATABASE_URL
  
  if (!connectionString) {
    console.warn("DATABASE_URL not set - Drizzle DB not available. Use Supabase instead.")
    return null
  }
  
  try {
    const globalForDb = global as unknown as {
      client: postgres.Sql | undefined;
    };

    const client = globalForDb.client ?? postgres(connectionString, { prepare: false });

    if (process.env.NODE_ENV !== "production") globalForDb.client = client;

    dbInstance = drizzle(client, { schema });
    return dbInstance
  } catch (error) {
    console.warn("Failed to initialize Drizzle DB client:", error)
    return null
  }
}

// Backward compatible export - lazy loaded
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(target, prop) {
    const db = getDb()
    if (!db) {
      throw new Error("DATABASE_URL not set - Drizzle DB not available. Use Supabase for database operations.")
    }
    return db[prop as keyof typeof db]
  }
})
