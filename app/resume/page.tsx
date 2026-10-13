import {ResumeBuilder} from '@/components/resume-builder';
import {requireUser} from '@/lib/auth';
export default async function Page(){await requireUser('student');return <ResumeBuilder/>}
