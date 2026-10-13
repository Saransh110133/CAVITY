import {z} from 'zod';
export const SECTIONS=Array.from({length:50},(_,i)=>`CS ${i+1}`);
export const sectionSchema=z.string().refine(s=>SECTIONS.includes(s),'Choose a section from CS 1 to CS 50.');
export const studentSectionsSchema=z.object({section:sectionSchema}).strict();
export const professorSectionsSchema=z.object({teaching_sections:z.array(sectionSchema).min(1,'Select at least one teaching section.').max(50).refine(s=>new Set(s).size===s.length,'Select each section only once.')}).strict();
export function sharesSection(student:{role?:string;section?:string|null},professor:{role?:string;teaching_sections?:string[]}){return student.role!=='professor'&&professor.role!=='student'&&!!student.section&&SECTIONS.includes(student.section)&&(professor.teaching_sections??[]).includes(student.section)}
export const DEMO_STUDENT_SECTION_KEY='cavity-demo-student-section';
export const DEMO_TEACHING_SECTIONS_KEY='cavity-demo-teaching-sections';
export function demoStudentSection():string|null{try{const s=localStorage.getItem(DEMO_STUDENT_SECTION_KEY);return s&&SECTIONS.includes(s)?s:null}catch{return null}}
export function demoTeachingSections():string[]{try{const p=professorSectionsSchema.safeParse({teaching_sections:JSON.parse(localStorage.getItem(DEMO_TEACHING_SECTIONS_KEY)??'[]')});return p.success?p.data.teaching_sections:[]}catch{return []}}
export function demoSharesSection(){return sharesSection({section:demoStudentSection()},{teaching_sections:demoTeachingSections()})}
