'use client';
import {signIn,signOut} from 'next-auth/react';
import Link from 'next/link';
import {useState} from 'react';
export function AuthButtons({signedIn,startOAuth=false,provider='github',disabled=false,callbackUrl='/dashboard',loginRole='student'}:{signedIn:boolean;startOAuth?:boolean;provider?:'github'|'google';disabled?:boolean;callbackUrl?:string;loginRole?:'student'|'professor'}) {
 const [busy,setBusy]=useState(false),[error,setError]=useState('');
 if(!signedIn&&!startOAuth)return <Link className="secondary" href="/login">Sign in</Link>;
 return <div><button className="secondary" disabled={busy||disabled} onClick={async()=>{setBusy(true);setError('');try{if(signedIn)await signOut({callbackUrl:'/'});else {const intent=await fetch('/api/auth/intent',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({role:loginRole})});if(!intent.ok)throw Error('Unable to select role');await signIn(provider,{callbackUrl})}}catch{setError('Unable to reach sign-in. Check your connection and try again.')}finally{setBusy(false)}}}>{busy?'Please wait…':signedIn?'Sign out':`Continue with ${provider==='github'?'GitHub':'Google'}`}</button>{error&&<p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}</div>
}
