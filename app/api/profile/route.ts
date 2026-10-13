import {NextRequest,NextResponse} from 'next/server';
import {getToken} from 'next-auth/jwt';
import {authorize,apiError,HttpError} from '@/lib/api';
import {db,checked} from '@/lib/db';
import {profileSchema} from '@/lib/validation';
import {fetchGitHub,fetchLeetCode} from '@/lib/integrations';
import {completeness,composite} from '@/lib/scoring';
import type {Profile} from '@/types';
export const maxDuration=60;
export async function POST(req:NextRequest) {
 try {
  const user=await authorize(req);
  const parsed=profileSchema.safeParse(await req.json());if(!parsed.success)throw new HttpError(400,parsed.error.issues[0].message);
  const input=parsed.data;
  const profile=checked(await db().from('Profiles').select('*').eq('user_id',user.id).single()) as Profile;
  const token=await getToken({req,secret:process.env.NEXTAUTH_SECRET});
  const warnings:string[]=[];
  let github=profile.github_stats;
  let leetcode=input.leetcode_username===profile.leetcode_username?profile.leetcode_stats:null;
  const due=(time?:string)=>!time||Date.now()-Date.parse(time)>5*60*1000;
  await Promise.all([
   (async()=>{if(profile.github_username && due(github?.fetched_at)){try {if(token?.provider!=='github'||!token.accessToken)throw new Error('Missing token');const fresh=await fetchGitHub(profile.github_username,token.accessToken);fresh.repos=fresh.repos.map(r=>{const prior=github?.repos.find(old=>old.name===r.name);return {...r,project_note:prior?.project_note,insights:prior?.insights}});github=fresh}catch{warnings.push('GitHub could not refresh. Your last saved GitHub data is retained. Sign in again if this continues.')}}})(),
   (async()=>{if(input.leetcode_username && due(leetcode?.fetched_at)){try{leetcode=await fetchLeetCode(input.leetcode_username)}catch{warnings.push('LeetCode could not refresh. Check the username or try again later. Existing data is retained only for the same username.')}}else if(!input.leetcode_username)leetcode=null})()
  ]);
  const score=completeness({...input,github_username:profile.github_username,github_stats:github,leetcode_stats:leetcode});
  const saved=checked(await db().rpc('save_profile_details',{p_name:input.name??user.name,p_bio:input.bio,p_skills:input.skills,p_user_id:user.id,p_expected_updated_at:profile.updated_at,p_department:input.department,p_leetcode_username:input.leetcode_username||null,p_linkedin_url:input.linkedin_url||null,p_github_stats:github,p_leetcode_stats:leetcode,p_completeness:score,p_composite:composite(github,leetcode,score)}));
  if(!saved)throw new HttpError(409,'Your profile changed in another request. Reload and try again.');
  return NextResponse.json({ok:true,warnings});
 }catch(e){return apiError(e)}
}
