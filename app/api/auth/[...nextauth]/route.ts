import NextAuth from 'next-auth';
import {authOptions} from '@/lib/auth';
import {authConfiguration} from '@/lib/auth-config';
import {NextRequest,NextResponse} from 'next/server';
const handler=NextAuth(authOptions);
type Context={params:Promise<{nextauth:string[]}>};
async function guardedHandler(req:NextRequest,context:Context) {
 const {nextauth}=await context.params;
 if(['signin','callback'].includes(nextauth[0])&&!authConfiguration(process.env,nextauth[1]==='google'?'google':'github').ready) {
  const url=new URL('/login?error=Configuration',req.url).toString();
  if(req.method==='POST'&&(await req.clone().text()).includes('json=true'))return NextResponse.json({url});
  return NextResponse.redirect(url,303);
 }
 return handler(req,context);
}
export {guardedHandler as GET,guardedHandler as POST};
