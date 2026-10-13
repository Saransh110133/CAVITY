import {composite} from './scoring';
import type {GitHubStats,LeetCodeStats} from '@/types';
export const demoGitHub:GitHubStats={repo_count:12,contribution_count:248,languages:{TypeScript:6,Python:3,Java:2,CSS:1},contribution_label:'Sample public commits over 365 days',fetched_at:'2026-09-25T12:00:00Z',repos:[
 {name:'campus-connect',description:'A student community app with event discovery, club spaces, and real-time discussions.',language:'TypeScript',stargazers_count:18,html_url:''},
 {name:'dsa-practice',description:'Daily data structures and algorithms practice, with explanations and complexity notes.',language:'Java',stargazers_count:12,html_url:''},
 {name:'resume-match',description:'A Python tool that compares resume keywords with job descriptions and highlights skill gaps.',language:'Python',stargazers_count:9,html_url:''},
 {name:'study-room',description:'A collaborative study planner with focus sessions, shared notes, and progress tracking.',language:'TypeScript',stargazers_count:7,html_url:''},
 {name:'expense-tracker',description:'A responsive expense dashboard with category budgets and monthly summaries.',language:'TypeScript',stargazers_count:5,html_url:''},
 {name:'weather-cli',description:'A small command-line project for exploring APIs, caching, and reliable error handling.',language:'Python',stargazers_count:3,html_url:''}
]};
export const demoLeetCode:LeetCodeStats={easy:96,medium:112,hard:24,contest_rating:1642,fetched_at:'2026-09-25T12:00:00Z'};
export const demoScore=composite(demoGitHub,demoLeetCode,100);

// Explicitly fictional metrics for the interactive demo; never used as real GitHub evidence.
for(const [index,repo] of demoGitHub.repos.entries()){
 const language=repo.language??'TypeScript';const python=language==='Python',java=language==='Java';
 repo.insights={fetched_at:'2026-10-12T10:00:00Z',commit:'demo-snapshot',stars:repo.stargazers_count,forks:3+index,watchers:2+index,open_issues:index,size_kb:420+index*80,license:'MIT',pushed_at:'2026-10-10T00:00:00Z',languages:{[language]:18000+index*1200},dependencies:java?[]:python?[{name:'requests',version:'2.32.3',kind:'Python requirement',file:'requirements.txt'}]:[{name:'react',version:'^19.0.0',kind:'runtime',file:'package.json'},{name:'next',version:'^16.0.0',kind:'runtime',file:'package.json'},{name:'typescript',version:'^5.9.0',kind:'development',file:'package.json'}],tools:java?['Maven manifest']:python?['Python project manifest']:['Next.js configuration','TypeScript configuration','GitHub Actions'],traffic:{views:240+index*31,visitors:62+index*11,clones:17+index,cloners:9+index},traffic_note:'Fictional demo traffic · example 14-day window.',lines:{total:2450+index*360,nonblank:2020+index*300,files:24+index,eligible:24+index,partial:false},warnings:['All figures and dependencies on this demo project are sample data.']};
}
