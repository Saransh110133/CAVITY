import {NextResponse} from 'next/server';
import {authorize,apiError,HttpError} from '@/lib/api';
import {communityUser,visibleChallenge} from '@/lib/community-server';
import {db,checked} from '@/lib/db';
import {challengeSchema} from '@/lib/challenges';
type Context={params:Promise<{id:string}>};
export async function GET(_:Request,ctx:Context){try{const u=await communityUser();const {id}=await ctx.params;const challenge=await visibleChallenge(id,u);let q=db().from('ChallengeSubmissions').select('*,student:Users!student_id!inner(name,section)').eq('challenge_id',id);if(u.role==='student')q=q.eq('student_id',u.id);else q=q.in('student.section',u.teaching_sections??[]);return NextResponse.json({challenge,submissions:checked(await q.order('updated_at',{ascending:false}).limit(200))})}catch(e){return apiError(e)}}
export async function PATCH(r:Request,ctx:Context){try{const u=await authorize(r,'professor');const {id}=await ctx.params;await visibleChallenge(id,u);const p=challengeSchema.safeParse(await r.json());if(!p.success)throw new HttpError(400,p.error.issues[0].message);const submissions=checked(await db().from('ChallengeSubmissions').select('id').eq('challenge_id',id).limit(1));if(submissions?.length)throw new HttpError(409,'This challenge has submissions. Create a new challenge to change its requirements.');return NextResponse.json(checked(await db().from('Challenges').update({...p.data,updated_at:new Date().toISOString()}).eq('id',id).eq('professor_id',u.id).select().single()))}catch(e){return apiError(e)}}
