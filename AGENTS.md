# AGENTS.md — marcin007.github.io

## Agent Workflow

Before making any code, content, or asset changes, always base the work on the latest `master` from the remote (`origin/master`). Do not rely on the local `master` branch unless it has just been fast-forwarded from `origin/master`.

1. Inspect the current repository state:
   ```sh
   git status --short --branch
   git branch -vv
   git worktree list
   ```

2. Update remote refs before deciding what to edit:
   ```sh
   git fetch origin master --prune
   git log --oneline --decorate --graph -8 origin/master HEAD
   ```
   If network or sandbox approval is required, request it before continuing with implementation.

3. Do not start work from a detached `HEAD`, a branch that is behind `origin/master`, local `master` when it is behind the remote, or an older worktree when newer changes have already landed on remote `master`. Switch to, fast-forward, rebase, merge, or explicitly carry the change onto latest `origin/master` first.

4. Preserve user work. Never discard or overwrite uncommitted changes; if the correct branch is ambiguous, stop and ask which branch/worktree should receive the change.

This rule exists to avoid applying fixes to a stale worktree while newer portfolio changes have already landed on remote `master`.

## Frontend Preview Rule

Whenever an agent makes a browser-visible frontend change, it must run the site locally
before marking the work done and give the user the exact clickable localhost URL.

- Use the dedicated preview range `43110`–`43119`.
- Start with `http://localhost:43110`; if busy, increment within the range.
- Bind to localhost explicitly:
  ```bash
  npm run dev -- --host 127.0.0.1 --port 43110
  ```
- Do not use Astro defaults `4321` or `4322` for agent previews, to avoid collisions with
  Claude Code or other local checkouts.
- State the port actually used in the final response.

## GitHub CI/CD Rule

After publishing changes to GitHub, do not treat the work as finished while the relevant
GitHub Actions state is unknown.

- For PRs and pushed branches, check the `CI` workflow.
- For merges or direct pushes to `master`, check `Deploy to GitHub Pages`.
- If a GitHub Actions run fails in a way that looks transient, rerun failed jobs once:
  ```sh
  gh run rerun <run-id> --failed
  ```
- If the retry fails, inspect the logs and fix the root cause before calling the work done.
