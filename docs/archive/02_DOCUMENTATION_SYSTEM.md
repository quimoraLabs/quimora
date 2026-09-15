# Quimora — Documentation System (V1 → V4)

## Overview
This document outlines the standardized documentation framework for the **Quimora** project. It defines the structure, purpose, and ownership of documentation files to prevent overlap, maintain single sources of truth, and ensure synchronization between code and documentation.

---

## Core Principles

### 1. "1 Fact, 1 File"
Every piece of information (feature status, API endpoint contract, business logic rule) must exist in exactly one location. Other documents must reference or link to the authoritative file rather than duplicating content.

### 2. Multi-Version Lifecycle Management (V1 → V4)
* **V1 (Shipped):** Historical baseline; document endpoints and models retroactively as needed.
* **V2 (Current):** Active implementation scope locked in the roadmap.
* **V3 / V4 (Future):** High-level roadmap items only. No detailed specification files should be created for future versions until they become the active development cycle.

---

## Architecture Layers & Specifications

| Layer | File Name | Purpose & Contents | Source / Mapping Strategy |
| :--- | :--- | :--- | :--- |
| **Layer 0** | `PRODUCT_SPEC.md` | Core vision, user personas (Student, Instructor, Admin), and explicit version boundaries (V1–V4 scope locks). | *New File* |
| **Layer 1** | `ARCHITECTURE.md` | System design, component diagrams, request lifecycles, and key technical decisions. | Extract from `agent/agent.md` (Section 1). |
| **Layer 2** | `API_REFERENCE.md` | Authoritative API contracts: endpoints, access controls, request bodies, success schemas, and error codes. | Consolidate from `backend/routes/` and `backend/controllers/`. |
| **Layer 3** | `DATA_MODEL.md` | Entity schemas (User, Quiz, Question, QuizAttempt), field definitions, relationships, indexes, and cascade rules. | Consolidate from backend models and completion reports. |
| **Layer 4** | `MASTER_ROADMAP.md` | Single unified backlog bucketed by version (`V1 Shipped`, `V2 Current`, `V3 Planned`, `V4 Future`). | Merge `README.md` roadmap, `V2-BACKLOG.md`, and `V2-PLAN-FRESH.md`. |
| **Layer 5** | `DECISIONS.md` | Log of immutable business rules and technical decisions (e.g., negative marking defaults, attempt limits). | *New File* |
| **Layer 6** | `TEST_STRATEGY.md` | Coverage overview (automated backend test suites vs. manual QA specs) and feature "Definition of Done". | Consolidate from existing test files and QA notes. |
| **Layer 7** | `AI_DELEGATION_GUIDE.md` | Standard operating procedures for working with AI/IDE tools and specifying technical tasks. | `03_AI_DELEGATION_GUIDE.md` |

---

## Migration Plan for Existing Documentation

| Existing File | Migration Action |
| :--- | :--- |
| **Root `README.md`** | Retain for public overview and setup instructions; replace the roadmap section with a link to `MASTER_ROADMAP.md`. |
| **`agent/agent.md`** | Retain as `ARCHITECTURE.md` (Layer 1); remove pending task listings in favor of linking to `MASTER_ROADMAP.md`. |
| **`backend/readme.md`** | Deprecate or merge into root `README.md` to eliminate duplicate technical summaries. |
| **`docs/bugs/*.md`** | Retain as historical bug reports and link from `TEST_STRATEGY.md`. |
| **`docs/implementation/V2-BACKLOG.md`** | Deprecate after consolidating active tasks into `MASTER_ROADMAP.md`. |
| **`docs/implementation/V2-PLAN-FRESH.md`** | Migrate priority tasks (P0–P3) into the V2 section of `MASTER_ROADMAP.md`. |
| **`docs/implementation/before-v2-plan.md`**, **`Admin-v1-plan.md`**, **`v1_final_completion_report.md`** | Move to `docs/archive/` as historical artifacts. |
| **`docs/implementation/PRODUCTION_DEPLOYMENT_GUIDE.md`** | Retain as an operational deployment reference. |