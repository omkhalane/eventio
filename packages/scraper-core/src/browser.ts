import { chromium, type Browser, type Page } from 'playwright';

export const createBrowser = async () =>
  chromium.launch({
    headless: true,
  });

export const createPage = async (browser: Browser) => {
  const page = await browser.newPage({
    userAgent:
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
  });

  await page.route('**/*', async (route) => {
    const resourceType = route.request().resourceType();
    if (['image', 'media', 'font'].includes(resourceType)) {
      await route.abort();
      return;
    }

    await route.continue();
  });

  return page;
};

export const collectAnchors = async (page: Page) => {
  const anchors = page.locator('a[href]');
  const count = await anchors.count();
  const results: Array<{ href: string; text: string }> = [];

  for (let index = 0; index < count; index += 1) {
    const anchor = anchors.nth(index);
    const href = await anchor.getAttribute('href');
    if (!href) {
      continue;
    }

    results.push({
      href: new URL(href, page.url()).href,
      text: (await anchor.innerText()).replace(/\s+/g, ' ').trim(),
    });
  }

  return results;
};
