# carsales_ai

TypeScript-based car listing function lab for car listing data extraction with Jest tests and CI, parsing structured JSON (name, year, mileage, price, image) from real-world listing pages.

## Project structure

- `src/` – reusable TypeScript functions
  - `extractCarData.ts` – core car listing extractor and helpers
- `tests/` – Jest test files (TypeScript)
  - `extractCarData.test.ts` – tests for the extractor
- `.github/workflows/ci.yml` – GitHub Actions workflow running tests on PRs and pushes to `main`

## Core API: extractCarData

- `extractCarData(document: Document): CarData`
  - Takes a `Document` (e.g., in the browser) and returns:
    - `name`, `year`, `mileage`, `price`, `image` as `string | null`.
- `extractCarDataFromHtml(html: string): CarData`
  - Parses an HTML string (via `jsdom` in Node/tests) and delegates to `extractCarData`.
- `extractCarDataFromUrl(url: string): Promise<CarData>`
  - Fetches the given URL, reads the HTML, and returns the parsed `CarData`.

## Workflow for adding new functions

1. Create a new function file in `src/`, for example `src/myNewFunction.ts`, and export the function you want to reuse.
2. Create a matching test file in `tests/`, for example `tests/myNewFunction.test.ts`, and write Jest tests that cover:
   - Normal behavior.
   - Edge cases and error handling.
3. Run `npm test` locally and make sure all tests pass.
4. Open a pull request into `main`. GitHub Actions will run the test suite via the `CI` workflow.
5. Only merge when the CI check is green; this ensures that every function merged into `main` has passing tests.

## Branch protection

In GitHub repository settings, configure branch protection for `main` so that:

- Merges require a pull request.
- The `CI` workflow (job `ci`) is a required status check before merging.

With this setup, only functions that are fully tested in this repo can be merged into `main` and then copied into your other projects.
