import {NextResponse} from 'next/server';
import {authorize,apiError,HttpError} from '@/lib/api';
import {db,checked} from '@/lib/db';
import {studentSectionsSchema,professorSectionsSchema} from '@/lib/sections';
export async function PUT(req:Request){try{const u=await authorize(req);const body=await req.json();if(u.role==='student'){const p=studentSectionsSchema.safeParse(body);if(!p.success)throw new HttpError(400,p.error.issues[0].message);if(u.section){if(u.section!==p.data.section)throw new HttpError(409,'Your class section is locked and cannot be changed.');return NextResponse.json({ok:true})}
// The null predicate makes the first assignment atomic across concurrent requests.
const saved=checked(await db().from('Users').update({section:p.data.section}).eq('id',u.id).eq('role','student').is('section',null).select('id').maybeSingle());if(!saved)throw new HttpError(409,'Your section was already saved. Reload your profile.');
}else{const p=professorSectionsSchema.safeParse(body);if(!p.success)throw new HttpError(400,p.error.issues[0].message);checked(await db().from('Users').update({teaching_sections:p.data.teaching_sections}).eq('id',u.id).eq('role','professor'))}return NextResponse.json({ok:true})}catch(e){return apiError(e)}}
