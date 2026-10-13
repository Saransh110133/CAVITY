export type LoginRole='student'|'professor';
export function roleSignInError(provider:string,intent:string|undefined,existingRole:string|undefined):string|null {
 if((intent==='professor'||existingRole==='professor')&&provider!=='google')return 'ProfessorGoogleRequired';
 if(intent==='professor'&&existingRole!=='professor')return 'ProfessorApprovalRequired';
 if(intent==='student'&&existingRole==='professor')return 'UseProfessorSignIn';
 return null;
}
