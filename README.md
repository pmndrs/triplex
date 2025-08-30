# Triplex Monorepo

This is an internal private monorepo for Triplex.

This repo uses `pnpm`.

## Repository Structure

### Apps

All the published apps including the documentation (`docs`) and VS Code extension (`vscode`).

### Packages

Core packages that power Triplex. `@triplex` namespaces most of the business logic broken up in the following:

- `editor` - Main editor UI and functionality
- `server` - Backend for file operations and type inference
- `client` - Scene runner and userland code execution
- `lib` - Common UI-agnostic code shared between packages
- `ux` - Common UI components shared between packages
- `renderer` - React Three Fiber/React renderer implementation
- `bridge` - Communication layer between editor and renderers

### Examples

Collection of example projects showcasing Triplex usage.

## Changesets

We use `changesets` when making any production facing changes in Triplex apps. If you're only making a change to a test, example, or documentation, then don't bother creating a changeset.

To create a changeset run the following:

```bash
pnpm changeset
```

New features should be `minor` and bug fixes / chores should be `patch`. The message you should write needs to be informative enough to end users that if they were to read it they can understand it will enough.

Don't worry about getting it 100% correct we can update the CHANGELOG.md after a release if we need.
