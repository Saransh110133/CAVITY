import 'server-only';
import {cookies} from 'next/headers';
import {roleSignInError} from './sign-in-role';
import type {NextAuthOptions} from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import {getServerSession} from 'next-auth';
import {redirect} from 'next/navigation';
import {db,checked} from './db';
import {googleCollegeEmail,githubCollegeEmail,GoogleIdentity} from './oauth-identity';
import type {User,Role} from '@/types';
export const authOptions:NextAuthOptions={
 providers:[
  GitHubProvider({clientId:process.env.GITHUB_ID??'',clientSecret:process.env.GITHUB_SECRET??'',authorization:{params:{scope:'read:user user:email'}}}),
  GoogleProvider({clientId:process.env.GOOGLE_CLIENT_ID??'',clientSecret:process.env.GOOGLE_CLIENT_SECRET??'',authorization:{params:{scope:'openid email profile',prompt:'select_account',hd:process.env.ALLOWED_EMAIL_DOMAIN}}})
 ],
 secret:process.env.NEXTAUTH_SECRET,session:{strategy:'jwt',maxAge:8*60*60},pages:{signIn:'/login',error:'/login'},
 callbacks:{
  async signIn({user,account,profile}){
   if(!account||!['github','google'].includes(account.provider))return false;
   try{
    let email:string|null=null,login:string|null=null;
    if(account.provider==='google')email=googleCollegeEmail((profile??{}) as GoogleIdentity,process.env.ALLOWED_EMAIL_DOMAIN??'');
    else{
     if(!account.access_token)return false;
     const r=await fetch('https://api.github.com/user/emails',{headers:{Authorization:`Bearer ${account.access_token}`,Accept:'application/vnd.github+json'},cache:'no-store',signal:AbortSignal.timeout(10000)});
     if(!r.ok)return '/login?error=GitHubEmailUnavailable';
     const emails=await r.json();if(!Array.isArray(emails))return false;
     email=githubCollegeEmail(emails,process.env.ALLOWED_EMAIL_DOMAIN??'');
     login=(profile as {login?:string})?.login??null;if(!login)return false;
    }
    if(!email)return '/login?error=CollegeEmailRequired';
    const intent=(await cookies()).get('cavity-login-role')?.value;
    const existing=await db().from('Users').select('role').eq('email',email).maybeSingle();
    if(existing.error)return '/login?error=Configuration';
    const roleError=roleSignInError(account.provider,intent,existing.data?.role);
    if(roleError)return '/login?role=professor&error='+roleError;
    const result=await db().rpc('provision_oauth_user',{p_provider:account.provider,p_account_id:account.providerAccountId,p_email:email,p_name:user.name??login??email.split('@')[0],p_github_username:login});
    if(result.error){console.error('OAuth provisioning failed:',result.error.code);return result.error.message.includes('AccountMismatch')?'/login?error=AccountMismatch':'/login?error=Configuration'}
    if(!result.data)return false;
    user.id=result.data;user.email=email;return true;
   }catch{console.error('OAuth verification or provisioning failed');return '/login?error=Configuration'}
  },
  async jwt({token,account,user}){if(account&&user){token.uid=user.id;token.provider=account.provider;token.accessToken=account.provider==='github'?account.access_token:undefined}return token},
  async session({session,token}){if(session.user)session.user.id=token.uid as string;return session}
 }
};
export async function currentUser():Promise<User|null>{const session=await getServerSession(authOptions);if(!session?.user?.id)return null;return checked(await db().from('Users').select('*').eq('id',session.user.id).maybeSingle()) as User|null}
export async function requireUser(role?:Role){const user=await currentUser();if(!user)redirect('/login');if(role&&user.role!==role)redirect('/dashboard');return user}
