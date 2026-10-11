# CIVIC WC.TC

HI lovable, I'm buildilng a Gamified Decentralized Democracy Platform MVP
Project Identification and Purpose
This prompt is for the development of CIVIL.quest, an innovative platform operating under the CIVIC Protocol. This Minimum Viable Product (MVP), designated as Version Pre-Alpha, will establish the foundational layer for a gamified, decentralized, representative-agent democracy platform. The core purpose is to transform civic participation into an engaging "live quest environment," where users can create identities, connect representative agents, evaluate proposals, earn rewards, and contribute to public decision-making. The project repository is uto-civil
The platform's aesthetic will strongly leverage SVG gaming models, ensuring a colorful, rewarding, and engaging user interface. The underlying principle of "public-by-default" civic records and interoperable agents will guide all foundational development, supporting decentralized node compatibility and open data feeds. The core UX promise is "Play democracy. Build the future."
Technical Context and Architectural Alignment
CIVIL.quest is designed as a public-facing web application that will connect humans, groups, agents, and external data sources within a structured democratic framework. The UI/UX blueprint (Figure 1 from the CIVIL.quest Technical Implementation Document) emphasizes a neon visual style, re-usable components, and a game-like engagement model. The platform will adhere to the principles outlined in the "Representative Democracy Protocol Whitepaper," allowing for broad interoperability and transparent governance.
Core Feature Request: MVP Development
This phase focuses on developing the essential MVP features, providing a functional system that demonstrates the core user loop and integration points.
User Interface and User Experience (UI/UX)
The platform's UI/UX must consistently embody a gamified approach, visually representing progress and engagement. This includes the implementation of:
Visual indicators for Points which we will call “Political Capital” PC points.
Badges for achievements.
Mission cards for guided participation.
Level progress tracking.
Clearly displayed reward counters and streaks. The overall visual style should use SVG gaming models, aligning with the "Play democracy. Build the future" ethos.
Lots of moving parts, sounds, and game like animations


Authentication and Identity Management
The platform will support a flexible and secure array of authentication methods, integrating both traditional and Web3-native identity solutions:
Email/Password Login as a standard authentication pathway.
Username connected to all email password logins for identity.
Solana Wallet Sign-in for seamless integration with blockchain-based verification, cryptographic voting, and potential future token interactions.
Each user will have a unique @username.

 Standard Platform Pages
The MVP will include critical informational and functional pages:
An engaging Main Landing Page designed to clearly explain CIVIL.quest and direct user onboarding.
A comprehensive About Page detailing the platform's mission, vision, and principles. Clearly stating that this is a Neurodiverse lead and Safe Space
A Pricing Page, dynamically integrated with ROOT for transparent value representation.
It is also important that the site as a whole is educational. Everything should have explanations, and info buttons, especially the first time going through it. Possibly even training pages and a fully searchable database for support, questions, and help.

Accessibility and Localization
To ensure broad participation and inclusivity, the platform demands:
Full Multi-language Support (i18n) across all UI elements and content.
An AI Toggle Button, providing users explicit control over AI integrations and interactions.
Integration of Neurodiverse Safe Space design principles throughout the user interface, optimizing for cognitive accessibility and comfort.

Core Platform Modules (MVP Scope)
The initial build will focus on implementing the critical modules defined in the CIVIL.quest Technical Implementation Document under "MVP Features":
Public Site: Landing page, how-it-works, live proposal teasers, protocol link, create account CTA.
Authentication / Profile: Human profile, interests, languages, public/private visibility.
Rights Card: Basic rights profile builder, verification level, public profile card.
Representative Agent: Create agent wizard, values, interests, tone, activation frequency, preview, profile page.
Issues / Topics: Issue pages, metrics, tags, categories, follow issue, top proposals.
Proposals: Proposal creation, support metrics, score voting 1-5, comments, consensus donuts, status.
Game Dashboard: Basic XP, level, badges, missions, streaks, civic power, leaderboard placeholders.
Democratic Experience Record: User impact stats, voting history, badges, record cards.
Node Directory: Node list, node roles, reputation/status, public node profile stub.

API and RSS Integration for Node Compatibility
To ensure full interoperability and adherence to the CIVIC Protocol's "public by default" principle, robust data export capabilities are required:
Public RSS Feeds: Generate RSS feeds for transparent dissemination of public data, including:
Global Civic Feed (/feeds/global.xml)
Issues Feed (/feeds/issues.xml)
Proposals Feed (/feeds/proposals.xml)
Deliberations Feed (/feeds/deliberations.xml)
Experience Records Feed (/feeds/records.xml)
Nodes Feed (/feeds/nodes.xml)
JSON API Endpoints: Provide standardized API endpoints for programmatic access to public data, specifically:
/api/v1/issues (GET)
/api/v1/proposals (GET/POST) The API and RSS outputs should conform to the structure and requirements detailed in Section 8 of the CIVIL.quest Technical Implementation Document.
As one site that is part of a node, we need to be able to communicate directly with other nodes, and so we will be integrating other APIs with our API and connect all the nodes together for direct inputs.

Technical Architecture and Constraints
Frontend Technologies
The frontend will be built as a responsive web application utilizing:
Next.js / React / TypeScript.
A Tailwind CSS system for rapid styling with reusable components and tokenized visual elements (cards, badges, modals), ensuring the neon visual style is implemented consistently.

Backend and Database
The backend infrastructure will prioritize scalability, flexibility, and Typed Endpoints:
Database: PostgreSQL via Supabase will serve as the primary database, leveraging its capabilities for relational data and JSONB fields for flexible metadata.
Backend API: Node.js/TypeScript API, or Supabase edge functions, favoring typed endpoints and event-driven records.

Storage and Realtime
Object Storage: For avatars, thumbnails, and record attachments.
Realtime: Supabase Realtime / WebSockets for live score updates, session interactions, and notifications.

MVP Acceptance Criteria
The generated MVP will be deemed successful if it meets the following criteria, as outlined in the CIVIL.quest Technical Implementation Document:
A new user can successfully create a profile, Rights Card, and representative agent without requiring administrative intervention.
A user can effectively browse issues, open, score (0-100%), and comment on a proposal, with real-time updates to their associated points and rewards.
A user can create a category and subsequently create a proposal within that specific category. Each proposal can have unlimited tags which operate as categories.
The platform automatically generates a public record for all votes, proposals, comments, and agent actions.
The platform successfully exposes basic RSS/JSON feeds for issues, proposals, records, and nodes.
An administrator can efficiently view content reports, verification queues, node status, and any flagged records.
Also we will be building a fully functional study systems where data can be saved reserved, and forked, THis may exist on an other site based on data feeds as well.

I have a lot of information and doccumenations to upload and get you. This includes all of our doccumentations, which I will start with. Then I will be uploading all of the Mobile UI iages, and then I have a lot of computer UI images as well. Then we can start buildilng. So lets plan for a few prompts since I am limited ot ONLY being able to upload 10 attachments at a time. 

I am really excited about buildilng this portal. It is over 20 yeras of hard work leading to this moment, and this may be one of the most extensive projects I have ever worked on. With the decentrilized model we are building, and the protocol infastructure, we can certainly stop at some points and decide to create a seperate platform instead that links into the overall protcol. In fact an other option for how to build this, would be instead to build the protocol site first, and then link together other sites like this one, into the broader protocol. But for now my plan was to just build this site as a protoype and then present the vision of teh protocol on this site, and then overtime we can expand the functioning of the protocol as we have more sites.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://civilwctc.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/58bb278b-274a-468d-b8d6-ee0f3c166234).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
