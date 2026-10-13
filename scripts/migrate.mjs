import pg from 'pg';
import {readFile,readdir} from 'node:fs/promises';
if(!process.env.DATABASE_URL) {console.error('Set DATABASE_URL in .env.local, or run all SQL files in supabase/migrations in filename order in the Supabase SQL editor.');process.exit(1)}
const client = new pg.Client({connectionString:process.env.DATABASE_URL});
try {await client.connect();for(const file of (await readdir(new URL('../supabase/migrations/',import.meta.url))).filter(f=>f.endsWith('.sql')).sort()){await client.query(await readFile(new URL('../supabase/migrations/'+file,import.meta.url),'utf8'));console.log('Applied '+file);}} catch {console.error('Migration failed. Check DATABASE_URL, SSL settings, and database access.');process.exitCode=1}finally{await client.end()}
