import {NextResponse} from 'next/server';
import {currentUser} from '@/lib/auth';
import {authorize,apiError,HttpError} from '@/lib/api';
import {checked,db} from '@/lib/db';
import {z} from 'zod';
const taskInput=z.object({title:z.string().trim().min(1).max(160)});
const taskUpdate=z.object({id:z.uuid(),completed:z.boolean()});
export async function GET(){try{const user=await currentUser();if(!user)throw new HttpError(401,'Please sign in.');if(user.role!=='student')throw new HttpError(403,'Student access required.');return NextResponse.json(checked(await db().from('PreparationTasks').select('id,title,completed,created_at').eq('user_id',user.id).order('created_at')))}catch(e){return apiError(e)}}
export async function POST(req:Request){try{const user=await authorize(req,'student');const p=taskInput.safeParse(await req.json());if(!p.success)throw new HttpError(400,'Enter a task between 1 and 160 characters.');const task=checked(await db().from('PreparationTasks').insert({user_id:user.id,title:p.data.title}).select('id,title,completed,created_at').single());return NextResponse.json(task,{status:201})}catch(e){return apiError(e)}}
export async function PATCH(req:Request){try{const user=await authorize(req,'student');const p=taskUpdate.safeParse(await req.json());if(!p.success)throw new HttpError(400,'Invalid task.');const task=checked(await db().from('PreparationTasks').update({completed:p.data.completed}).eq('id',p.data.id).eq('user_id',user.id).select('id,title,completed,created_at').maybeSingle());if(!task)throw new HttpError(404,'Task not found.');return NextResponse.json(task)}catch(e){return apiError(e)}}
export async function DELETE(req:Request){try{const user=await authorize(req,'student');const p=z.object({id:z.uuid()}).safeParse(await req.json());if(!p.success)throw new HttpError(400,'Invalid task.');const rows=checked(await db().from('PreparationTasks').delete().eq('id',p.data.id).eq('user_id',user.id).select('id'));if(!rows?.length)throw new HttpError(404,'Task not found.');return NextResponse.json({ok:true})}catch(e){return apiError(e)}}
