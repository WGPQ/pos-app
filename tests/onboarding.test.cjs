const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ts=require('typescript');
function load(path,mocks={}) {
 const exports={};
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports,require:name=>mocks[name],Error,Date});
 return exports;
}
const validation=load('src/lib/onboarding-input.ts');
const input={businessName:' Luz Luna ',businessEmail:' COMPANY@example.com ',phone:'+593 99 123 4567',businessType:'',useBusinessProfile:true,password:'secure-password-123',confirmation:'secure-password-123'};
test('company profile supplies administrator defaults without requiring a business type',()=>{
 const data=validation.parseOnboarding(input);assert.equal(data.userName,'Luz Luna');assert.equal(data.email,'company@example.com');assert.equal(data.businessType,null);
});
test('custom administrator and other business type are validated independently',()=>{
 const data=validation.parseOnboarding({...input,useBusinessProfile:false,userName:' Admin ',userEmail:' ADMIN@example.com ',businessType:'other',otherBusinessType:' Ferretería '});
 assert.equal(data.userName,'Admin');assert.equal(data.email,'admin@example.com');assert.equal(data.businessType,'Ferretería');
 for(const patch of [{businessType:'other',otherBusinessType:''},{businessType:'unknown'},{password:'short'},{confirmation:'different'},{phone:'0991234567'},{businessEmail:'invalid'},{useBusinessProfile:false,userName:'Admin',userEmail:''},{useBusinessProfile:'yes'}]) assert.throws(()=>validation.parseOnboarding({...input,...patch}));
 assert.equal(validation.parseOnboarding({...input,businessType:'stationery'}).businessType,'Papelería');
});
function fixture({duplicate=false,failSession=false,rateLimited=false,failWelcome=false}={}) {
 const records=[];let cookie=false;let hashBeforeTransaction=false;let committed=false;let welcomeCount=0;
 const route=load('src/app/api/auth/register/route.ts',{
  '@/lib/welcome-email':{sendWelcomeEmail:async profile=>{assert.equal(committed,true);assert.equal(profile.email,'company@example.com');welcomeCount++;if(failWelcome)throw Error('provider failed');}},
  '@/lib/password-recovery':{RecoveryEmailError:class extends Error{}},
  crypto:require('node:crypto'),argon2:{argon2id:2,hash:async()=>{hashBeforeTransaction=true;return 'hashed-password';}},
  'next/server':{NextResponse:{json:(body,options)=>({body,status:options?.status||200})}},
  '@/lib/auth':{setSessionCookie:(response,token)=>{assert.ok(token);cookie=true;}},
  '@/lib/onboarding-input':validation,
  '@/lib/login-rate-limit':{loginRateLimitKey:()=> 'ip',isLoginRateLimited:()=>rateLimited?30:0,recordFailedLogin:()=>{}},
  '@/lib/audit':{writeAuditLog:async(tx,event)=>{assert.ok(!JSON.stringify(event).includes('secure-password'));records.push(['audit',event]);}},
  '@/lib/prisma':{prisma:{$transaction:async(fn,options)=>{
   assert.equal(hashBeforeTransaction,true);assert.equal(options.timeout,30000);
   const create=(model,result)=>async({data})=>{records.push([model,data]);return result;};
   const tx={user:{create:async args=>{if(duplicate)throw {code:'P2002',meta:{target:['email']}};return create('user',{id:1})(args);}},role:{findUniqueOrThrow:async({where})=>{assert.equal(where.key,'ADMIN');return {id:2};}},business:{create:create('business',{id:3})},branch:{create:create('branch',{id:4})},businessMembership:{create:create('membership',{id:5})},session:{create:async args=>{if(failSession)throw Error('db failure');return create('session',{id:'s'})(args);}}};
   try{const result=await fn(tx);committed=true;return result;}catch(e){records.length=0;throw e;}
  }}},
 });
 return {route,records,cookie:()=>cookie,welcomeCount:()=>welcomeCount};
}
const request=()=>new Request('http://localhost/api/auth/register',{method:'POST',body:JSON.stringify(input)});
test('creates tenant, principal branch, admin access and session together with safe defaults',async()=>{
 const f=fixture();const result=await f.route.POST(request());assert.equal(result.status,201);assert.equal(result.body.redirectTo,'/dashboard');assert.equal(f.cookie(),true);assert.equal(f.welcomeCount(),1);
 const business=f.records.find(([m])=>m==='business')[1];assert.equal(business.currency,'USD');assert.equal(business.catalogEnabled,false);assert.equal(business.email,'company@example.com');assert.equal(business.businessType,null);
 const user=f.records.find(([m])=>m==='user')[1];assert.equal(user.passwordHash,'hashed-password');
 const membership=f.records.find(([m])=>m==='membership')[1];assert.equal(membership.businessId,3);assert.equal(membership.roleId,2);assert.equal(membership.branches.create.branchId,4);
 const session=f.records.find(([m])=>m==='session')[1];assert.equal(session.activeBusinessId,3);assert.equal(session.activeBranchId,4);assert.equal(session.tokenHash.length,64);
});
test('duplicate email returns actionable conflict without creating a tenant or cookie',async()=>{
 const f=fixture({duplicate:true});const result=await f.route.POST(request());assert.equal(result.status,409);assert.equal(result.body.code,'EMAIL_EXISTS');assert.equal(f.records.length,0);assert.equal(f.cookie(),false);assert.equal(f.welcomeCount(),0);
});
test('session failure rolls back registration and never sets a cookie',async()=>{
 const f=fixture({failSession:true});assert.equal((await f.route.POST(request())).status,503);assert.equal(f.records.length,0);assert.equal(f.cookie(),false);assert.equal(f.welcomeCount(),0);
});
test('rate limiting rejects registration before password hashing or database writes',async()=>{
 const f=fixture({rateLimited:true});assert.equal((await f.route.POST(request())).status,429);assert.equal(f.records.length,0);assert.equal(f.cookie(),false);assert.equal(f.welcomeCount(),0);
});

test('welcome provider failure leaves successful registration and session intact',async()=>{
 const f=fixture({failWelcome:true});assert.equal((await f.route.POST(request())).status,201);assert.equal(f.cookie(),true);assert.equal(f.welcomeCount(),1);assert.ok(f.records.length>0);
});
