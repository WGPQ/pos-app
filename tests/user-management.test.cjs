const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
function load(file, mocks) {
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  vm.runInNewContext(code, { exports, require: name => mocks[name], Date, Set, Number, Request });
  return exports;
}
const json = (body, options) => ({ body, status: options?.status || 200 });
const service = load('src/lib/user-management.ts', { '@prisma/client': require('@prisma/client'), 'next/server': { NextResponse: { json } } });
const context = { businessId: 1, membershipId: 10, userId: 20, branchId: 30, sessionId: 'current', permissions: new Set(['user.manage']) };
const input = { name: ' Ana ', email: 'ANA@example.com', password: 'secure-password', roleId: 2, branchIds: [30], status: 'ACTIVE' };
const permission = key => ({ permission: { key } });
function accessTx(actorKeys = ['user.manage'], roleKeys = ['user.manage'], branchCount = 1) {
  return { $queryRaw: async () => [], businessMembership: { findFirst: async () => actorKeys ? { role: { permissions: actorKeys.map(permission) } } : null }, role: { findUnique: async () => ({ permissions: roleKeys.map(permission) }) }, branch: { count: async () => branchCount } };
}
test('validates and normalizes user input; rejects invalid credentials and empty branches', () => {
  const result = service.parseUserInput({ ...input, branchIds: [30, 30] });
  assert.equal(result.email, 'ana@example.com'); assert.equal(result.name, 'Ana'); assert.equal(result.branchIds.length, 1);
  for (const change of [{ email: 'invalid' }, { branchIds: [] }, { branchIds: ['30'] }, { status: 'INVALID' }, { roleId: '2' }]) assert.throws(() => service.parseUserInput({ ...input, ...change }));
});
test('rejects higher roles, foreign/inactive branches, and revoked administrative authority', async () => {
  await assert.rejects(service.validateUserAccess(accessTx(['user.manage'], ['role.manage']), context, input));
  await assert.rejects(service.validateUserAccess(accessTx(['user.manage'], ['user.manage'], 0), context, input));
  await assert.rejects(service.validateUserAccess(accessTx(null), context, input));
  assert.equal((await service.validateUserAccess(accessTx(), context, input)).has('user.manage'), true);
});
function patchHarness(target, otherMemberships = 0, denied = null) {
  const writes = [];
  const tx = {
    businessMembership: { findFirst: async args => { assert.equal(args.where.businessId, 1); return target; }, update: async () => { writes.push('membership'); return { id: 11 }; }, count: async () => otherMemberships },
    user: { update: async () => writes.push('profile') }, membershipBranch: { deleteMany: async () => writes.push('branches') }, session: { updateMany: async args => { assert.equal(args.where.activeBusinessId, 1); writes.push('revoke'); } },
  };
  const route = load('src/app/api/users/[id]/route.ts', {
    'next/server': { NextResponse: { json } }, '@/lib/prisma': { prisma: { $transaction: async (fn, options) => { assert.equal(options.timeout, 30000); assert.equal(options.maxWait, 10000); return fn(tx); } } },
    '@/lib/authorization': { requireApiPermission: async () => denied, getAuthorizationContext: async () => context },
    '@/lib/user-management': { ...service, validateUserAccess: async () => new Set(['user.manage']) }, '@/lib/audit': { writeAuditLog: async () => writes.push('audit') },
  });
  return { writes, run: body => route.PATCH(new Request('http://localhost/api/users/11', { method: 'PATCH', body: JSON.stringify(body) }), { params: Promise.resolve({ id: '11' }) }) };
}
const target = { userId: 21, roleId: 2, user: { name: 'Ana', email: 'ana@example.com' }, role: { permissions: [permission('user.manage')] } };
test('rejects unauthorized calls and members outside the business without writes', async () => {
  const denied = patchHarness(target, 0, json({error:'Forbidden'}, {status:403})); assert.equal((await denied.run(input)).status,403); assert.equal(denied.writes.length,0);
  const foreign = patchHarness(null); assert.equal((await foreign.run(input)).status,404); assert.equal(foreign.writes.length,0);
});
test('prevents self deactivation, role changes and removal of active branch', async () => {
  for (const change of [{status:'INACTIVE'}, {roleId:3}, {branchIds:[31]}]) {
    const h = patchHarness({...target,userId:20}); assert.equal((await h.run({...input,...change})).status,400); assert.equal(h.writes.length,0);
  }
});
test('protects global profile for shared accounts, permits business access changes', async () => {
  const h = patchHarness(target,1); assert.equal((await h.run({...input,name:'Changed'})).status,400); assert.equal(h.writes.length,0);
  const ok = patchHarness(target,1); assert.equal((await ok.run({...input,status:'INACTIVE'})).status,200); assert.deepEqual(ok.writes,['branches','membership','revoke','audit']);
});
test('rejects modifications to a more privileged user', async () => {
  const h = patchHarness({...target,role:{permissions:[permission('role.manage')]}}); assert.equal((await h.run(input)).status,403); assert.equal(h.writes.length,0);
});
test('creation uses remote transaction budget and hashes credentials before entering transaction', async () => {
  let hashed = false;
  const writes = [];
  const tx = { user: { create: async ({data}) => { assert.equal(data.passwordHash,'hashed'); assert.equal(data.password,undefined); writes.push('user'); return {id:21}; } }, businessMembership: { create: async ({data}) => { assert.equal(data.businessId,1); assert.equal(data.branches.create[0].branchId,30); writes.push('membership'); return {id:11,user:{id:21,email:'ana@example.com'}}; } } };
  const route = load('src/app/api/users/route.ts', {
    argon2: {argon2id:2,hash:async () => {hashed=true;return 'hashed';}},
    'next/server': {NextResponse:{json}},
    'crypto': require('node:crypto'), '@/lib/password-recovery': {recoveryMailConfig:()=>{}}, '@/lib/user-invitation': {deliverUserInvitation:async()=>true},
    '@/lib/prisma': {prisma:{business:{findUniqueOrThrow:async()=>({name:'Company'})},$transaction:async (fn,options) => {assert.equal(hashed,true);assert.equal(options.timeout,30000);assert.equal(options.maxWait,10000);return fn(tx);}}},
    '@/lib/authorization': {requireApiPermission:async () => null,getAuthorizationContext:async () => context},
    '@/lib/user-management': {...service,validateUserAccess:async () => new Set(['user.manage'])},
    '@/lib/audit': {writeAuditLog:async () => writes.push('audit')},
  });
  const response = await route.POST(new Request('http://localhost/api/users',{method:'POST',body:JSON.stringify(input)}));
  assert.equal(response.status,201);assert.deepEqual(writes,['user','membership','audit']);
});
test('transaction timeouts return actionable availability errors', () => {
  const {Prisma} = require('@prisma/client');
  const error = new Prisma.PrismaClientKnownRequestError('Expired transaction',{code:'P2028',clientVersion:'6.15.0'});
  const response = service.userManagementResponse(error);
  assert.equal(response.status,503);assert.match(response.body.error,/Recarga el listado/);
});
test('invitation stores a hash with 24h expiry and cleans up on delivery failure', async () => {
  for (const fails of [false,true]) {
    let deleted = false;
    let deliveredToken;
    const invitation = load('src/lib/user-invitation.ts', {
      crypto: require('node:crypto'),
      '@/lib/prisma': {prisma:{passwordResetToken:{create:async({data})=>{
        assert.equal(data.userId,21);assert.equal(data.tokenHash,'hashed-token');assert.ok(data.expiresAt.getTime() > Date.now()+23*60*60*1000);return {id:'reset'};
      },deleteMany:async()=>{deleted=true;}}}},
      '@/lib/password-recovery': {hashResetToken:token=>{assert.match(token,/^[A-Za-z0-9_-]{43}$/);return 'hashed-token';},RecoveryEmailError:class extends Error {},sendInvitationEmail:async(email,token,business)=>{assert.equal(email,'ana@example.com');assert.equal(business,'Company');deliveredToken=token;if(fails)throw new Error('failed');return 'email-id';}},
    });
    assert.equal(await invitation.deliverUserInvitation({id:21,email:'ana@example.com'},'Company'),!fails);
    assert.ok(deliveredToken);assert.equal(deleted,fails);
  }
});
