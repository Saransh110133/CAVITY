import {requireSectionProfile} from '@/lib/sections-server';
import Link from 'next/link';
import {requireUser} from '@/lib/auth';
import {shortlistsFor} from '@/lib/queries';
import {Heading} from '@/components/ui';
import {ShortlistList} from '@/components/shortlist-list';
export default async function Shortlists(){const u=await requireUser('professor');requireSectionProfile(u);const items=await shortlistsFor(u.id,'professor');return <><Heading eyebrow="Professor workspace" title="My shortlists" description="Manage your recommendations and share next steps with students." action={<Link className="btn" href="/professor">Browse students →</Link>}/><ShortlistList items={items} professor/></>}
