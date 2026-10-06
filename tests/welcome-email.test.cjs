const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ts=require('typescript');
function load(file,mocks={},extra={}) {const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports,require:name=>mocks[name],URL,Date,...extra});return exports;}
const profile={email:'admin@example.com',userName:'User <script>alert(1)</script>',businessName:'Shop & Company'};
test('welcome template escapes identity, links to current routes and includes a text alternative',()=>{
 const {buildWelcomeEmail}=load('src/lib/welcome-email.ts');
 const message=buildWelcomeEmail(profile,'https://pos.example.com');
 assert.ok(message.html.includes('User &lt;script&gt;'));assert.ok(!message.html.includes('<script>'));assert.ok(message.html.includes('Shop &amp; Company'));
 for(const path of ['/dashboard','/settings','/products','/sales','/auth/login','/pos.png'])assert.ok(message.html.includes('https://pos.example.com'+path));
 assert.ok(message.text.includes('admin@example.com'));assert.ok(message.text.includes('El catálogo empieza desactivado'));assert.ok(message.html.includes('https://wa.me/593997702533'));assert.ok(!message.html.includes('token='));
});
test('welcome delivery uses admin address and sends both HTML and plain text',async()=>{
 let sent;
 const lib=load('src/lib/welcome-email.ts',{'@/lib/password-recovery':{recoveryMailConfig:()=>({origin:'https://pos.example.com'}),sendEmail:async(...args)=>{sent=args;return 'email-id';}}});
 assert.equal(await lib.sendWelcomeEmail(profile),'email-id');assert.equal(sent[0],profile.email);assert.ok(sent[2].includes('Para comenzar'));assert.ok(sent[3].includes('<html lang="es">'));
});
test('shared transport includes optional HTML in the provider payload',async()=>{
 let payload;
 const lib=load('src/lib/password-recovery.ts',{crypto:require('node:crypto')},{process:{env:{APP_URL:'https://pos.example.com',MAIL_FROM:'Simplio POS <no-reply@pos.example.com>',RESEND_API_KEY:'test-key'}},AbortSignal,fetch:async(url,options)=>{payload=JSON.parse(options.body);return {ok:true,status:200,json:async()=>({id:'email-id'})};}});
 await lib.sendEmail('admin@example.com','Welcome','Text','<p>Welcome</p>');assert.equal(payload.html,'<p>Welcome</p>');assert.equal(payload.text,'Text');
});
