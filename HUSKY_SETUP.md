# Husky Setup for Git Hooks

This project is configured with Husky to run automated checks before commits and pushes.

## Pre-commit Hook

The pre-commit hook runs the following checks on staged files:

### For TypeScript/TSX files in `src/`:
- **ESLint**: Fixes auto-fixable linting issues
- **TypeScript**: Type checking with `tsc --noEmit`

### For JavaScript/JS files:
- **ESLint**: Fixes auto-fixable linting issues

### For test files in `__tests__/`:
- **Jest**: Runs tests related to the changed test files

## Pre-push Hook

The pre-push hook runs:
- **Full test suite**: All tests must pass before pushing to remote

## Commands

- `npm run lint`: Run ESLint
- `npm run lint:fix`: Run ESLint with auto-fix
- `npm run tsc`: Run TypeScript type checking
- `npm test`: Run all tests
- `npm run test:watch`: Run tests in watch mode
- `npm run test:coverage`: Run tests with coverage report

## Configuration Files

- `.husky/pre-commit`: Pre-commit hook script
- `.husky/pre-push`: Pre-push hook script
- `package.json`: Lint-staged configuration and scripts

## How It Works

1. **On commit**: Only runs checks on staged files that match the patterns
2. **On push**: Runs the full test suite to ensure everything is working
3. **Type checking**: Only runs on source files, not test files (to avoid test-specific type issues)
4. **Tests**: Only runs when test files are modified

This setup ensures code quality while keeping the development workflow fast and efficient.
