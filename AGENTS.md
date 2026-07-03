# Agent Workflow

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
