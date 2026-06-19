# Pixel Nations — AI Operations Command Center v0.1

Status: STRATEGY / OPS FOUNDATION
Date: 2026-06-19

## Purpose

Pixel Nations needs a lightweight operations layer that reduces repeated manual prompting, protects Cursor/on-demand budget, and gives ChatGPT better current project evidence before making decisions.

This is not full autonomy yet.

This is a controlled command system that helps the Project Commander make better decisions.

## Current Decision

Do not buy a server yet.
Do not run autonomous Cursor loops yet.
Do not give an agent permission to merge, spend, or rewrite the product without approval.

First build a zero-cost local operations report:

`npm run pn:ops-report`

## Target Future Architecture

User
→ ChatGPT Project Commander
→ AI Operations Command Center
→ Virtual QA / Budget / Repo / Evidence agents
→ GitHub / Vercel / Cursor / QA reports

## Phase 1 — Local Ops Report

The first tool should collect:

- git branch
- git status
- recent commits
- package scripts
- QA handoff summary
- QA freshness
- public QA URLs
- docs index
- current risk notes
- recommended next command source

It should write outputs under:

`/Users/tomchuck/Desktop/Pixel Nations/Audit Bundles/Ops Reports/`

## Future Agent Roles

### Project Memory Agent

Reads docs, handoffs, decisions, and sprint history.

### QA Evidence Agent

Checks smoke, freshness, public QA, screenshots, and bundles.

### Budget Guardian

Blocks Cursor when scope is unclear or cost is unjustified.

### Sprint Planner

Drafts the next proposed sprint, but does not decide alone.

### Cursor Executor

Runs only approved scoped work.

### Merge Gatekeeper

Blocks merge without clean branch, smoke PASS, evidence FRESH, and review status.

### Report Agent

Creates daily/weekly summaries for the user and ChatGPT.

## Automation Safety Rules

The system must not:

- merge to main automatically without approval
- run Cursor repeatedly without a stop condition
- spend paid model budget without explicit scope
- rewrite product strategy
- ignore user feedback
- replace ChatGPT’s command responsibility
- treat smoke PASS as product acceptance

## Server Rule

A VPS/server becomes useful only after the local ops-report proves value.

Server purchase remains blocked until:

- local ops report works
- the report actually reduces repeated prompting
- roles and permissions are clear
- Cursor automation remains controlled
- budget limits are written

## Stop Condition

This foundation is complete when:

- `npm run pn:ops-report` works from the repo
- reports are written into the Pixel Nations desktop workspace
- no Cursor cost is required
- ChatGPT can use the report as a current evidence packet


## No Manual Latest-File Hunting Rule

The user should not have to search through timestamped files to know what to upload.

Automation scripts that generate repeated reports must also write a stable latest/upload file, for example:

- `LATEST_OPS_REPORT.md`
- `LATEST_OPS_REPORT.json`
- `UPLOAD_THIS_OPS_REPORT.md`
- `UPLOAD_THIS_FILE.txt`

Terminal output must clearly print the exact file to upload.

This is a permanent automation-quality rule for Pixel Nations.
