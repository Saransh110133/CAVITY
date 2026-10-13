import {requireSectionProfile} from '@/lib/sections-server';
import {Community} from '@/components/community';
import {requireUser} from '@/lib/auth';
export default async function Page(){const u=await requireUser('professor');requireSectionProfile(u);return <Community professor/>}
