import { test, expect } from '@playwright/test';
import { createHtmlReport } from 'axe-html-reporter';
import AxeBuilder from '@axe-core/playwright';

const url = "https://www.flexwind.com/";

// Define the test outside any other functions

// const urls = fs.readFileSync('/app/urls.txt', 'utf-8').split('\n');

// console.log('URLs to audit:', urls);

// for (const url of urls) {
  test(`auditURL ${url}`, async ({ page }) => {
  await page.goto(url);

  const failingTags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa'];
  const feedbackTags = ['wcag2aaa', 'best-practice'];
  const allTags = failingTags.concat(feedbackTags);

  const results = await new AxeBuilder({ page })
    .withTags(allTags)
    .include('main')
    .analyze();

  // Process and report accessibility results
  if (results.violations.length) {
    const violationsByTag = {};
    const warnings = {};

    results.violations.forEach(violation => {
      violation.tags.forEach(tag => {
        if (!allTags.includes(tag)) return;
        if (!violationsByTag[tag]) {
          violationsByTag[tag] = [];
        }
        violationsByTag[tag].push(violation);
      });

      Object.keys(violationsByTag).forEach(tag => {
        if (failingTags.includes(tag)) {
          console.error(`${tag} ${violationsByTag[tag].length} violations`);
          expect(violationsByTag[tag].length).toEqual(0); // Fail test if violations found
        } else {
          warnings[tag] = violationsByTag[tag];
        }
      });

      if (Object.keys(warnings).length) {
        console.warn(warnings);
      }
    });
  } else {
    console.log(`URL "${url}" passed accessibility audit.`);
  }

  // Generate and save report (optional)
  const reportHTML = createHtmlReport({
    results,
    options: {
      projectKey: url.replace(/\s+/g, '-').toLowerCase(),
      doNotCreateReportFile: true, // Prevents file creation
    },
  });

  console.log(reportHTML);

});

// }
