# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Medical students of the 7th period (Clínica Médica): the site owner and classmates from the same class. They use it to study for the AC exams (AC 1, AC 2, AC 3 upcoming), both on a computer and on a phone, in roughly equal measure — long review sessions at a desk and quick reviews on the go.

## Product Purpose
A study hub ("Central de Estudos") that gathers everything needed for each AC exam in one place: study materials (tutorial and conference summaries rendered as page images), flashcard decks by theme, an ECG guide with flashcards, and clinical-case mock exams (simulados) with commented answers and a final score. Success is a student opening it, finding the right AC and tool in seconds, and staying focused through a review session.

## Positioning
Made by a classmate for the class: content is scoped exactly to this period's tutorias, conferências and exams, in Portuguese.

## Operating Context
- Static HTML pages, no build step, hosted as plain files (an `.assetsignore` suggests Cloudflare Workers/Pages static assets).
- Pages: `index.html` (landing with AC 1/2/3 picker, then per-AC hub), `materiais_ac1.html`, `materiais.html` (AC 2: Tutorias + Conferências sidebar), `AC1.html`, `AC2.html` (flashcards with deck effect, sound, performance rating), `ecg.html` (21-section guide + flashcards), `simulado_ac1.html`, `simulado_ac2.html` (50 questions each).
- Material pages show PNG page images from `assets/materiais*/`.
- The owner is not a programmer; changes are made with Claude.

## Capabilities and Constraints
- Must keep all content, data, counts and functions intact (flashcard data, question banks, image paths, localStorage state such as sidebar preference).
- Counts shown on the home cards (`.meta`) must match content (e.g. "15 temas · 630 cards").
- AC 3 and AC 2 ECG are placeholders ("Em breve").
- Must work well on both desktop and phone.

## Brand Commitments
Name: "7º Período" / "Sétimo Período", subtitle "Central de Estudos", "Clínica Médica". Language: Portuguese (pt-BR). No logo beyond `assets/favicon.png`.

Visual direction (2026-09-29): the owner tried two redesigns (Notion dark, then 'Apostila com abas') and rejected both; they prefer the **original layout** (black background, blue accent, Space Grotesk + Inter, sidebar, big AC squares on the landing). Improvements must stay inside that layout: motion, effects and interactivity only. All of it lives in `assets/efeitos.css` + `assets/efeitos.js`, linked at the end of every page.

## Evidence on Hand
Real content only: flashcard decks, question banks, material page images. No testimonials, user counts, or claims should be invented.

## Product Principles
1. Find the right material in seconds: AC → tool → content, no detours.
2. Stay out of the way while studying: reading, flipping cards and answering questions come first.
3. Reward progress: feedback on answers and performance should feel encouraging.
4. Same experience on phone and computer.
