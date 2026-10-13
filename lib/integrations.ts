import type {GitHubStats,LeetCodeStats,Repo} from '@/types';
type Fetcher=typeof fetch;
async function jsonRequest(url:string,init:RequestInit,fetcher:Fetcher) {const r=await fetcher(url,{...init,cache:'no-store',signal:AbortSignal.timeout(12000)});if(!r.ok)throw new Error(`Provider returned ${r.status}`);return r.json()}
export async function fetchGitHub(username:string,token:string,fetcher:Fetcher=fetch):Promise<GitHubStats> {
 if(!/^[a-zA-Z0-9-]{1,39}$/.test(username))throw new Error('Invalid GitHub username');
 const headers={Authorization:`Bearer ${token}`,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'};
 const repos:Repo[]=[];
 for(let page=1;page<=10;page++) {
  const batch=await jsonRequest(`https://api.github.com/users/${encodeURIComponent(username)}/repos?type=owner&sort=updated&per_page=100&page=${page}`,{headers},fetcher);
  if(!Array.isArray(batch))throw new Error('Unexpected GitHub response');
  repos.push(...batch.filter((r:{fork:boolean})=>!r.fork).map((r:Repo)=>({name:r.name,html_url:r.html_url,description:r.description,language:r.language,stargazers_count:r.stargazers_count})));
  if(batch.length<100)break;
  if(page===10)throw new Error('Repository pagination limit exceeded');
 }
 const from=new Date(Date.now()-365*86400000).toISOString().slice(0,10);
 const commits=await jsonRequest(`https://api.github.com/search/commits?q=${encodeURIComponent(`author:${username} committer-date:>=${from}`)}&per_page=1`,{headers},fetcher);
 if(typeof commits.total_count!=='number'||commits.incomplete_results)throw new Error('GitHub commit count unavailable');
 const languages:Record<string,number>={};repos.forEach(r=>{if(r.language)languages[r.language]=(languages[r.language]??0)+1});
 return {repos,repo_count:repos.length,languages,contribution_count:commits.total_count,contribution_label:'Public commits in the last 365 days (GitHub REST search)',fetched_at:new Date().toISOString()};
}
export async function fetchLeetCode(username:string,fetcher:Fetcher=fetch):Promise<LeetCodeStats> {
 if(!/^[a-zA-Z0-9_-]{1,40}$/.test(username))throw new Error('Invalid LeetCode username');
 const payload=await jsonRequest('https://leetcode.com/graphql/',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query:'query PlacementStats($username: String!) { matchedUser(username: $username) { submitStatsGlobal { acSubmissionNum { difficulty count } } } userContestRanking(username: $username) { rating } }',variables:{username}})},fetcher);
 if(payload.errors?.length || !payload.data?.matchedUser)throw new Error('LeetCode profile unavailable');
 const counts=payload.data.matchedUser.submitStatsGlobal?.acSubmissionNum;
 if(!Array.isArray(counts))throw new Error('Unexpected LeetCode response');
 const count=(difficulty:string)=>{const n=counts.find((x:{difficulty:string})=>x.difficulty===difficulty)?.count;if(!Number.isInteger(n)||n<0)throw new Error('Invalid LeetCode count');return n as number};
 const rating=payload.data.userContestRanking?.rating??null;
 if(rating!==null && (typeof rating!=='number'||!Number.isFinite(rating)||rating<0))throw new Error('Invalid contest rating');
 return {easy:count('Easy'),medium:count('Medium'),hard:count('Hard'),contest_rating:rating===null?null:Math.round(rating),fetched_at:new Date().toISOString()};
}
