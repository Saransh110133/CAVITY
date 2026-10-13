import {test} from 'node:test';
import assert from 'node:assert/strict';
import {profileSchema} from '../lib/validation.ts';
const base={name:'Student',department:'CS',bio:'I build web applications.',skills:['React','SQL'],leetcode_username:'',linkedin_url:'https://www.linkedin.com/in/student'};
test('profile saves descriptions, strengths, and valid professional links',()=>{const p=profileSchema.parse({...base,skills:['React','SQL','React']});assert.deepEqual(p.skills,['React','SQL']);assert.equal(p.bio,base.bio)});
test('profile rejects oversized bios, blank names, excess skills and unsafe links',()=>{for(const input of [{...base,bio:'x'.repeat(1201)},{...base,name:' '},{...base,skills:Array(31).fill('SQL')},{...base,linkedin_url:'javascript:alert(1)'}])assert(!profileSchema.safeParse(input).success)});
