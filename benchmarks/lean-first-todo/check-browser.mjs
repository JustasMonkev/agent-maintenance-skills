import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { once } from 'node:events';

if (process.argv.length !== 3)
  throw new Error('Usage: node check-browser.mjs PROJECT_DIRECTORY; optional PLAYWRIGHT_MODULE');
const project = path.resolve(process.argv[2]);
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const file = path.resolve(project, `.${pathname === '/' ? '/index.html' : pathname}`);
    if (!file.startsWith(project + path.sep)) {
      response.writeHead(403).end();
      return;
    }
    const body = await readFile(file);
    const types = { '.html': 'text/html', '.mjs': 'text/javascript', '.js': 'text/javascript', '.css': 'text/css' };
    response.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' }).end(body);
  } catch {
    response.writeHead(404).end();
  }
});
server.listen(0, '127.0.0.1');
await once(server, 'listening');
const url = `http://127.0.0.1:${server.address().port}`;
const results = [];
let browser;

try {
  browser = await chromium.launch({ headless: true });
  await check('keyboard add, blank reject, completion and persistence', async page => {
    await page.getByRole('textbox', { name: 'New todo', exact: true }).fill('   ');
    if (await page.getByRole('button', { name: 'Add', exact: true }).isEnabled())
      await page.getByRole('button', { name: 'Add', exact: true }).click();
    assert.equal(await rows(page).count(), 0);
    await page.getByRole('textbox', { name: 'New todo', exact: true }).fill('  First task  ');
    await page.getByRole('textbox', { name: 'New todo', exact: true }).press('Enter');
    assert.equal(await rows(page).count(), 1);
    await page.getByRole('checkbox', { name: 'Complete First task', exact: true }).focus();
    await page.keyboard.press('Space');
    assert.equal(await page.getByRole('checkbox', { name: 'Complete First task', exact: true }).isChecked(), true);
    await page.reload();
    assert.equal(await page.getByRole('checkbox', { name: 'Complete First task', exact: true }).isChecked(), true);
    assert.match(await page.getByTestId('remaining').innerText(), /\b0\b/);
  });

  await check('edit save, blank reject and cancel preserve completion', async page => {
    await add(page, 'Original');
    await page.getByRole('checkbox', { name: 'Complete Original', exact: true }).check();
    await page.getByRole('button', { name: 'Edit Original', exact: true }).click();
    await page.getByRole('textbox', { name: 'Edit todo', exact: true }).fill('   ');
    if (await page.getByRole('button', { name: 'Save', exact: true }).isEnabled())
      await page.getByRole('button', { name: 'Save', exact: true }).click();
    assert.equal((await stored(page)).todos[0].title, 'Original');
    if (!await page.getByRole('textbox', { name: 'Edit todo', exact: true }).isVisible())
      await page.getByRole('button', { name: 'Edit Original', exact: true }).click();
    await page.getByRole('textbox', { name: 'Edit todo', exact: true }).fill('  Renamed  ');
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    assert.equal(await page.getByRole('checkbox', { name: 'Complete Renamed', exact: true }).isChecked(), true);
    await page.getByRole('button', { name: 'Edit Renamed', exact: true }).click();
    await page.getByRole('textbox', { name: 'Edit todo', exact: true }).fill('Discarded');
    await page.getByRole('button', { name: 'Cancel', exact: true }).click();
    await page.reload();
    assert.equal(await page.getByRole('checkbox', { name: 'Complete Renamed', exact: true }).isChecked(), true);
  });

  await check('filters, remaining count and clear completed use full state', async page => {
    await add(page, 'Active one');
    await add(page, 'Finished');
    await page.getByRole('checkbox', { name: 'Complete Finished', exact: true }).check();
    await page.getByRole('button', { name: 'Completed', exact: true }).click();
    assert.equal(await rows(page).count(), 1);
    assert.match(await rows(page).innerText(), /Finished/);
    assert.match(await page.getByTestId('remaining').innerText(), /\b1\b/);
    await page.getByRole('button', { name: 'Active', exact: true }).click();
    assert.equal(await rows(page).count(), 1);
    await page.getByRole('button', { name: 'Clear completed', exact: true }).click();
    await page.getByRole('button', { name: 'All', exact: true }).click();
    assert.equal(await rows(page).count(), 1);
    assert.match(await rows(page).innerText(), /Active one/);
    await page.reload();
    assert.equal(await rows(page).count(), 1);
  });

  await check('duplicate-title deletion keeps stable IDs after reload', async page => {
    await add(page, 'Same');
    await add(page, 'Same');
    const before = await stored(page);
    assert.notEqual(before.todos[0].id, before.todos[1].id);
    await page.getByRole('button', { name: 'Delete Same', exact: true }).first().click();
    await page.reload();
    await add(page, 'Later');
    const after = await stored(page);
    assert.equal(after.todos[0].id, before.todos[1].id);
    assert.ok(after.todos[1].id > before.todos[1].id);
  });

  await check('hostile title text never becomes executable markup', async page => {
    const title = '<img src=x onerror="window.todoXss=true">';
    await add(page, title);
    assert.equal(await page.getByTestId('todo-list').locator('img').count(), 0);
    assert.equal(await page.evaluate(() => window.todoXss), undefined);
    assert.ok((await rows(page).innerText()).includes(title));
    await page.reload();
    assert.equal(await page.getByTestId('todo-list').locator('img').count(), 0);
  });

  for (const text of ['{bad json', JSON.stringify({ todos: [{ id: 1, title: 'A', completed: false }, { id: 1, title: 'B', completed: true }], nextId: 2 })]) {
    await check(`invalid stored snapshot resets: ${text.slice(0, 20)}`, async page => {
      assert.equal(await rows(page).count(), 0);
      await add(page, 'Recovered');
      assert.equal(await rows(page).count(), 1);
      assert.equal((await stored(page)).todos[0].id, 1);
    }, async context => context.addInitScript(value => localStorage.setItem('todo-benchmark-v1', value), text));
  }

  await check('storage read failure still permits in-memory work', async page => {
    await add(page, 'Still usable');
    assert.equal(await rows(page).count(), 1);
    assert.match(await rows(page).innerText(), /Still usable/);
  }, async context => context.addInitScript(() => {
    Storage.prototype.getItem = () => { throw new DOMException('Blocked', 'SecurityError'); };
  }));

  await check('storage write failure preserves in-memory work and displays status', async page => {
    await add(page, 'Not lost');
    assert.equal(await rows(page).count(), 1);
    const statuses = await page.locator('[role="alert"]:visible, [role="status"]:visible').allTextContents();
    assert.match(statuses.join(' '), /sav|storag|persist|reload/i);
    await page.getByRole('checkbox', { name: 'Complete Not lost', exact: true }).check();
    assert.equal(await page.getByRole('checkbox', { name: 'Complete Not lost', exact: true }).isChecked(), true);
  }, async context => context.addInitScript(() => {
    Storage.prototype.setItem = () => { throw new DOMException('Full', 'QuotaExceededError'); };
  }));

  await check('long titles fit narrow and desktop screens with usable controls', async page => {
    await add(page, 'LongTitle'.repeat(35));
    await add(page, 'Write the first draft');
    for (const width of [320, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), `Overflow at ${width}px`);
      assert.equal(await page.getByRole('button', { name: 'Add', exact: true }).isVisible(), true);
    }
    if (process.env.SCREENSHOT_PATH)
      await page.screenshot({ path: process.env.SCREENSHOT_PATH, fullPage: true });
  });
} finally {
  await browser?.close();
  await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
}

process.stdout.write(JSON.stringify({ project: path.basename(project), browser: 'Chromium', results }, null, 2) + '\n');
process.exitCode = results.some(result => !result.passed) ? 1 : 0;

async function check(name, run, setup) {
  const context = await browser.newContext();
  const errors = [];
  const start = performance.now();
  try {
    if (setup)
      await setup(context);
    const page = await context.newPage();
    page.setDefaultTimeout(4000);
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(url);
    await page.getByRole('textbox', { name: 'New todo', exact: true }).waitFor();
    await run(page);
    assert.deepEqual(errors, [], 'Uncaught browser errors');
    results.push({ name, passed: true, durationMs: performance.now() - start });
  } catch (error) {
    results.push({ name, passed: false, error: error.message, browserErrors: errors, durationMs: performance.now() - start });
  } finally {
    await context.close();
  }
}

function rows(page) {
  return page.locator('[data-testid="todo"]:visible');
}

async function add(page, title) {
  await page.getByRole('textbox', { name: 'New todo', exact: true }).fill(title);
  await page.getByRole('button', { name: 'Add', exact: true }).click();
}

async function stored(page) {
  return page.evaluate(() => JSON.parse(localStorage.getItem('todo-benchmark-v1')));
}
