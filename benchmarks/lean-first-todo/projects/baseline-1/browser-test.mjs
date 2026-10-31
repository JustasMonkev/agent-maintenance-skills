import { chromium } from '/Users/justas/Desktop/mcp-accessibility-scanner/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
const server = createServer(async (req, res) => {
  try {
    const path = req.url === '/' ? 'index.html' : req.url.slice(1);
    const body = await readFile(new URL(path, import.meta.url));
    res.setHeader('Content-Type', path.endsWith('.mjs') ? 'text/javascript' : path.endsWith('.css') ? 'text/css' : 'text/html');
    res.end(body);
  } catch { res.statusCode = 404; res.end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const browser = await chromium.launch({ headless: true });
try {
 const page = await browser.newPage({ viewport: { width: 375, height: 800 } });
 await page.goto(`http://127.0.0.1:${server.address().port}`);
 const add = async title => { await page.getByRole('textbox', { name: 'New todo', exact: true }).fill(title); await page.getByRole('button', { name: 'Add', exact: true }).click(); };
 await add('<b>Read</b>'); await add('Second');
 assert.equal(await page.locator('[data-testid="todo"] b').count(), 0);
 await page.getByRole('checkbox', { name: 'Complete <b>Read</b>', exact: true }).check();
 await page.getByRole('button', { name: 'Edit <b>Read</b>', exact: true }).click();
 await page.getByRole('textbox', { name: 'Edit todo', exact: true }).fill('Cancelled');
 await page.getByRole('button', { name: 'Cancel', exact: true }).click();
 assert.equal(await page.getByRole('checkbox', { name: 'Complete <b>Read</b>', exact: true }).isChecked(), true);
 await page.getByRole('button', { name: 'Edit Second', exact: true }).click();
 await page.getByRole('textbox', { name: 'Edit todo', exact: true }).fill('Updated');
 await page.getByRole('button', { name: 'Save', exact: true }).click();
 await page.getByRole('button', { name: 'Active', exact: true }).click();
 assert.equal(await page.getByTestId('todo').count(), 1);
 assert.match(await page.getByTestId('remaining').textContent(), /1/);
 await page.reload();
 assert.equal(await page.getByTestId('todo').count(), 2);
 await page.getByRole('button', { name: 'Clear completed', exact: true }).click();
 await page.getByRole('button', { name: 'Delete Updated', exact: true }).click();
 assert.equal(await page.getByTestId('todo').count(), 0);
 await page.evaluate(() => { Storage.prototype.setItem = () => { throw new Error('denied'); }; });
 await add('Unsaved');
 assert.match(await page.getByRole('status').textContent(), /Saving failed/);
 assert.equal(await page.getByTestId('todo').count(), 1);
 assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
 await page.addInitScript(() => { Storage.prototype.getItem = () => { throw new Error('denied'); }; });
 await page.reload();
 assert.match(await page.getByRole('status').textContent(), /could not be read/);
 await add('Still works');
 assert.equal(await page.getByTestId('todo').count(), 1);
 console.log('PASS browser: add, text safety, toggle, cancel, save, filter/count, reload, clear/delete, storage failures, 375px layout');
} finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
