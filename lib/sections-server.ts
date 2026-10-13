import 'server-only';
import {redirect} from 'next/navigation';
import {db,checked} from './db';
import {HttpError} from './api';
import {SECTIONS,sharesSection} from './sections';
import type {User} from '@/types';
export function assignedSections(u:User){return u.role==='professor'?(u.teaching_sections??[]).filter(s=>SECTIONS.includes(s)):u.section&&SECTIONS.includes(u.section)?[u.section]:[]}
export function requireSectionProfile(u:User){if(!assignedSections(u).length)redirect('/profile?sections=required')}
export function ensureSectionProfile(u:User){if(!assignedSections(u).length)throw new HttpError(403,'Select your class section in My profile first.')}
export async function scopedStudent(professor:User,id:string){ensureSectionProfile(professor);const student=checked(await db().from('Users').select('*').eq('id',id).eq('role','student').maybeSingle()) as User|null;if(!student||!sharesSection(student,professor))throw new HttpError(404,'Student not found in your teaching sections.');return student}
