import type {Metadata} from 'next';
import {StudentDemo} from '@/components/student-demo';
export const metadata:Metadata={title:'Student demo dashboard'};
export default function Demo(){return <StudentDemo/>}
