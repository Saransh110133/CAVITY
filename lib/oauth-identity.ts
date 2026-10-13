import {allowedEmail} from './validation.ts';
export type GoogleIdentity={email?:string;email_verified?:boolean;hd?:string;sub?:string};
export function googleCollegeEmail(profile:GoogleIdentity,domain:string):string|null {
 if(profile.email_verified!==true||!profile.email||profile.hd?.toLowerCase()!==domain.trim().toLowerCase()||!allowedEmail(profile.email,domain))return null;
 return profile.email.trim().toLowerCase();
}
export function githubCollegeEmail(emails:{email:string;verified:boolean;primary:boolean}[],domain:string):string|null {
 return emails.filter(e=>e.verified===true&&allowedEmail(e.email,domain)).sort((a,b)=>Number(b.primary)-Number(a.primary))[0]?.email.trim().toLowerCase()??null;
}
