import assert from 'node:assert/strict';
const base=process.env.TEST_BASE_URL??'http://localhost:3000';
for(const path of ['/','/demo','/demo/profile','/login','/demo/preparation','/demo/resume','/demo/community','/demo/community/11111111-1111-4111-8111-111111111111']) {const r=await fetch(base+path,{signal:AbortSignal.timeout(30000)});assert.equal(r.status,200,path);const html=await r.text();assert(html.includes('CAVITY'),path);console.log(`PASS public page ${path}`)}
for(const path of ['/resume','/community','/professor/community','/dashboard','/preparation','/profile','/professor','/professor/shortlists','/professor/students/00000000-0000-4000-8000-000000000000']) {const r=await fetch(base+path,{redirect:'manual',signal:AbortSignal.timeout(30000)});if(r.status===307){assert(r.headers.get('location')?.includes('/login'))}else{assert.equal(r.status,200,path);const html=await r.text();assert(html.includes('NEXT_REDIRECT')&&html.includes('/login'),path);}console.log(`PASS unauthenticated route protection ${path}`)}
for(const path of ['/api/resume','/api/challenges','/api/challenges/11111111-1111-4111-8111-111111111111/submissions','/api/profile','/api/preparation','/api/companies','/api/shortlists']) {for(const [origin,status] of [[base,401],['https://untrusted.example',403]]){const r=await fetch(base+path,{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:'{}',signal:AbortSignal.timeout(30000)});assert.equal(r.status,status,path);console.log(`PASS ${path} rejects ${status===401?'unauthenticated':'cross-origin'} mutation`)}}



for(const path of ['/companies','/leaderboard']){const r=await fetch(base+path);assert.equal(r.status,404);console.log('PASS removed route '+path)}
