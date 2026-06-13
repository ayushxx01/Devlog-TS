# DevLog

DevLog is an AI-powered developer journaling platform that transforms daily GitHub activity into meaningful progress updates.

The project was built to solve a personal problem: staying consistent with documenting and sharing development progress without manually converting commit history into blog posts or social media updates.

Instead of publishing raw commit messages, DevLog collects development activity throughout the day, generates a high-level summary of completed work using AI, and sends it to Discord for review before publication.

---

# Motivation

When building projects, I often wanted to maintain a public development log and share progress consistently.

The problem was that commit messages are usually written for developers, not for readers.

For example:

```txt
fix padding issue
update webhook route
change button styles
```

These commits may be useful internally but are not meaningful progress updates.

DevLog aims to answer a more useful question:

> What did I actually accomplish today?

---

# Current Workflow

```txt
Git Push
    ↓
GitHub Webhook
    ↓
Render Backend
    ↓
Neon PostgreSQL
    ↓
Store Commits
    ↓
Scheduled Daily Job
    ↓
Gemini AI Summary Generation
    ↓
Discord Review
    ↓
Approve / Skip
    ↓
Store Approved Summary
    ↓
Blog API
    ↓
Portfolio DevLog Section
```

---

# Architecture

## GitHub Webhooks

DevLog currently uses GitHub Webhooks to capture commit activity.

Whenever code is pushed to a connected repository, GitHub sends a webhook event to the backend, allowing commit information to be collected in real time.

---

## Render

The backend is deployed on Render and runs continuously in the cloud.

This allows commit tracking, scheduled summary generation, Discord integration, and blog serving without depending on a local machine.

---

## Neon PostgreSQL

Neon PostgreSQL serves as the primary data store.

It stores:

* Incoming GitHub commits
* Repository metadata
* Approved development summaries

This allows DevLog to build historical development logs and expose them through a public API.

---

## Gemini AI

Gemini is responsible for transforming raw commit activity into meaningful development updates.

Rather than rewriting commit messages, the goal is to identify outcomes and accomplishments from a collection of commits.

Example:

Raw commits:

```txt
add webhook endpoint
connect postgres
add discord approval buttons
```

Generated summary:

```txt
Built the core DevLog workflow, enabling GitHub activity
to be captured, stored, summarized, and reviewed through Discord.
```

The focus is on progress rather than implementation details.

---

## Discord Approval Layer

Discord acts as the review and approval system.

Generated summaries are delivered to a Discord channel where they can be approved or skipped before publication.

This introduces a human review step and prevents low-value updates from being published automatically.

---

## Blog API

Approved summaries are exposed through a paginated REST API.

Example:

```http
GET /blogs?page=1
```

The endpoint returns the latest approved development logs, allowing external clients such as a portfolio website to display them dynamically.
Live => https://ayushxx01.vercel.app/#logs
---

# Why Store Commits?

Commits are collected throughout the day instead of being processed immediately.

This allows DevLog to:

* Capture complete development activity
* Build context across multiple commits
* Generate higher-quality summaries
* Avoid publishing noisy commit-by-commit updates

---

# Current Features

* GitHub Webhook integration
* Render deployment
* Neon PostgreSQL integration
* Commit persistence
* Daily commit retrieval
* Gemini AI summary generation
* Automated scheduling with node-cron
* Discord bot integration
* Approve / Skip workflow
* Approved summary storage
* Paginated blog API
* Portfolio blog integration

---

# Current Limitations

## Repository Tracking

Repositories must currently be connected manually through GitHub Webhooks.

Only repositories that have DevLog configured as a webhook source will be tracked.

---

## Personal Use

The platform currently operates as a personal developer journaling tool and does not support multiple users.

---

## GitHub Coverage

DevLog cannot yet automatically discover activity across an entire GitHub account.

Repositories must be explicitly connected.

---

## Publishing Targets

The current version publishes approved summaries to the portfolio blog.

Direct publishing to external social platforms is still under development.

---

# V2 Roadmap

## Multi-Repository Support

Support multiple connected repositories and generate repository-aware summaries.

Example:

```txt
DevLog
- Added approval workflow
- Added blog API

Faraway
- Improved relationship journaling flow

Portfolio
- Added DevLog integration
```

---

## GitHub Account Integration

Move beyond webhook-only tracking by integrating with the GitHub API.

Goals:

* Track activity across all repositories
* Eliminate manual webhook setup
* Generate complete daily development journals

---

## Social Publishing

Support publishing approved summaries to:

* X (Twitter)
* LinkedIn
* Additional platforms

---

## Advanced AI Features

* Better commit clustering
* Weekly recaps
* Monthly recaps
* Repository-specific summaries
* Improved noise filtering

---

## Multi-User Support

Allow developers to connect their own GitHub accounts and generate personalized development journals.

Potential additions:

* GitHub OAuth
* Discord onboarding
* User-specific dashboards
* Multiple publishing destinations

---

# Status

Currently functional and under active development.

The current version successfully:

* Captures GitHub activity
* Stores commit history
* Generates AI-powered summaries
* Supports Discord-based approval workflows
* Persists approved development logs
* Exposes them through a paginated API
* Displays them on a portfolio website

The long-term goal is to create a developer journaling platform that helps developers maintain a meaningful development history while making it easier to share progress publicly.
