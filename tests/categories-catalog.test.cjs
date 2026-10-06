const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const {Prisma} = require('@prisma/client');
function load(file,mocks={}) {
 const exports={};const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 vm.runInNewContext(code,{exports,require:name=>mocks[name],URLSearchParams,Number,Error});return exports;
}
const categories=load('src/lib/categories.ts');
test('categories normalize names and validate state',()=>{
 const c=categories.parseCategory({name:'  Arte   Escolar  ',active:true});assert.equal(c.name,'Arte Escolar');assert.equal(c.normalizedName,'arte escolar');
 for(const body of [{name:'',active:true},{name:'Valid',active:'true'},{name:'a'.repeat(81),active:false}]) assert.throws(()=>categories.parseCategory(body));
});
test('products may omit or remove categories',async()=>{
 const client={category:{findFirst:()=>{throw new Error('Unexpected query')}}};
 assert.equal((await categories.resolveProductCategory(client,1,undefined)).categoryId,null);
 assert.equal((await categories.resolveProductCategory(client,1,null,3)).categoryId,null);
 assert.equal(Object.keys(await categories.resolveProductCategory(client,1,undefined,3)).length,0);
});
test('rejects foreign and inactive categories but preserves an existing inactive assignment',async()=>{
 const client={category:{findFirst:async({where})=>{assert.equal(where.businessId,1);return where.id===3?{id:3,name:'Office',active:false}:null}}};
 await assert.rejects(categories.resolveProductCategory(client,1,4));
 await assert.rejects(categories.resolveProductCategory(client,1,3));
 assert.equal((await categories.resolveProductCategory(client,1,3,3)).categoryId,3);
});
function catalogHarness(enabled=true,activeCategories=[]) {
 const queries=[];
 const prisma={business:{findFirst:async args=>{assert.equal(args.where.catalogEnabled,true);assert.equal(args.where.status,'ACTIVE');return enabled?{id:7,name:'Company',slug:'company',currency:'USD',logoUrl:null}:null}},category:{findMany:async args=>{assert.equal(args.where.businessId,7);assert.equal(args.where.active,true);return activeCategories}},$queryRaw:async query=>{queries.push(query);return query.sql.includes('count(*)')?[{total:1n}]:[{id:12,name:'Notebook',description:null,image:null,price:new Prisma.Decimal('2.50'),category:null}]}};
 return {queries,lib:load('src/lib/public-catalog.ts',{'@prisma/client':{Prisma},'@/lib/prisma':{prisma}})};
}
test('search normalizes accents and bounds pagination and terms',()=>{
 const h=catalogHarness();const query=h.lib.catalogQuery(new URLSearchParams({q:'LÁPIZ azul',page:'NaN',category:'-1'}));assert.equal(query.terms.join(' '),'lapiz azul');assert.equal(query.page,1);assert.equal(query.categoryId,null);
 assert.equal(h.lib.catalogQuery(new URLSearchParams({page:'999999'})).page,10000);
});
test('unpublished catalog is unavailable',async()=>{
 const h=catalogHarness(false);await assert.rejects(h.lib.getPublicCatalog('company',new URLSearchParams()));assert.equal(h.queries.length,0);
});
test('public listing is scoped, omits internal data and includes uncategorized products',async()=>{
 const h=catalogHarness();const data=await h.lib.getPublicCatalog('company',new URLSearchParams());assert.equal(data.categories.length,0);assert.equal(data.products[0].category,null);assert.equal(data.products[0].price,'2.5');assert.equal(data.products[0].cost,undefined);assert.equal(data.products[0].quantity,undefined);
 const query=h.queries.find(q=>q.sql.includes('SELECT p.'));assert.ok(query.values.includes(7));assert.match(query.sql,/"quantity" > 0/);assert.doesNotMatch(query.sql,/p\."cost"/);assert.doesNotMatch(query.sql,/p\."categoryId" =/);
});
test('category filter uses active categories and search is parameterized',async()=>{
 const h=catalogHarness(true,[{id:3,name:'Office'}]);await h.lib.getPublicCatalog('company',new URLSearchParams({category:'3',q:"% ' OR 1=1 --"}));
 const query=h.queries[0];assert.match(query.sql,/selected\."active" = true/);assert.ok(query.values.includes(3));assert.ok(query.values.includes('%'));assert.doesNotMatch(query.sql,/OR 1=1/);
});

test('multiple categories are optional, deduplicated and tenant validated',async()=>{
 const client={category:{findMany:async({where})=>{assert.equal(where.businessId,1);return where.id.in.filter(id=>id===2||id===3).map(id=>({id,name:'Category '+id,active:true}));}}};
 const data=await categories.resolveProductCategories(client,1,[2,3,2]);assert.equal(data.ids.length,2);assert.equal(data.category,'Category 2, Category 3');
 assert.equal((await categories.resolveProductCategories(client,1,[])).categoryId,null);
 assert.equal(await categories.resolveProductCategories(client,1,undefined),undefined);
 await assert.rejects(categories.resolveProductCategories(client,1,[2,99]));
 await assert.rejects(categories.resolveProductCategories(client,1,['2']));
});
