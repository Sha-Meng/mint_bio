## mint_bio Agent Instructions

### Default Working Mode

For this repository, all agents must follow an **OpenSpec / spec-driven workflow by default** unless the user explicitly asks for discussion only or requests a tiny one-off edit.

### Required Workflow

For any non-trivial task, agents must work in this order:

1. Clarify the user goal, scope, success criteria, and constraints.
2. Create or update a spec / plan file under `.codebuddy/plans/`.
3. Design before coding: explain the implementation approach, affected modules, compatibility impact, and alternatives when relevant.
4. Execute work using a todo-driven process.
5. Validate the result and summarize acceptance status, risks, and remaining follow-ups if any.

### Spec / Plan Requirement

For non-trivial work, the agent must maintain a corresponding Markdown plan in `.codebuddy/plans/`.
Recommended sections include:

- `name`
- `overview`
- `todos`
- `User Requirements`
- `Product Overview`
- `Core Features`
- `Tech Stack Selection`
- `Implementation Approach`
- `Implementation Notes`
- `Architecture Design`
- `Directory Structure`
- `Key Code Structures`
- `Validation / Acceptance`

If a plan for the same task already exists, update it instead of creating duplicate specs.

### Lightweight Exception

For tiny localized changes, agents may use a lightweight version of OpenSpec, but still must state:

- the goal
- the files being changed
- the validation method
- the final result

### Project-Specific Constraints

Agents must also follow project rules already defined in `.codebuddy/rules/`.
In particular:

- Follow `.codebuddy/rules/openspec-execution-policy.mdc` as the project-native OpenSpec policy.
- Follow `.codebuddy/rules/i18n-translation-policy.mdc` for all translation-related tasks.
- For i18n content, translations must strictly follow files in `doc/zh-en/`.
- Do **not** invent missing translations from context. If a translation is missing from the reference files, ask the user for it.

### Documentation Consistency

If implementation scope, assumptions, or solution design changes during execution, agents must update the corresponding plan so that the plan stays consistent with the final implementation.

### Priority

When there is any conflict, apply this priority:

1. direct user instruction
2. project safety / policy constraints
3. this `AGENTS.md`
4. implementation convenience
