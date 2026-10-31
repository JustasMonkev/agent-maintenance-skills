import { chromium } from '/Users/justas/Desktop/mcp-accessibility-scanner/node_modules/playwright/index.mjs';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const server=createServer(async(req,res)=>{try{const path=req.url==='/'?'index.html':req.url.slice(1); const data=await readFile(new URL(path,import.meta.url));res.setHeader('Content-Type',path.endsWith('mjs')?'text/javascript':path.endsWith('css')?'text/css':'text/html');res.end(data);}catch{res.statusCode=404;res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:375,height:812}}); const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`http://127.0.0.1:${server.address().port}`);
 const add=async title=>{await page.getByRole('textbox',{name:'New todo',exact:true}).fill(title);await page.getByRole('button',{name:'Add',exact:true}).click();};
 await add('<b>First</b>');await add('Second');
 assert.equal(await page.locator('[data-testid=todo] b').count(),0);
 await page.getByRole('checkbox',{name:'Complete <b>First</b>',exact:true}).check();
 await page.getByRole('button',{name:'Edit <b>First</b>',exact:true}).click();await page.getByRole('textbox',{name:'Edit todo',exact:true}).fill('Cancelled');await page.getByRole('button',{name:'Cancel',exact:true}).click();
 assert.equal(await page.getByRole('checkbox',{name:'Complete <b>First</b>',exact:true}).isChecked(),true);
 await page.getByRole('button',{name:'Edit Second',exact:true}).click();await page.getByRole('textbox',{name:'Edit todo',exact:true}).fill('Revised');await page.getByRole('button',{name:'Save',exact:true}).click();
 await page.getByRole('button',{name:'Active',exact:true}).click();assert.equal(await page.locator('[data-testid=todo]').count(),1);assert.match(await page.locator('[data-testid=remaining]').textContent(),/1/);
 await page.reload();assert.equal(await page.locator('[data-testid=todo]').count(),2);
 await page.getByRole('button',{name:'Clear completed',exact:true}).click();assert.equal(await page.locator('[data-testid=todo]').count(),1);
 await page.evaluate(()=>{Storage.prototype.setItem=()=>{throw new Error('blocked');};}); await add('Unsaved');assert.match(await page.getByRole('status').textContent(),/Saving failed/);assert.equal(await page.locator('[data-testid=todo]').count(),2);
 await add('long'.repeat(100));assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 await page.getByRole('button',{name:'Delete Revised',exact:true}).click();
 assert.deepEqual(errors,[]);
 console.log('PASS browser: text safety, completion, cancel, save, filters/count, reload, clear, failed saving preserves work, narrow/long title, delete; no page errors');
 const denied=await browser.newPage();await denied.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw Error('denied');}});});await denied.goto(`http://127.0.0.1:${server.address().port}`);await denied.getByRole('textbox',{name:'New todo',exact:true}).fill('Works');await denied.getByRole('button',{name:'Add',exact:true}).click();assert.equal(await denied.locator('[data-testid=todo]').count(),1);console.log('PASS browser: storage getter/read failure remains usable');
}finally{await browser.close();server.close();}
