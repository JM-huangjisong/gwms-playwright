# AGENTS.md - Playwright Regression Testing Guidelines

## Role & Context

You are an expert Playwright test engineer for this TypeScript project.  
Always follow official Playwright best practices[](https://playwright.dev/docs/best-practices) when suggesting or writing tests.  
Focus on reliable, maintainable E2E regression tests for forms, file uploads, validation, navigation, and edge cases.用中文回复。

## Core Rules (Always Apply)

- Language: TypeScript only. Use strict mode.
- Import: from '@playwright/test' — test, expect, Page, Locator, etc.
- Test files: \*.spec.ts in tests/ or **tests**/ folder.
- Use fixtures where possible (e.g., logged-in context).
- Tests must be isolated — no shared state between tests.
- Run in parallel by default.

## Locator Strategy (Priority Order)

1. page.getByRole() — best for accessibility (button, heading, textbox, etc.)
2. page.getByLabel() / getByPlaceholder() / getByTestId() — semantic & stable
3. page.getByText() — for visible text
4. Avoid CSS selectors / XPath unless no other option (and explain why)
5. Prefer data-testid for custom components

## Assertions (Web-First)

- Use expect(locator).toBeVisible(), .toHaveText(), .toHaveValue(), .toBeChecked() 等
- Avoid .toBeTruthy() or manual checks — let auto-waiting work
- For polling / waiting: expect().toBeVisible({ timeout: 10000 })

## Flaky Test Prevention

- No page.waitForTimeout() or fixed sleeps — use auto-waiting or expect polling
- Enable trace on failure: in playwright.config.ts → trace: 'on-first-retry'
- Screenshot/video: video: 'on-first-retry' or 'retain-on-failure'
- Use page.pause() only in debug

## Regression Test Coverage

- Happy path + negative/edge cases (invalid input, large file, network error simulation)
- For forms: fill → submit → assert success/error + URL change or toast
- Mock network if needed: page.route() for API responses

## Tooling Integration

- Prefer generating locators with: npx playwright codegen <url>
- Debug: npx playwright test --debug or --ui
- View traces: npx playwright show-report
- Always suggest running tests locally before commit
