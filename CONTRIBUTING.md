# Contributing to MarzPay Node.js & TypeScript SDK

Thank you for your interest in contributing to the **MarzPay SDK**! We welcome bug reports, feature requests, documentation improvements, and code contributions.

---

## Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9 or higher (or pnpm / yarn)

### Development Setup

1. **Fork and clone the repository:**
   ```bash
   git clone https://github.com/<your-username>/marzpay.git
   cd marzpay
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Verify build and tests:**
   ```bash
   npm run typecheck
   npm run build
   npm run test
   ```

---

## Development Workflow

### Available Scripts

- `npm run dev`: Runs `tsup` in watch mode for development.
- `npm run build`: Bundles the TypeScript SDK to ESM, CJS, and TypeScript declaration files (`dist/`).
- `npm run test`: Runs the Vitest test suite once.
- `npm run test:watch`: Runs Vitest in interactive watch mode.
- `npm run test:coverage`: Runs unit tests with coverage reporting.
- `npm run typecheck`: Runs `tsc --noEmit` to verify type safety.
- `npm run docs`: Generates API documentation via TypeDoc into `./docs`.

---

## Adding Changesets (Releases)

We use [Changesets](https://github.com/changesets/changesets) to manage versioning and changelogs automatically.

If your Pull Request introduces code changes, bug fixes, or new features that should trigger a release:

1. Run the changeset CLI:
   ```bash
   npm run changeset
   ```
2. Select the patch/minor/major version bump and provide a concise summary of your changes.
3. Commit the generated markdown file in `.changeset/` along with your PR.

---

## Pull Request Guidelines

1. **Branch Naming**: Use descriptive branch names such as `fix/auth-header`, `feat/disbursements`, or `docs/readme-update`.
2. **Commit Messages**: Keep commits clear and descriptive.
3. **Tests**: Ensure all new features or bug fixes include unit tests in `tests/`.
4. **CI Pipeline**: Verify that `npm run typecheck`, `npm run build`, and `npm run test` pass locally before creating a PR.

---

## Code of Conduct

All contributors are expected to adhere to our [Code of Conduct](CODE_OF_CONDUCT.md). Please read it before participating.
