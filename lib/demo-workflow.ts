import {demoSharesSection,demoTeachingSections} from './sections';
import {DEMO_CHALLENGES,collegeToday,type Challenge,type Submission} from './challenges';
import {initialDemoProfile,DEMO_PROFILE_KEY,demoDisplayName} from './demo-profile';
import {profileSchema} from './validation';
import type {Company} from '@/types';
export const DEMO_STUDENT_ID='saransh';
const COMPANY_KEY='cavity-demo-companies',CHALLENGE_KEY='cavity-demo-challenges',SHORTLIST_KEY='cavity-demo-shortlists';
export function demoStudent(){try{const p=profileSchema.safeParse(JSON.parse(localStorage.getItem(DEMO_PROFILE_KEY)??'null'));if(p.success)return {...initialDemoProfile,...p.data,name:demoDisplayName(p.data.name)}}catch{}return initialDemoProfile}
export function readDemoChallenges(){try{const stored=JSON.parse(localStorage.getItem(CHALLENGE_KEY)??'null');if(Array.isArray(stored))return stored as Challenge[]}catch{}return DEMO_CHALLENGES}
export function saveDemoChallenge(c:Challenge){if(!demoTeachingSections().length)throw Error('Select teaching sections in My profile first.');localStorage.setItem(CHALLENGE_KEY,JSON.stringify([c,...readDemoChallenges().filter(v=>v.id!==c.id)]))}
export function studentDemoChallenges(){if(!demoSharesSection())return [];return readDemoChallenges().filter(c=>c.published&&c.release_date<=collegeToday())}
export function readDemoSubmission(id:string):Submission|null{try{const s=JSON.parse(localStorage.getItem(`cavity-challenge-${id}`)??'null');return s?{...s,id:`demo-${id}`,student:{name:demoStudent().name}}:null}catch{return null}}
export function saveDemoSubmission(s:Submission){if(!demoSharesSection())throw Error('This student is outside the professor teaching sections.');localStorage.setItem(`cavity-challenge-${s.challenge_id}`,JSON.stringify(s))}
export function allDemoSubmissions(){if(!demoSharesSection())return [];return readDemoChallenges().flatMap(c=>{const s=readDemoSubmission(c.id);return s?[s]:[]})}
export function readDemoCompanies():Company[]{try{const data=JSON.parse(localStorage.getItem(COMPANY_KEY)??'null');if(Array.isArray(data))return data}catch{}return []}
export function saveDemoCompanies(items:Company[]){localStorage.setItem(COMPANY_KEY,JSON.stringify(items))}
export type DemoShortlist={company_id:string;status:'pending'|'shortlisted'|'rejected';notes:string};
export function readDemoShortlists():DemoShortlist[]{try{return JSON.parse(localStorage.getItem(SHORTLIST_KEY)??'[]')}catch{return []}}
export function saveDemoShortlist(s:DemoShortlist){if(!demoSharesSection())throw Error('This student is outside your teaching sections.');localStorage.setItem(SHORTLIST_KEY,JSON.stringify([s,...readDemoShortlists().filter(v=>v.company_id!==s.company_id)]))}
