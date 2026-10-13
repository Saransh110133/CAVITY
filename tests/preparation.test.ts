import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
test('preparation tasks persist completion, reject invalid titles and restrict direct access',async()=>{
 const db=new PGlite();try{
 await db.exec('CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;');
 for(const name of ['001_initial.sql','004_preparation_tasks.sql'])await db.exec((await readFile(new URL('../supabase/migrations/'+name,import.meta.url),'utf8')).replace('CREATE EXTENSION IF NOT EXISTS pgcrypto;',''));
 const uid=(await db.query<{id:string}>(`INSERT INTO "Users"(name,email) VALUES('Student','s@kiit.ac.in') RETURNING id`)).rows[0].id;
 const id=(await db.query<{id:string}>('INSERT INTO "PreparationTasks"(user_id,title) VALUES($1,$2) RETURNING id',[uid,'Practice SQL joins'])).rows[0].id;
 await db.query('UPDATE "PreparationTasks" SET completed=true WHERE id=$1 AND user_id=$2',[id,uid]);
 assert.equal((await db.query<{completed:boolean}>('SELECT completed FROM "PreparationTasks" WHERE id=$1',[id])).rows[0].completed,true);
 await assert.rejects(db.query('INSERT INTO "PreparationTasks"(user_id,title) VALUES($1,$2)',[uid,' ']));
 await db.exec('SET ROLE anon');await assert.rejects(db.query('SELECT * FROM "PreparationTasks"'));await db.exec('RESET ROLE');
 await db.query('DELETE FROM "PreparationTasks" WHERE id=$1 AND user_id=$2',[id,uid]);assert.equal((await db.query('SELECT * FROM "PreparationTasks"')).rows.length,0);
 }finally{await db.close()}
});
