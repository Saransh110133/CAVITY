import test from 'node:test';
import assert from 'node:assert/strict';
import {roleSignInError} from '../lib/sign-in-role.ts';
test('students can authenticate through either provider',()=>{for(const provider of ['github','google'])assert.equal(roleSignInError(provider,'student','student'),null)});
test('professor access requires existing approval and Google',()=>{assert.equal(roleSignInError('google','professor',undefined),'ProfessorApprovalRequired');assert.equal(roleSignInError('google','professor','student'),'ProfessorApprovalRequired');assert.equal(roleSignInError('google','professor','professor'),null);assert.equal(roleSignInError('github','professor','professor'),'ProfessorGoogleRequired')});
test('changing or omitting login intent cannot bypass professor provider restriction',()=>{assert.equal(roleSignInError('github','student','professor'),'ProfessorGoogleRequired');assert.equal(roleSignInError('github',undefined,'professor'),'ProfessorGoogleRequired');assert.equal(roleSignInError('google','student','professor'),'UseProfessorSignIn')});
