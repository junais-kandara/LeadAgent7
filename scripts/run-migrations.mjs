import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const { Client } = pg;

async function runMigrations() {
  const client = new Client({
    host: process.env.DB_HOST || 'db.zpltpcntcrocqgxvaqmi.supabase.co',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'Allah@Great@1',
    database: process.env.DB_NAME || 'postgres',
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Connecting to Supabase PostgreSQL...');
    await client.connect();
    console.log('Connected successfully!');

    // Create a schema migrations table to record applied migrations
    await client.query(`
      CREATE TABLE IF NOT EXISTS public._schema_migrations (
        version VARCHAR(255) PRIMARY KEY,
        applied_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
      );
    `);

    const migrationsDir = path.resolve(__dirname, '../supabase/migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      const version = file.replace('.sql', '');
      const { rows } = await client.query('SELECT version FROM public._schema_migrations WHERE version = $1', [version]);

      if (rows.length > 0) {
        console.log(`[SKIP] Migration ${file} already applied.`);
        continue;
      }

      console.log(`[APPLYING] ${file}...`);
      const sqlContent = fs.readFileSync(path.join(migrationsDir, file), 'utf8');

      await client.query('BEGIN');
      try {
        await client.query(sqlContent);
        await client.query('INSERT INTO public._schema_migrations (version) VALUES ($1)', [version]);
        await client.query('COMMIT');
        console.log(`[SUCCESS] ${file} applied.`);
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`[ERROR] Failed to apply ${file}:`, err);
        throw err;
      }
    }

    console.log('\nAll migrations applied successfully!');

    // Verify created tables
    const tableRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    console.log('\nPublic tables currently in database:');
    tableRes.rows.forEach(r => console.log(` - ${r.table_name}`));

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigrations();
