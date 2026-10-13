import {requireSectionProfile} from '@/lib/sections-server';
import {ShortlistList} from '@/components/shortlist-list';
import type {Shortlist} from '@/types';
import {Avatar} from '@/components/avatar';
import Link from 'next/link';
import {redirect} from 'next/navigation';
import {requireUser} from '@/lib/auth';
import {db,checked} from '@/lib/db';
import {ProfileStats} from '@/components/profile-stats';
import {ProfileAbout} from '@/components/profile-about';
import {PreparationChecklist} from '@/components/preparation-checklist';
import type {Profile} from '@/types';
export default async function Dashboard(){const user=await requireUser();requireSectionProfile(user);if(user.role==='professor')redirect('/professor');const profile=checked(await db().from('Profiles').select('*').eq('user_id',user.id).single()) as Profile;const shortlists=checked(await db().from('Shortlists').select('*,Companies(*),professor:Users!professor_id(name)').eq('student_id',user.id).order('created_at',{ascending:false})) as Shortlist[];return <><div className="dashboard-heading"><div className="student-welcome"><Avatar name={user.name} photo={profile.avatar_data}/><div><p className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</p><h1>Welcome back, {user.name.split(' ')[0]}<span className="text-brand">.</span></h1><p>Your projects, practice, and preparation in one place.</p></div></div><Link className="secondary" href="/profile">Edit profile ↗</Link></div><div className="stat-strip"><div className="stat-cell"><p className="stat-label">Composite score</p><strong>{Number(profile.composite_score).toFixed(1)}</strong><small>Out of 100 / coding activity and profile</small></div><div className="stat-cell"><p className="stat-label">Profile completeness</p><strong>{Math.round(profile.completeness_score)}%</strong><small>Profile fields and fetched statistics</small></div><div className="stat-cell"><p className="stat-label">GitHub projects</p><strong>{profile.github_stats?.repo_count??'—'}</strong><small>Public non-fork repositories</small></div></div><div className="content-columns"><div className="space-y-6"><ProfileStats profile={profile} editable={user.role==='student'}/><PreparationChecklist/></div><ProfileAbout bio={profile.bio} skills={profile.skills}/></div><section className="mt-6"><div className="section-title"><h2>Professor updates</h2><Link href="/community">View challenge feedback ↗</Link></div><ShortlistList items={shortlists}/></section></>}
