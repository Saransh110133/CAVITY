export type Role = 'student' | 'professor';
export type User = {section?:string|null;teaching_sections?:string[];id:string;name:string;email:string;role:Role;department:string|null;created_at:string};
export type Repo = {project_note?:string;insights?:RepoInsights;name:string;html_url:string;description:string|null;language:string|null;stargazers_count:number};
export type GitHubStats = {repos:Repo[];repo_count:number;languages:Record<string,number>;contribution_count:number;contribution_label:string;fetched_at:string};
export type LeetCodeStats = {easy:number;medium:number;hard:number;contest_rating:number|null;fetched_at:string};
export type Profile = {avatar_data?:string|null;bio:string;skills:string[];id:string;user_id:string;github_username:string|null;leetcode_username:string|null;linkedin_url:string|null;github_stats:GitHubStats|null;leetcode_stats:LeetCodeStats|null;completeness_score:number;composite_score:number;updated_at:string};
export type Student = User & {Profiles:Profile|null};
export type Company = {id:string;name:string;domain:string;required_skills:string[];created_at:string};
export type Shortlist = {id:string;professor_id:string;student_id:string;company_id:string;status:'pending'|'shortlisted'|'rejected';notes:string;created_at:string;Companies:Company;student:{name:string;department:string|null};professor:{name:string}};

export type RepoInsights={fetched_at:string;commit:string;stars:number;forks:number;watchers:number;open_issues:number;size_kb:number;license:string|null;pushed_at:string;languages:Record<string,number>;dependencies:{name:string;version:string;kind:string;file:string}[];tools:string[];traffic:{views:number;visitors:number;clones:number|null;cloners:number|null}|null;traffic_note:string;lines:{total:number;nonblank:number;files:number;eligible:number;partial:boolean};warnings:string[]};
