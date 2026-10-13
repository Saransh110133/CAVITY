import {ensureSectionProfile} from '@/lib/sections-server';
import {NextResponse} from 'next/server';
import {authorize,apiError,HttpError} from '@/lib/api';
import {communityUser} from '@/lib/community-server';
import {db,checked} from '@/lib/db';
import {challengeSchema,collegeToday} from '@/lib/challenges';
export async function GET(){try{const u=await communityUser();let q=db().from('Challenges').select('*,professor:Users!professor_id!inner(teaching_sections)').order('release_date',{ascending:false}).limit(200);q=u.role==='professor'?q.eq('professor_id',u.id):q.eq('published',true).lte('release_date',collegeToday()).contains('professor.teaching_sections',[u.section!]);return NextResponse.json(checked(await q))}catch(e){return apiError(e)}}
export async function POST(r:Request){try{const u=await authorize(r,'professor');ensureSectionProfile(u);const p=challengeSchema.safeParse(await r.json());if(!p.success)throw new HttpError(400,p.error.issues[0].message);return NextResponse.json(checked(await db().from('Challenges').insert({...p.data,professor_id:u.id}).select().single()),{status:201})}catch(e){return apiError(e)}}
