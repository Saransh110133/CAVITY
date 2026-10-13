import {NextResponse} from 'next/server';
import {currentUser} from './auth';
import type {Role} from '@/types';
export class HttpError extends Error {constructor(public status:number,message:string){super(message)}}
export async function authorize(request:Request,role?:Role) {
 const origin=request.headers.get('origin');
 if(!origin || origin!==new URL(process.env.NEXTAUTH_URL??request.url).origin)throw new HttpError(403,'Request origin is not allowed.');
 const user=await currentUser();if(!user)throw new HttpError(401,'Please sign in.');if(role && user.role!==role)throw new HttpError(403,'Your account does not have access to this action.');return user;
}
export function apiError(e:unknown){if(e instanceof HttpError)return NextResponse.json({error:e.message},{status:e.status});console.error('Request failed:',e instanceof Error?e.name:'Unknown error');return NextResponse.json({error:'The request could not be saved. Check your connection and try again.'},{status:500})}
