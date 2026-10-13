import {NextResponse} from 'next/server';
import {z} from 'zod';
import {authorize,apiError,HttpError} from '@/lib/api';
import {visibleChallenge} from '@/lib/community-server';
import {db,checked} from '@/lib/db';
export async function POST(r:Request,ctx:{params:Promise<{id:string}>}){try{const u=await authorize(r,'student');const {id}=await ctx.params;await visibleChallenge(id,u);const p=z.object({answer:z.string().trim().min(1).max(20000)}).safeParse(await r.json());if(!p.success)throw new HttpError(400,'Enter an answer of 1–20,000 characters.');return NextResponse.json(checked(await db().from('ChallengeSubmissions').upsert({challenge_id:id,student_id:u.id,answer:p.data.answer,status:'submitted',feedback:'',reviewed_by:null,updated_at:new Date().toISOString()},{onConflict:'challenge_id,student_id'}).select().single()))}catch(e){return apiError(e)}}
