const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('static/js/app.js','utf8');
const helper=source.match(/async function rawFetchOK\(url, opts\)\{[\s\S]*?\n\}/)[0];

test('raw upload rejects HTTP failure without exposing body',async()=>{
  const context={fetch:async()=>({ok:false,status:413})};vm.createContext(context);vm.runInContext(helper,context);
  await assert.rejects(context.rawFetchOK('/upload',{}),/HTTP 413/);
});

test('raw upload accepts any 2xx response without parsing body',async()=>{
  const response={ok:true,status:204};const context={fetch:async()=>response};vm.createContext(context);vm.runInContext(helper,context);
  assert.equal(await context.rawFetchOK('/upload',{}),response);
});
