# Khaaliq Digital Champion Platform

> **Portfolio maturity:** Live Pilot Platform · Human-Led Business Activation and Delivery Workflow

[Open the verified live platform](https://khaaliqsdc.uk)

Khaaliq Digital Champion Platform combines a public campaign presence, structured entrepreneur intake, team delivery pipeline and configurable payment handoff for a Sarawak Digital Champion service journey.

The repository identity remains **Khaaliq Digital Champion Platform**; it should not be presented merely as an MVP.

## Business problem

Small entrepreneurs often submit incomplete business information across WhatsApp, email, cloud folders and multiple forms. Delivery teams then spend time reorganising links, files, requirements, payment status and website-production notes before work can begin.

This product creates one guided flow:

**Discover → submit business profile → review → prepare delivery brief → build → preview → confirm payment → onboard → publish**

## Intended users

- entrepreneurs seeking a guided digital-presence service;
- a named Digital Champion acting as the public service lead;
- KOBIS business-development and delivery personnel;
- authorised reviewers managing intake, preparation and payment status.

## Core capabilities

- a public Digital Champion landing experience;
- a short entrepreneur-intake flow with consent;
- bulk link entry with deterministic classification;
- file metadata classification with manual correction;
- a generated business summary and readiness indicators;
- a team dashboard with search, filtering, stage management and exports;
- structured client-folder and delivery-prompt generation;
- a return path for completed delivery materials;
- shared submission storage through Netlify Functions and Blobs;
- configurable WhatsApp lead-alert integration;
- configurable online-billing and payment-callback integration;
- local browser fallback for demonstration and continuity.

## Strategic value

The platform demonstrates a practical hybrid operating model: software structures the work while people retain responsibility for review, communication, production and client approval.

With appropriate controls, it can:

- reduce repeated questions during entrepreneur intake;
- turn unstructured business material into a clearer delivery brief;
- give the team one visible service pipeline;
- connect lead intake, human review, build preparation and payment status;
- create a replicable Digital Champion activation model for additional districts or service leads.

These are intended operational benefits, not claims of customer volume, revenue, conversion or official programme adoption.

## What the “intelligence” currently means

The browser engine uses deterministic rules to:

- identify common link types;
- classify file metadata;
- calculate a completeness and readiness score;
- recommend possible digital solutions;
- assemble business summaries and production prompts.

It does not independently verify a business, determine government eligibility or call a live language model for these outputs. Scores and recommendations are workflow aids that require human review.

## What is implemented

The repository contains the public site, activation flow, team dashboard, deterministic engine, four-language content, payment pages, shared-data functions and integration code for alerts and billing.

### Technology

HTML · CSS · vanilla JavaScript · localStorage fallback · Netlify Functions · Netlify Blobs · JSZip · configurable WATI integration · configurable ToyyibPay integration · Netlify hosting

The presence of integration code and a ready deployment does not prove transaction volume, settlement, service fulfilment or production-security assurance.

## Delivery role

**Ts. Zaiwin Kassim** leads product strategy, stakeholder requirements, solution architecture and supervised AI-assisted delivery with the **KOBIS AI Prodigy Team**. For this platform, that role covers the Digital Champion service model, entrepreneur journey, operational pipeline, system integration direction and responsible-use controls.

Khaaliq serves as the named public-facing champion within the project context. This repository does not by itself establish government appointment, programme endorsement, exclusivity or adoption.

## Responsible-use boundaries

- Intake data can contain personal and commercially sensitive information and requires a clear privacy notice, lawful purpose, restricted access, retention period and deletion process.
- Link and file classification describes submitted material; it does not verify authenticity, ownership or legal rights.
- Readiness and lead scores must not be used as government, credit, grant or service-eligibility decisions.
- Website copy, summaries and recommended solutions require business-owner approval.
- WhatsApp alerts must use approved templates, authorised recipients and compliant opt-in practices.
- Payment status must be confirmed through the authorised provider and reconciled against accounting records.
- Payment credentials, tokens, callbacks and environment configuration must remain outside public documentation and source control.
- A successful payment callback does not prove that a website, domain, email account or support package was delivered.
- Dashboard access requires production-grade authentication, named accounts, role controls and audit logs before wider team use.
- Exported folders and spreadsheets inherit the same privacy duties as the primary system.

## Current limitations

- deterministic rules are presented through an AI-style experience but do not constitute independent AI verification;
- localStorage and shared-backend modes can behave differently and require explicit environment testing;
- file intake may store metadata rather than complete binary assets in some flows;
- production access-control, backup, recovery and deletion assurance are not documented as independently tested;
- third-party alert and payment availability depends on external accounts, approvals and configuration;
- no adoption, payment, publication or impact totals are verified by this README;
- multilingual content and commercial terms require authorised review;
- an automated end-to-end test suite is not documented.

## Run locally

Serve the repository as static files:

    python3 -m http.server 8000

Then open:

- http://localhost:8000 — public landing page
- http://localhost:8000/activate.html — entrepreneur intake
- http://localhost:8000/dashboard.html — demonstration dashboard

Backend integrations require separately approved Netlify and provider configuration.

## Deployment evidence

The connected hosting record identifies **khaaliqsdc** as the project, maps it to https://khaaliqsdc.uk and reports the current deployment as ready.

This verifies the hosted platform, not official status, customer adoption, payment success or fulfilment quality.

## Repository map

- **index.html** and **landing.js** — public champion experience
- **activate.html** and **app.js** — entrepreneur intake
- **engine.js** — deterministic classification, scoring and summaries
- **dashboard.html** and **dashboard.js** — delivery pipeline and exports
- **pay.html** and **pay.js** — payment handoff experience
- **netlify/functions** — submissions, billing and payment callback functions
- **sync.js** — shared-record synchronisation
- **i18n.js** — multilingual content
- **privacy.html** — current privacy-facing content
- **netlify.toml** — static and serverless hosting configuration

Operational credentials, account details and settlement information should be maintained in restricted systems rather than public repository documentation.

## Portfolio evidence

Khaaliq Digital Champion Platform demonstrates end-to-end service architecture, structured entrepreneur intake, transparent automation, serverless integration and a scalable hero-partner model with human accountability.
