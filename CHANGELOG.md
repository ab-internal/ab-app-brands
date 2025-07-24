# ab-app

## 1.0.0

### Major Changes

- 4f56148: Adding changesetrelease workflow

### Minor Changes

- 40b3c58: Decomposing BrandManager into DataTable and DataForm subcomponents
- 11db4f9: Ported component to package, configured Tailwind to process CSS from pkg
- 38cbec5: Updating to latest ab-ui release (0.3.0)

### Patch Changes

- d3fdef9: Creating proxy using isomorphic-git package to avoid Github cache delay when refreshing data
- 4ae7320: Ignoring .bak files
- 930e42a: Adding Changesets CLI to project
- 57c73de: Adding cache bypass for fetching data file from GitHub
- 63f11cd: Adding base NextJS app and workflow to publish static site to GitHub Pages
- b01cc92: Making asset & base paths dynamic and handling them with env vars, handling repo path in GitHub Pages workflo
- 9b0ef2c: Adding handling for delete operation in workflow dispatch, refactored to support other operations
- aa1e444: Added support for edit operation
- f21d6d4: Refactoring to use a dedicated data branch for faster / lighter checkouts with isomorphic git
- 141cf44: Adding app version env var and presenting in landing page
- 4896a2a: Making DataTable generic leveraging the Record type
- 779c321: Making DataForm into a generic component
