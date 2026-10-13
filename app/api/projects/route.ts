import {NextRequest,NextResponse} from 'next/server';
import {getToken} from 'next-auth/jwt';
import {z} from 'zod';
import {authorize,apiError,HttpError} from '@/lib/api';
import {db,checked} from '@/lib/db';
import {fetchRepoInsights} from '@/lib/repo-insights';
import type {Profile} from '@/types';
export const maxDuration=60;
const schema=z.discriminatedUnion('action',[z.object({action:z.literal('describe'),repo:z.string().regex(/^[\w.-]{1,100}$/),note:z.string().trim().max(3000)}).strict(),z.object({action:z.literal('refresh'),repo:z.string().regex(/^[\w.-]{1,100}$/)}).strict()]);
export async function POST(req:NextRequest){try{const user=await authorize(req,'student');const input=schema.safeParse(await req.json());if(!input.success)throw new HttpError(400,'Choose a repository and a description of up to 3,000 characters.');const p=checked(await db().from('Profiles').select('*').eq('user_id',user.id).single()) as Profile;const repo=p.github_stats?.repos.find(r=>r.name===input.data.repo);if(!repo||!p.github_username||!p.github_stats)throw new HttpError(404,'Refresh your GitHub profile first.');const updated={...repo};
 if(input.data.action==='describe')updated.project_note=input.data.note;
 else {if(repo.insights&&Date.now()-Date.parse(repo.insights.fetched_at)<300000)return NextResponse.json({repo,cached:true});const token=await getToken({req,secret:process.env.NEXTAUTH_SECRET});if(token?.provider!=='github'||!token.accessToken)throw new HttpError(400,'Sign in with GitHub to refresh repository evidence.');updated.insights=await fetchRepoInsights(p.github_username,repo.name,token.accessToken as string)}
 const saved=checked(await db().from('Profiles').update({github_stats:{...p.github_stats,repos:p.github_stats.repos.map(r=>r.name===repo.name?updated:r)},updated_at:new Date().toISOString()}).eq('user_id',user.id).eq('updated_at',p.updated_at).select('id').maybeSingle());if(!saved)throw new HttpError(409,'Profile changed during this scan. Reload and try again.');return NextResponse.json({repo:updated});}catch(e){return apiError(e)}}
