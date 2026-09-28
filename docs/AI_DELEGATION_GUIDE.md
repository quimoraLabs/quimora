# Quimora — AI Delegation Guide (Layer 7)

> **Document Type:** Layer 7 AI Standard Operating Procedure (SOP)  
> **Replaces:** Legacy `03_AI_DELEGATION_GUIDE.md`  
> **Last Updated:** 2026-09-28  

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
**Related Docs:** <Reference section in V3_PLAN.md, API_REFERENCE.md, or rule in DECISIONS.md>
**Owner Decisions:** <State pre-determined business rules>
```

### Step 2: Enforce "Plan First, Code Later"
Instruct the AI assistant to outline its approach prior to code execution:
> *"Before implementing, outline your proposed changes—list the files you intend to touch and your architectural approach. Do not generate code until I confirm the plan."*

### Step 3: Verify via Acceptance Criteria
Review the implementation by testing against defined Acceptance Criteria and Vitest automated suites (`backend/tests/05_v3_adaptive_engine.test.js`):
> *"Check the implementation against the acceptance criteria defined in the task spec. Confirm if each passes or fails."*

### Step 4: Enforce Documentation Sync
A task is only **Done** when all affected documentation layers in `docs/` are updated:
* **`MASTER_ROADMAP.md`**: Mark completed items (`[x]`).
* **`V3_PLAN.md` & `agent/agent.md`**: Update sprint phase progress.
* **`API_REFERENCE.md`**: Document new or modified endpoints.
* **`DATA_MODEL.md`**: Document Mongoose schemas (`Interest`, `EloRating`, `Level`, `InstructorProfile`, `QuizAssignment`).
* **`DECISIONS.md`**: Record any new business logic, Elo math ($K=32$), level thresholds, or consent rules.

### Step 5: Conventional Commit (Local Only)
Use standardized commit messages (`feat:`, `fix:`, `docs:`).

> ⛔ **NO AUTOMATED GIT PUSH:** The AI assistant is strictly forbidden from executing `git push`. Local commit staging is allowed when requested, but pushing to remote MUST always be done manually by the user.

---

## 3. Owner-Only Business Decisions Guardrail

AI models must never assume business rules. The following domains require explicit definition in `docs/DECISIONS.md`:
* **Elo Rating Formula & K-Factor ($K=32$)**
* **Interest Tagging & Filtering Criteria**
* **Level Mapping Threshold Matrix (Beginner to Expert)**
* **Instructor 1:1 Quiz Assignment & Student Consent Flow**
* **Instructor Privacy Data Isolation (Assigned vs Aggregate)**
* **Grading Logic, Negative Marking & Timer Grace Buffer**

> **System Prompt Guardrail:** Always instruct the AI: *"If a business rule decision is missing from DECISIONS.md, ask for clarification before writing code. Do not make assumptions."*
