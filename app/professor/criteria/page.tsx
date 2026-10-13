import {CompanyCriteria} from '@/components/company-criteria';
import {requireUser} from '@/lib/auth';
export default async function Page(){await requireUser('professor');return <CompanyCriteria/>}
