import {SectionSettings} from '@/components/section-settings';
import {ProfilePhoto} from '@/components/profile-photo';
import {ConnectedAccounts} from '@/components/connected-accounts';
import {requireUser} from '@/lib/auth';
import {db,checked} from '@/lib/db';
import type {Profile} from '@/types';
import {Heading,Metric} from '@/components/ui';
import {ProfileForm} from '@/components/profile-form';
import {ProfileStats} from '@/components/profile-stats';
export default async function ProfilePage(){const user=await requireUser();const profile=checked(await db().from('Profiles').select('*').eq('user_id',user.id).single()) as Profile;return <><Heading eyebrow="My profile" title={user.name} description="Keep your profile current so your professors can guide your next step."/><div className="mb-6 grid gap-4 sm:grid-cols-3"><Metric label="Profile completeness" value={`${Math.round(profile.completeness_score)}%`} detail="Department, links, and fetched statistics"/><Metric label="Composite score" value={Number(profile.composite_score).toFixed(1)} detail="Out of 100 points"/><Metric label="College role" value={user.role==='professor'?'Professor':'Student'} detail="Managed by your college administrator"/></div><SectionSettings role={user.role} section={user.section} teachingSections={user.teaching_sections}/><ProfilePhoto name={user.name} initialPhoto={profile.avatar_data}/><ConnectedAccounts githubUsername={profile.github_username} leetcodeUsername={profile.leetcode_username}/><div className="grid items-start gap-6 lg:grid-cols-2"><ProfileForm user={user} profile={profile}/><ProfileStats profile={profile} editable={user.role==='student'}/></div></>}
