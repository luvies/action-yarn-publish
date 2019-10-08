# Action - Yarn Publish

[![Github Build Status](https://github.com/luvies/action-yarn-publish/workflows/Node%20CI/badge.svg)](https://github.com/luvies/action-yarn-publish)

A Github action that will automatically publish a package to the registry if the version in the package.json is not already published. It can optionally push a tag to git, marking the commit the publish used.

See [action.yml](action.yml) for more details.

For a working example on how to set this action up, see my [@luvies/evaluator package workflow](https://github.com/luvies/node-evaluator/blob/master/.github/workflows/nodeci.yml).

## Environment variables

This action will need a number of environment variables depending on what is being done:

- `NODE_AUTH_TOKEN`
  - Always needed
  - Used to authenticate the publish to the registry
    - Make sure 2fa is disabled for publishes to the registry
- `GITHUB_TOKEN`
  - Only needed if git tagging is enabled
  - Can be given using the following
    - `GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}`
