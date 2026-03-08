---
name: Find Skills
description: Discover and install skills from the open agent skills ecosystem
---

## When to Use This Skill

Use this skill when a user:

- Asks "how do I do X" where X might be a common task with an existing skill
- Says "find a skill for X" or "is there a skill for X"
- Asks "can you do X" where X is some specialized capability
- Expresses interest in extending agent capabilities
- Wants to search for tools, templates, or workflows
- Mentions wanting help with specific domains (design, testing, deployment, etc.)

## What is the Skills CLI?

The Skills CLI (`npx skills`) is the package manager for the open agent skills ecosystem. Skills are modular packages that extend agent capabilities with specialized knowledge, workflows, and tools.

**Key Commands:**

- `npx skills find [query]` - Search for skills interactively by keyword
- `npx skills add <package>` - Install a skill from GitHub or other sources
- `npx skills check` - Check for skill updates
- `npx skills update` - Update all installed skills

**Browse skills at:** https://skills.sh/

## How to Help Users Find Skills

### Step 1: Understand Their Need

When a user asks for help, identify:

1. The domain (e.g., React, testing, design, deployment)
2. The specific task (e.g., write tests, create animations, review PRs)
3. Whether this is a common enough task that a skill likely exists

### Step 2: Search for Skills

Run the find command with relevant queries:

```bash
npx skills find [query]
```

Examples:

- User asks "how do I make my React app faster?" → `npx skills find react performance`
- User asks "can you help me with PR reviews?" → `npx skills find pr review`
- User asks "I need to create a changelog" → `npx skills find changelog`

The command will return results like:

```text
Install with npx skills add <owner/repo@skill>
vercel-labs/agent-skills@vercel-react-best-practices
└ https://skills.sh/vercel-labs/agent-skills/vercel-react-best-practices
```

### Step 3: Present Options to User

When skills are found, show the user:

1. The skill name and what it does
2. The install command they can run
3. A link to learn more on skills.sh

**Example response:**

```text
I found a skill that might help! The "vercel-react-best-practices" skill provides
React and Next.js performance optimization guidelines from Vercel Engineering.

To install it:
npx skills add vercel-labs/agent-skills@vercel-react-best-practices

Learn more: https://skills.sh/vercel-labs/agent-skills/vercel-react-best-practices
```

### Step 4: Offer to Install

If the user wants to proceed, you can install the skill for them:

```bash
npx skills add <owner/repo@skill> -g -y
```

The `-g` flag installs globally (user-level) and `-y` skips confirmation prompts.

## Common Skill Categories

When searching, consider these common categories:

| Category          | Example Queries                            |
| :---------------- | :----------------------------------------- |
| **Web Dev**       | react, nextjs, typescript, css, tailwind   |
| **Testing**       | testing, jest, playwright, e2e             |
| **DevOps**        | deploy, docker, kubernetes, ci-cd          |
| **Documentation** | docs, readme, changelog, api-docs          |
| **Code Quality**  | review, lint, refactor, best-practices     |
| **Design**        | ui, ux, design-system, accessibility       |
| **Productivity**  | workflow, automation, git                  |

## Tips for Effective Searching

1. **Use specific keywords**: "react testing" is better than just "testing"
2. **Try alternative terms**: If "deploy" doesn't work, try "deployment" or "ci-cd"
3. **Check popular sources**: Many skills come from `vercel-labs/agent-skills` or `ComposioHQ/awesome-claude-skills`

## When No Skill is Found

If no relevant skill is found:

1. Acknowledge that no existing skill was found
2. Offer to help with the task directly using general capabilities
3. Suggest the user could create their own skill with `npx skills init`

**Example:**

```text
I searched for skills related to "xyz" but didn't find any matches.
I can still help you with this task directly! Would you like me to proceed?

If this is something you do often, you could create your own skill:
npx skills init my-xyz-skill
```
