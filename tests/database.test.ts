import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
test('Postgres migration: permissions, constraints, shortlists and atomic profile updates',async()=>{
 const db=new PGlite();
 try {
 await db.exec('CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;');
 const sql=(await readFile(new URL('../supabase/migrations/001_initial.sql',import.meta.url),'utf8')).replace('CREATE EXTENSION IF NOT EXISTS pgcrypto;','');
 await db.exec(sql);await db.exec(sql);
 const details=await readFile(new URL('../supabase/migrations/002_profile_details.sql',import.meta.url),'utf8');
 await db.exec(details);await db.exec(details);
 const student=(await db.query<{id:string}>(`INSERT INTO "Users" (name,email) VALUES ('Student','s@college.edu') RETURNING id`)).rows[0].id;
 const professor=(await db.query<{id:string}>(`INSERT INTO "Users" (name,email,role) VALUES ('Professor','p@college.edu','professor') RETURNING id`)).rows[0].id;
 const company=(await db.query<{id:string}>(`INSERT INTO "Companies" (name,domain,required_skills) VALUES ('Example','Software',ARRAY['SQL']) RETURNING id`)).rows[0].id;
 await db.query('INSERT INTO "Profiles" (user_id,github_username) VALUES ($1,$2)',[student,'student']);
 await assert.rejects(db.query('INSERT INTO "Shortlists" (professor_id,student_id,company_id) VALUES ($1,$2,$3)',[student,professor,company]));
 await db.query('INSERT INTO "Shortlists" (professor_id,student_id,company_id,status,notes) VALUES ($1,$2,$3,$4,$5)',[professor,student,company,'shortlisted','Practice SQL']);
 await assert.rejects(db.query('INSERT INTO "Shortlists" (professor_id,student_id,company_id) VALUES ($1,$2,$3)',[professor,student,company]));
 const permissions=(await db.query<{allowed:boolean}>(`SELECT has_table_privilege('anon','"Users"','SELECT') AS allowed`)).rows[0];assert.equal(permissions.allowed,false);
 await db.exec('SET ROLE anon;');await assert.rejects(db.query('SELECT * FROM "Users"'));await db.exec('RESET ROLE;');
 const old=(await db.query<{updated_at:string}>('SELECT updated_at::text FROM "Profiles" WHERE user_id=$1',[student])).rows[0].updated_at;
 const save=()=>db.query<{saved:boolean}>('SELECT save_profile($1,$2,$3,$4,$5,$6,$7,$8,$9) AS saved',[student,old,'CS','student',null,null,null,50,10]);
 assert.equal((await save()).rows[0].saved,true);assert.equal((await save()).rows[0].saved,false);
 assert.equal((await db.query<{department:string}>('SELECT department FROM "Users" WHERE id=$1',[student])).rows[0].department,'CS');
 const latest=(await db.query<{updated_at:string}>('SELECT updated_at::text FROM "Profiles" WHERE user_id=$1',[student])).rows[0].updated_at;
 const saveDetails=()=>db.query<{saved:boolean}>('SELECT save_profile_details($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) AS saved',[student,latest,'Student Updated','CS','I enjoy databases',['SQL','Python'],'student',null,null,null,50,10]);
 assert.equal((await saveDetails()).rows[0].saved,true);
 assert.equal((await saveDetails()).rows[0].saved,false);
 const detailRow=(await db.query<{bio:string;skills:string[]}>('SELECT bio,skills FROM "Profiles" WHERE user_id=$1',[student])).rows[0];
 assert.equal(detailRow.bio,'I enjoy databases');assert.deepEqual(detailRow.skills,['SQL','Python']);
 assert.equal((await db.query<{name:string}>('SELECT name FROM "Users" WHERE id=$1',[student])).rows[0].name,'Student Updated');
 await assert.rejects(db.query('UPDATE "Profiles" SET composite_score=101 WHERE user_id=$1',[student]));
 await db.query('DELETE FROM "Companies" WHERE id=$1',[company]);assert.equal((await db.query('SELECT * FROM "Shortlists"')).rows.length,0);
 }finally {await db.close()}
});
