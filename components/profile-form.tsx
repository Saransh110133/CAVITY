'use client';
import {useEffect,useRef,useState} from 'react';
import {useRouter} from 'next/navigation';
import type {Profile,User} from '@/types';
import {ProfileFields,readProfileForm,EditableProfile} from './profile-fields';
export function ProfileForm({user,profile}:{user:User;profile:Profile}) {
 const router=useRouter();const started=useRef(false);const [busy,setBusy]=useState(false);const [message,setMessage]=useState('');
 const values:EditableProfile={name:user.name,department:user.department??'',bio:profile.bio??'',skills:profile.skills??[],leetcode_username:profile.leetcode_username??'',linkedin_url:profile.linkedin_url??''};
 async function save(input:EditableProfile) {setBusy(true);setMessage('');try {const res=await fetch('/api/profile',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(input)});const data=await res.json();if(!res.ok)throw new Error(data.error);setMessage(data.warnings?.length?`Profile saved. ${data.warnings.join(' ')}`:'Profile saved. Your scores are up to date.');router.refresh()}catch(e){setMessage(e instanceof Error?e.message:'Unable to save profile.')}finally{setBusy(false)}}
 useEffect(()=>{if(!started.current&&!profile.github_stats){started.current=true;void save(values)}},[]);
 return <form className="card space-y-6" onSubmit={e=>{e.preventDefault();void save(readProfileForm(e.currentTarget))}}><h2 className="text-xl font-bold">Edit student profile</h2><div className="grid gap-4 sm:grid-cols-2"><label>College email<input value={user.email} disabled/></label><label>Connected GitHub<input value={profile.github_username?`github.com/${profile.github_username}`:'Linked through sign-in'} disabled/></label></div><ProfileFields value={values}/><p className="muted">GitHub identity is linked through OAuth. Skills, LeetCode, and LinkedIn ownership are self-reported. Coding stats refresh at most once every five minutes after a successful fetch.</p><button className="btn" disabled={busy}>{busy?'Saving profile & fetching activity…':'Save profile & refresh stats'}</button>{message&&<p role="status" className="rounded-lg bg-slate-100 p-4 text-sm leading-6">{message}</p>}</form>
}
