export const DEMO_PROFILE_KEY='cavity-demo-profile';
export const initialDemoProfile={name:'SARANSH',department:'Computer Science',bio:'Computer Science student who enjoys building useful web applications. I’m developing my full-stack skills and practicing data structures to prepare for software engineering roles.',skills:['React','TypeScript','SQL','Problem solving'],leetcode_username:'aarav_codes',linkedin_url:''};

// Keep older sample profiles consistent without overwriting a student's custom name.
export function demoDisplayName(name?:string){return !name||name==='Aarav Mehta'?initialDemoProfile.name:name}
