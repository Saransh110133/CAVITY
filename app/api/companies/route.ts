import {currentUser} from '@/lib/auth';
import {NextResponse} from 'next/server';
import {authorize,apiError,HttpError} from '@/lib/api';
import {db,checked} from '@/lib/db';
import {companySchema} from '@/lib/validation';
import {z} from 'zod';
export async function POST(req:Request){try{await authorize(req,'professor');const p=companySchema.safeParse(await req.json());if(!p.success)throw new HttpError(400,p.error.issues[0].message);const {id,...data}=p.data;if(id)checked(await db().from('Companies').update(data).eq('id',id));else checked(await db().from('Companies').insert(data));return NextResponse.json({ok:true})}catch(e){return apiError(e)}}
export async function DELETE(req:Request){try{await authorize(req,'professor');const p=z.object({id:z.uuid()}).safeParse(await req.json());if(!p.success)throw new HttpError(400,'Invalid company.');checked(await db().from('Companies').delete().eq('id',p.data.id));return NextResponse.json({ok:true})}catch(e){return apiError(e)}}

export async function GET(){try{const u=await currentUser();if(!u)throw new HttpError(401,'Please sign in.');if(u.role!=='professor')throw new HttpError(403,'Professor access required.');return NextResponse.json(checked(await db().from('Companies').select('*').order('name')))}catch(e){return apiError(e)}}
