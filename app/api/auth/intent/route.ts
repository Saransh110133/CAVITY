import {NextRequest,NextResponse} from 'next/server';
export async function POST(req:NextRequest){
 if(req.headers.get('origin')!==new URL(process.env.NEXTAUTH_URL??req.url).origin)return NextResponse.json({error:'Invalid origin'},{status:403});
 let body;try{body=await req.json()}catch{return NextResponse.json({error:'Invalid request'},{status:400})}
 if(!['student','professor'].includes(body?.role))return NextResponse.json({error:'Choose a role'},{status:400});
 const response=NextResponse.json({ok:true});response.cookies.set('cavity-login-role',body.role,{httpOnly:true,sameSite:'lax',secure:new URL(process.env.NEXTAUTH_URL??req.url).protocol==='https:',path:'/',maxAge:600});return response;
}
