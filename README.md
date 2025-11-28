# Catchup Feed Web

Next.js frontend for [Catchup Feed](https://github.com/Tsuchiya2/catchup-feed) - an automated RSS/Atom feed aggregation and AI summarization service.

## Overview

This is the web frontend for the Catchup Feed system, providing a user interface for:

- Viewing aggregated articles with AI-generated summaries
- Browsing RSS/Atom feed sources
- User authentication and personalization (future)

## Architecture

This project follows a microservices architecture pattern:

- **Frontend (this repo)**: Next.js application for UI
- **Backend ([catchup-feed](https://github.com/Tsuchiya2/catchup-feed))**: Go API for data management and AI summarization

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Data Fetching**: TanStack Query
- **Testing**: Vitest + Testing Library
- **API Types**: Generated from OpenAPI

## Documentation

- [Requirements Document](./docs/REQUIREMENTS.md) - Detailed project requirements and specifications

## Getting Started

*Coming soon after initial setup*

## License

MIT
