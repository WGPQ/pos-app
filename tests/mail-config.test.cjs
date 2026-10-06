const {test}=require('node:test');
const assert=require('node:assert/strict');
const ts=require('typescript');
const fs=require('node:fs');
const vm=require('node:vm');
function load(env,fetch){const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lib/password-recovery.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports,require:()=>require('node:crypto'),process:{env},URL,fetch,AbortSignal});return exports;}
const env={NODE_ENV:'production',APP_URL:'https://pos.example.com',RESEND_API_KEY:'test-key',MAIL_FROM:'POS <no-reply@pos.example.com>'};
test('normalizes surrounding quotes and whitespace in deployed env values',()=>{const lib=load({...env,MAIL_FROM:' "POS <no-reply@pos.example.com>" ',APP_URL:' "https://pos.example.com" '});assert.equal(lib.recoveryMailConfig().from,env.MAIL_FROM);assert.equal(lib.recoveryMailConfig().origin,env.APP_URL);});
test('rejects HTTP origin in production',()=>{assert.throws(()=>load({...env,APP_URL:'http://localhost:3000'}).recoveryMailConfig());});
test('reports rejected field without exposing provider message',async()=>{const lib=load(env,async()=>({ok:false,status:422,json:async()=>({name:'validation_error',message:'Invalid `from` field. Sensitive details'})}));await assert.rejects(lib.sendRecoveryEmail('user@example.com','token'),error=>error.invalidField==='from'&&error.status===422&&!error.message.includes('Sensitive'));});
