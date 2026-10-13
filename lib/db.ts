import 'server-only';
import {createClient} from '@supabase/supabase-js';
export function configured() {return !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)}
export function db() {
 if(!configured()) throw new Error('Supabase is not configured. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env.local.');
 return createClient(process.env.SUPABASE_URL!,process.env.SUPABASE_SERVICE_ROLE_KEY!,{auth:{persistSession:false,autoRefreshToken:false}});
}
export function checked<T>({data,error}:{data:T;error:unknown}):T {if(error) {console.error('Database operation failed');throw new Error('The database request failed. Check the connection and migration.')}return data}
