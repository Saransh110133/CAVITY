import 'server-only';
import {currentUser} from './auth';
import {HttpError} from './api';
import {db,checked} from './db';
import {ensureSectionProfile} from './sections-server';
import {sharesSection} from './sections';
import type {User} from '@/types';
import {collegeToday} from './challenges';
export async function communityUser(){const u=await currentUser();if(!u)throw new HttpError(401,'Please sign in.');ensureSectionProfile(u);return u}
export async function visibleChallenge(id:string,u:User){ensureSectionProfile(u);const c=checked(await db().from('Challenges').select('*').eq('id',id).maybeSingle());if(!c||(u.role==='professor'?c.professor_id!==u.id:!c.published||c.release_date>collegeToday()))throw new HttpError(404,'Challenge not found.');if(u.role==='student'){const author=checked(await db().from('Users').select('role,teaching_sections').eq('id',c.professor_id).single());if(!author||!sharesSection(u,author))throw new HttpError(404,'Challenge not found in your section.')}return c}
