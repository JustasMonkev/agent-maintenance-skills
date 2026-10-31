import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { once } from 'node:events';
import path from 'node:path';

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
    response.setHeader('Content-Type', file.endsWith('.mjs') ? 'text/javascript' : file.endsWith('.css') ? 'text/css' : 'text/html');
    response.end(await readFile(file));
  } catch {
    response.writeHead(404).end();
  }
});
server.listen(0, '127.0.0.1');
await once(server, 'listening');
const observations = {};
let browser;
try {
  browser = await chromium.launch({ headless: true });
  for (const scenario of ['draft-after-add', 'exhausted-allocator', 'failed-save-then-blank']) {
    const context = await browser.newContext();
    try {
      if (scenario === 'exhausted-allocator') {
        await context.addInitScript(() => localStorage.setItem('todo-benchmark-v1',
            JSON.stringify({ todos: [], nextId: Number.MAX_SAFE_INTEGER })));
      }
      if (scenario === 'failed-save-then-blank') {
        await context.addInitScript(() => {
          Storage.prototype.setItem = () => { throw new DOMException('Full', 'QuotaExceededError'); };
        });
      }
      const page = await context.newPage();
      page.setDefaultTimeout(4000);
      await page.goto(`http://127.0.0.1:${server.address().port}`);
      await add(page, 'Original');
      if (scenario === 'draft-after-add') {
        await page.getByRole('button', { name: 'Edit Original', exact: true }).click();
        await page.getByRole('textbox', { name: 'Edit todo', exact: true }).fill('Unsaved draft');
        await add(page, 'Another task');
        const edit = page.getByRole('textbox', { name: 'Edit todo', exact: true });
        observations[scenario] = { expectedDraft: 'Unsaved draft', observedDraft: await edit.count() ? await edit.inputValue() : null };
      } else if (scenario === 'exhausted-allocator') {
        observations[scenario] = {
          todoCount: await page.getByTestId('todo').count(),
          remainingInput: await page.getByRole('textbox', { name: 'New todo', exact: true }).inputValue(),
          status: await page.locator('[role="status"], [role="alert"]').allTextContents(),
        };
      } else {
        const before = await page.locator('[role="status"], [role="alert"]').allTextContents();
        await add(page, '   ');
        observations[scenario] = { before, after: await page.locator('[role="status"], [role="alert"]').allTextContents() };
      }
    } finally {
      await context.close();
    }
  }
} finally {
  await browser?.close();
  await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
}
process.stdout.write(JSON.stringify({ project: path.basename(project), postHoc: true, observations }, null, 2) + '\n');

async function add(page, title) {
  await page.getByRole('textbox', { name: 'New todo', exact: true }).fill(title);
  const button = page.getByRole('button', { name: 'Add', exact: true });
  if (await button.isEnabled())
    await button.click();
}
