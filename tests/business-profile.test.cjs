const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
function load(file,mocks={}) {
 const exports={};
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 vm.runInNewContext(code,{exports,require:name=>mocks[name],URL,Request,process,Error});return exports;
}
const profile=load('src/lib/business-profile.ts');
const logo='https://res.cloudinary.com/my-cloud/image/upload/v123/business/7/profile/avatar.png';
test('accepts business avatar and allows removal; normalizes name',()=>{
 const result=profile.parseBusinessProfile({name:' Company ',logoUrl:logo},'my-cloud',7);
 assert.equal(result.name,'Company');assert.equal(result.logoUrl,logo);
 assert.equal(profile.parseBusinessProfile({name:'Company',logoUrl:null},'my-cloud',7).logoUrl,null);
});
test('rejects foreign business images, foreign clouds and invalid names',()=>{
 for(const logoUrl of [logo.replace('/7/','/8/'),logo.replace('my-cloud','other'),logo.replace('https:','http:'),'https://example.com/a.png','javascript:alert(1)',logo+'?x=1']) assert.throws(()=>profile.parseBusinessProfile({name:'Company',logoUrl},'my-cloud',7));
 for(const name of ['', '  ', 'a'.repeat(101)]) assert.throws(()=>profile.parseBusinessProfile({name,logoUrl:null},'my-cloud',7));
});
test('update is permission gated, tenant scoped and audited atomically',async()=>{
 let denied=true;const events=[];
 const route=load('src/app/api/business/route.ts',{
  'next/server':{NextResponse:{json:(body,options)=>({body,status:options?.status||200})}},
  '@/lib/authorization':{requireApiPermission:async key=>{assert.equal(key,'business.settings.update');return denied?{status:403}:null},getAuthorizationContext:async()=>({businessId:7,userId:2,membershipId:3})},
  '@/lib/business-profile':profile,
  '@/lib/prisma':{prisma:{$transaction:async(fn,options)=>{assert.equal(options.timeout,30000);return fn({business:{update:async args=>{assert.equal(args.where.id,7);assert.equal(args.data.name,'Company');events.push('update');return {name:'Company',logoUrl:null}}}})}}},
  '@/lib/audit':{writeAuditLog:async(tx,event)=>{assert.equal(event.businessId,7);events.push('audit')}},
 });
 const request=()=>new Request('http://localhost/api/business',{method:'PATCH',body:JSON.stringify({name:'Company',logoUrl:null,businessId:999})});
 assert.equal((await route.PATCH(request())).status,403);assert.equal(events.length,0);
 denied=false;assert.equal((await route.PATCH(request())).status,200);assert.deepEqual(events,['update','audit']);
});

test('contact fields normalize, clear explicitly and preserve omitted values',()=>{
 const result=profile.parseBusinessProfile({name:'Company',logoUrl:null,address:'  Main street  ',email:' shop@example.com ',phone:' +593 99 123 4567 '},'my-cloud',7);
 assert.equal(result.address,'Main street');assert.equal(result.email,'shop@example.com');assert.equal(result.phone,'+593 99 123 4567');
 const cleared=profile.parseBusinessProfile({name:'Company',logoUrl:null,address:' ',email:null,phone:''},'my-cloud',7);
 for(const key of ['address','email','phone']) assert.equal(cleared[key],null);
 const omitted=profile.parseBusinessProfile({name:'Company',logoUrl:null},'my-cloud',7);
 for(const key of ['address','email','phone']) assert.equal(Object.hasOwn(omitted,key),false);
 for(const invalid of [{email:'bad'},{email:'a@example.com\nBcc: x@y.com'},{phone:'javascript:alert(1)'},{phone:'123'},{address:'x'.repeat(301)},{email:23}]) assert.throws(()=>profile.parseBusinessProfile({name:'Company',logoUrl:null,...invalid},'my-cloud',7));
});
