# AGENTS.md — marcin007.github.io

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
