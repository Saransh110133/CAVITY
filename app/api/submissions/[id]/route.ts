import {scopedStudent} from '@/lib/sections-server';
import {NextResponse} from 'next/server';
import {z} from 'zod';
import {authorize,apiError,HttpError} from '@/lib/api';
import {visibleChallenge} from '@/lib/community-server';
import {db,checked} from '@/lib/db';
export async function PATCH(r:Request,ctx:{params:Promise<{id:string}>}){try{const u=await authorize(r,'professor');const {id}=await ctx.params;const s=checked(await db().from('ChallengeSubmissions').select('challenge_id,student_id').eq('id',id).maybeSingle());if(!s)throw new HttpError(404,'Submission not found.');await visibleChallenge(s.challenge_id,u);await scopedStudent(u,s.student_id);const p=z.object({feedback:z.string().trim().min(1).max(3000)}).safeParse(await r.json());if(!p.success)throw new HttpError(400,'Enter feedback of 1–3,000 characters.');return NextResponse.json(checked(await db().from('ChallengeSubmissions').update({feedback:p.data.feedback,status:'reviewed',reviewed_by:u.id,updated_at:new Date().toISOString()}).eq('id',id).select().single()))}catch(e){return apiError(e)}}
