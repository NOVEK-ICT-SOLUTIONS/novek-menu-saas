# AI AGENT RULES

## EXCLUDED FILES

NEVER scan files matching the following directory/file patterns:

- `node_modules/`
- `.git/`
- `*.env`
- `.env.*`
- `.env`
- `.venv/`
- `*.lock`

## WORKFLOW RULES

- ALWAYS use planning mode if a prompt contains a question.
- NEVER make changes or propose to make changes if a prompt contains a question.
- ALWAYS first try the MCP `context7` for public or open source API documentation.

## ALLOWED AI AGENTS

- NEVER make any changes to the codebase unless you are the Claude Code Agent or the Codex Agent.
- NEVER make any changes to the codebase if you are the Gemini Agent or the Cursor Agent.

## GENERAL CODE RULES

- NEVER insert emoji into any file.  Use unicode codepoints instead.
- ALWAYS respect the ignored file patterns in the `.gitignore` file.
- NEVER allow a git branch or Github pull request to contain more than 40 changed files.  If it does, do not do any work, and instruct the developer to split the changes into smaller branches.


## TYPESCRIPT AND JAVASCRIPT RULES

- ALWAYS use `const` for variables.
- NEVER use `let` or `var`.
- ALWAYS respect the biomejs linter ignore rules in the code files.
- ALWAYS respect the biomejs config in the `biome.jsonc` file.
- ALWAYS Respect the typescript configs in the `tsconfig.json` files.
- ALWAYS specify exact package versions in `package.json`.
- NEVER add unnecessary `console.log()` statements.
- NEVER use relative paths for imports.
- ALWAYS use the file extension for import paths.
- NEVER add an explicit type to a variable if it can be inferred.
- ALWAYS add `{} as const` to object literals, when it is helpful.
- NEVER add return type annotations to functions, unless they are type stubs.
- NEVER use try/catch.
- ALWAYS prefer a functional style of code.
- ALWAYS avoid using mutable variables.
- NEVER insert emoji into code.  Use unicode codepoints instead.
- NEVER add code comments, unless specifically requested.
- ALWAYS provide a type argument to `document.querySelector()` and `document.querySelectorAll()`.
- NEVER allow a Typescript file to be larger than 600 lines of code.
- NEVER allow a Typescript function to be larger than 100 lines of code, unless it is a React component or hook.
- NEVER reassign `globalThis`.
- NEVER use `window`.  Use `globalThis` instead.
- NEVER use `forEach()` for arrays.  Use `for...of` instead.
- ALWAYS use arrow functions. Never use function declarations unless function overloads are needed.
- ALWAYS use function overloading when it could be helpful.
- NEVER use the old `then()` promises syntax.
- ALWAYS use the `async`/`await` syntax for promises.
- NEVER reassign `globalThis`.
- NEVER use `window`.  Use `globalThis` instead.
- NEVER use `forEach()` for arrays.  Use `for...of` instead.
- ALWAYS specify JSDOC type syntax for `.js` files.
- ALWAYS use inline `@type {...}` annotations for JSDOC variable declarations in `.js` files.
- NEVER use the `@type {Object} a; @property {...} b;` syntax for JSDOC variable declarations in `.js` files.
- ALWAYS use arrow functions. Never use function declarations unless function overloads are needed.
- ALWAYS use function overloading when it could be helpful.

## REACT RULES

- ALWAYS respect the biomejs linter ignores in the code files.
- ALWAYS respect the biomejs config in the `./biome.jsonc` file.
- ALWAYS use `React.useCallback()` for functions which are inside components.
- ALWAYS use `React.useMemo()` for values which are inside components.
- ALWAYS use `React.memo()` for all components.
- ALWAYS provide a `displayName` property to all components.
- ALWAYS provide a comparison function to `React.memo()`.
- NEVER set a React state from within the following handlers: `scroll`, `resize`, `keyDown`, `keyPress`.
- NEVER allow a React component to be larger than 300 lines of code.
- NEVER allow a non React component function to be larger than 100 lines of code.
- NEVER render a React component as a function call. It should only be rendered as a JSX element.
- NEVER add SSR checks such as `if (typeof window !== 'undefined')` to React components.  These should be handled manually by a developer.

## DATABASE AND SQL RULES

- ALWAYS use the name `id` for primary keys.
- ALWAYS use a `UUID` for primary keys.
- NEVER use an integer for primary keys.
- NEVER specify schema names in SQL statements (Example: `public`).

## MODULE AND EXPORT RULES

- NEVER use `.js` extension in import paths. ALWAYS use `.ts` extension.
- NEVER create `index.ts` barrel files if the folder contains less than 3 files. Import directly from the file instead.
- ALWAYS import directly from the source file when possible.

## MAGIC NUMBERS AND CONSTANTS

- NEVER use magic numbers in code. ALWAYS define them as named constants.
- ALWAYS use descriptive constant names that explain the purpose.
- ALWAYS group related constants in a constants file or at the top of the file.
- Examples:
  - BAD: `if (attempts > 5)` or `setTimeout(fn, 300000)`
  - GOOD: `if (attempts > MAX_LOGIN_ATTEMPTS)` or `setTimeout(fn, CACHE_TTL_MS)`
