import type {GitHubStats,LeetCodeStats} from '@/types';
export const SCORE_WEIGHTS = {github:0.4,leetcode:0.4,completeness:0.2} as const;
const clamp = (n:number)=>Math.min(100,Math.max(0,Number.isFinite(n)?n:0));
export function githubScore(stats:GitHubStats|null) {return stats?clamp(stats.contribution_count/365*70 + stats.repo_count/20*30):0}
export function leetcodeScore(stats:LeetCodeStats|null) {return stats?clamp((stats.easy+stats.medium*2+stats.hard*3)/600*80+Math.max(0,(stats.contest_rating??0)-1000)/1500*20):0}
export function completeness(fields:{department:string|null;github_username:string|null;leetcode_username:string|null;linkedin_url:string|null;github_stats:GitHubStats|null;leetcode_stats:LeetCodeStats|null}) {
 return [fields.department,fields.github_username,fields.leetcode_username,fields.linkedin_url,fields.github_stats,fields.leetcode_stats].filter(Boolean).length/6*100;
}
export function composite(github:GitHubStats|null,leetcode:LeetCodeStats|null,complete:number) {return Math.round(clamp(githubScore(github)*SCORE_WEIGHTS.github+leetcodeScore(leetcode)*SCORE_WEIGHTS.leetcode+clamp(complete)*SCORE_WEIGHTS.completeness)*100)/100}
