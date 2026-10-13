import {scopedStudent} from '@/lib/sections-server';
import {NextResponse} from 'next/server';
import {authorize,apiError,HttpError} from '@/lib/api';
import {db,checked} from '@/lib/db';
import {shortlistSchema} from '@/lib/validation';
export async function POST(req:Request){try{const user=await authorize(req,'professor');const p=shortlistSchema.safeParse(await req.json());if(!p.success)throw new HttpError(400,p.error.issues[0].message);await scopedStudent(user,p.data.student_id);checked(await db().from('Shortlists').upsert({...p.data,professor_id:user.id},{onConflict:'professor_id,student_id,company_id'}));return NextResponse.json({ok:true})}catch(e){return apiError(e)}}
