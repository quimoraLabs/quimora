# Quimora — AI Delegation Guide (Layer 7)

> **Document Type:** Layer 7 AI Standard Operating Procedure (SOP)  
> **Replaces:** `03_AI_DELEGATION_GUIDE.md`  
> **Last Updated:** 2026-09-15  

---

## 1. Overview & Core Directive

This document establishes a structured workflow for delegating development tasks to AI coding assistants (such as Antigravity, Cursor, Copilot, or Claude).

> **Core Rule:** The Developer/User acts as the **Planner**, and the AI assistant acts strictly as the **Executor**. The AI MUST NOT make silent architectural or business rule assumptions.

---

## 2. The 5-Step Delegation Process

### Step 1: Write a Task Specification
For every feature or bug fix, define a concise specification (10–15 lines) using the following structure:

```markdown
## Task: <One-line summary>

**Goal:** <Why this is needed and its user impact>
**Touches:** <Files or modules to modify>
**Acceptance Criteria:**
  - [ ] <Testable criterion 1>
  - [ ] <Testable criterion 2>
**Out of Scope:** <Explicitly list what should NOT be built>
**Related Docs:** <Reference section in API_REFERENCE.md or rule in DECISIONS.md>
**Owner Decisions:** <State pre-determined business rules>
```

### Step 2: Enforce "Plan First, Code Later"
Instruct the AI assistant to outline its approach prior to code execution:
> *"Before implementing, outline your proposed changes—list the files you intend to touch and your architectural approach. Do not generate code until I confirm the plan."*

### Step 3: Verify via Acceptance Criteria
Review the implementation by testing against defined Acceptance Criteria:
> *"Check the implementation against the acceptance criteria defined in the task spec. Confirm if each passes or fails."*

### Step 4: Enforce Documentation Sync
A task is only **Done** when all affected documentation layers in `docs/` are updated:
* **`MASTER_ROADMAP.md`**: Mark completed items (`[x]`).
* **`API_REFERENCE.md`**: Document new or modified endpoints.
* **`DECISIONS.md`**: Record any new business logic or technical decisions.

### Step 5: Conventional Commit
Use standardized commit messages (`feat:`, `fix:`, `docs:`).

---

## 3. Owner-Only Business Decisions Guardrail

AI models must never assume business rules. The following domains require explicit definition in `docs/DECISIONS.md`:
* **Grading Logic & Negative Marking**
* **Retake Policies & Attempt Limits**
* **Role Permissions & Edge Cases**

> **System Prompt Guardrail:** Always instruct the AI: *"If a business rule decision is missing from DECISIONS.md, ask for clarification before writing code. Do not make assumptions."*
