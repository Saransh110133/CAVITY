import {requireSectionProfile} from '@/lib/sections-server';
import {ChallengeWorkspace} from '@/components/community';
import {requireUser} from '@/lib/auth';
export default async function Page({params}:{params:Promise<{id:string}>}){const u=await requireUser('professor');requireSectionProfile(u);const {id}=await params;return <ChallengeWorkspace professor id={id}/>}
