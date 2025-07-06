# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Application Overview

This is an AI-powered External Link Optimization Tool that analyzes text content, extracts key terms, and automatically finds relevant external links to enhance articles. Built with Next.js 15 and the T3 Stack.

## Development Commands

### Essential Commands
- `bun dev` - Start development server with Turbo
- `bun build` - Create production build
- `bun lint` - Run Biome linter
- `bun lint:fix` - Auto-fix linting issues
- `bun typecheck` - Run TypeScript type checking
- `bun check` - Run both Next.js lint and TypeScript checks

### Database Commands
- `bun db:push` - Push schema changes to database
- `bun db:studio` - Open Drizzle Studio for database management
- `bun db:generate` - Generate database migrations
- `bun db:migrate` - Run database migrations

## Architecture Overview

### Core Workflow
1. **Text Analysis**: User input → AI (GPT-4) → Keyword extraction
2. **Link Generation**: Keywords → Serper API → Filtered results → Display
3. **Authentication**: Email → Magic link → Redis session storage

### Key Directories
- `src/app/` - Next.js app router pages and layouts
- `src/actions/` - Server actions for keyword analysis and link fetching
- `src/components/keyword-editor/` - Main UI component for text analysis
- `src/stores/` - Zustand stores for state management
- `src/server/kv/` - Upstash Redis integration

### Technology Stack
- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS + Shadcn UI
- **State**: Zustand
- **Auth**: NextAuth.js with email magic links
- **AI**: OpenAI GPT-4
- **Search**: Serper API
- **Cache/DB**: Upstash Redis
- **Email**: Plunk
- **Linting**: Biome (NOT ESLint/Prettier)

## Development Guidelines

### Code Style (from .cursorrules)
- Use `interface` over `type`, avoid `enum`
- Prefer functional components and React Server Components
- Write JSDoc comments in Chinese for all functions
- Use `bun` for all package management
- Follow mobile-first responsive design
- Support light/dark theme toggle

### Important Patterns
- Minimize `use client` directives - prefer server components
- Use server actions for data mutations
- Implement rate limiting for unauthenticated users (3 requests/day)
- All environment variables are validated at runtime

### Testing
Currently no test suite is configured. The .cursorrules mentions Vitest as the preferred testing framework.

## Environment Variables
Key environment variables are validated in `src/env.js`. Critical ones include:
- `OPENAI_API_KEY` - For GPT-4 keyword extraction
- `SERPER_API_KEY` - For Google search results
- `PLUNK_API_KEY` - For email sending
- `UPSTASH_REDIS_REST_*` - For Redis cache/sessions
- `RESEND_API_KEY` - For transactional emails