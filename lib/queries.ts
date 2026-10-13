import 'server-only';
import {db,checked} from './db';
import type {Shortlist} from '@/types';
export async function shortlistsFor(id:string,role:'student'|'professor') {let q=db().from('Shortlists').select('*,Companies(*),student:Users!Shortlists_student_id_fkey!inner(name,department,section),professor:Users!Shortlists_professor_id_fkey(name)').eq(role==='professor'?'professor_id':'student_id',id);if(role==='professor'){const u=checked(await db().from('Users').select('teaching_sections').eq('id',id).eq('role','professor').single());if(!u?.teaching_sections?.length)return [];q=q.in('student.section',u.teaching_sections)}return checked(await q.order('created_at',{ascending:false})) as unknown as Shortlist[]}
export function pageNumber(value?:string){const n=Number(value);return Number.isSafeInteger(n)&&n>0?Math.min(n,100000):1}
export const PAGE_SIZE=20;
