# Quimora — AI Delegation Guide

## Overview
This document establishes a structured workflow for delegating development tasks to AI models and IDE coding assistants (such as Cursor, GitHub Copilot, or Claude). By acting as the **Planner** and restricting the AI to an **Executor** role, this process prevents architectural drift, avoids silent business rule assumptions, and ensures documentation remains synchronized with code.

---

## The 5-Step Delegation Process

### Step 1: Write a Task Specification (Before Writing Code)
For every feature or bug fix, define a concise specification (10–15 lines) using the following structure:

```markdown
## Task: <One-line summary>

**Goal:** <Why this is needed and its user impact>
**Touches:** <Files or modules to modify, or "AI to suggest first">
**Acceptance Criteria:**
  - [ ] <Testable criterion 1, e.g., "Student cannot re-attempt a completed quiz">
  - [ ] <Testable criterion 2>
**Out of Scope:** <Explicitly list what should NOT be built in this task>
**Related Docs:** <Reference section in API_REFERENCE.md or rule in DECISIONS.md>
**Owner Decisions:** <State pre-determined business rules>
```

> **Tip:** If creating a spec is difficult, ask the AI in a separate prompt to draft the specification first without generating any code.

### Step 2: Enforce "Plan First, Code Later"
Instruct the AI assistant to outline its approach prior to code execution:

> *"Before implementing, outline your proposed changes—list the files you intend to touch and your architectural approach. Do not generate code until I confirm the plan."*

### Step 3: Verify via Acceptance Criteria
Review the implementation by testing against the defined Acceptance Criteria rather than auditing line-by-line code:

> *"Check the implementation against the 3 acceptance criteria defined in the task spec. Confirm if each passes or fails, and explain any failures."*

### Step 4: Enforce Documentation Updates
A task is only marked as **Done** when all affected documentation layers are updated:
* **`MASTER_ROADMAP.md`**: Mark completed items (`[x]`).
* **`API_REFERENCE.md`**: Document new or modified endpoints.
* **`DECISIONS.md`**: Record any new business logic or technical decisions.
* **`ARCHITECTURE.md`**: Reflect structural system changes.

### Step 5: Commit Strategy
Use standardized conventional commits (`feat:`, `fix:`, `docs:`) aligned with repository standards.

---

## Owner-Only Business Decisions

AI models must never assume business rules. The following domains require explicit definition in `DECISIONS.md`:

* **Grading Logic:** Negative marking percentages, passing criteria, and partial credit policies.
* **Retake Policies:** Default single vs. multi-attempt rules and per-quiz overrides.
* **Role Permissions & Edge Cases:** Actions such as deleting quizzes with active attempt histories.
* **Monetization & Billing:** Payment gateway behaviors and pricing tiers.
* **Data Retention:** Persistence and purging schedules for soft-deleted entities.

> **System Prompt Guardrail:** Always instruct the AI: *"If a business rule decision is missing from DECISIONS.md, ask for clarification before writing code. Do not make assumptions."*

---

## Delegation Quick Reference

### Task Execution Workflow
1. Write **Task Spec** (Goal, Acceptance Criteria, Out-of-Scope limits).
2. Request an **Implementation Plan** from the AI.
3. Review and approve the plan.
4. Execute code implementation.
5. Verify output against **Acceptance Criteria**.
6. Synchronize **Roadmap**, **API Reference**, and **Decisions Log**.
7. Commit using conventional commit standard.

### Verification Prompts
* *"Did you make any business rule assumptions that are not in DECISIONS.md?"*
* *"What edge cases or acceptance criteria might fail under stress?"*
* *"Which files were modified, and do we need to update MASTER_ROADMAP.md or API_REFERENCE.md?"*