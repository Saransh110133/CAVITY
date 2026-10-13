import {PreparationChecklist} from '@/components/preparation-checklist';
import {Heading} from '@/components/ui';
export const metadata={title:'My preparation'};
export default function Page(){return <><Heading eyebrow="Personal workspace" title="Small steps. Real progress." description="Turn your preparation into a few things you can act on today."/><PreparationChecklist demo/></>}
