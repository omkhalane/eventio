# Tooling Recommendations

These tools are recommended for contributors. They are intentionally documented
instead of forced until the project settles its exact linting stack.

## VS Code Extensions

- ESLint: JavaScript and TypeScript feedback in the editor.
- Prettier: consistent formatting.
- Tailwind CSS IntelliSense: class name completion.
- Python: scraper editing and virtual environment support.
- Ruff: fast Python linting once adopted in CI.
- GitHub Actions: workflow syntax validation.

## Future Tooling Upgrades

- Add ESLint flat config with React and TypeScript plugins.
- Add Prettier as a dev dependency and wire `npm run format`.
- Add Ruff for Python linting and import sorting.
- Add Vitest for frontend logic tests.
- Add Playwright for critical UI flows.
