import './globals.css';
import Script from 'next/script';
import type {Metadata} from 'next';
import {currentUser} from '@/lib/auth';
import {authConfiguration} from '@/lib/auth-config';
import {AppShell} from '@/components/app-shell';
export const metadata:Metadata={title:{default:'CAVITY · Your placement workspace',template:'%s · CAVITY'},description:'Build your student profile, connect your coding activity, and prepare for your next chapter.'};
const themeScript=`(function(){try{var t=localStorage.getItem('cavity-theme-cyan');var d=t!=='light';document.documentElement.classList.toggle('dark',d);document.documentElement.style.colorScheme=d?'dark':'light'}catch(e){}})()`;
export default async function Layout({children}:{children:React.ReactNode}){const user=await currentUser();return <html lang="en" className="dark" suppressHydrationWarning><head><Script id="cavity-theme" strategy="beforeInteractive" dangerouslySetInnerHTML={{__html:themeScript}}/></head><body><AppShell authConfig={{domain:process.env.ALLOWED_EMAIL_DOMAIN??'college',github:authConfiguration(process.env,'github').ready,google:authConfiguration(process.env,'google').ready}} signedIn={!!user} name={user?.name} role={user?.role}>{children}</AppShell></body></html>}
