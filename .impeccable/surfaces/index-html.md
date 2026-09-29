---
version: 1
slug: "index-html"
primary_target: "index.html"
related_targets: ["AC1.html","AC2.html","ecg.html","materiais.html","materiais_ac1.html","simulado_ac1.html","simulado_ac2.html"]
---

## Scope
Whole site (index + 7 study pages). Visitor mode: Operate (home, flashcards, simulados) and Read (materiais, ECG guide). Audience: 7th-period medical students (owner + class), desktop and phone equally.

## Direction contract
THESIS: The study hub as a Notion workspace in dark mode (user took the category standard; Notion dark is the craft bar). It refuses the neon-blue-glow-on-black look the site shipped with.
OWN-WORLD: Notion dark palette: #191919 page, #202020 sidebar, #252525 blocks, hairline rgba(255,255,255,.094), text rgba(255,255,255,.81), Notion blue #2383e2 as the single action color, Notion tag colors (green/red/yellow/gray) only for state. System UI sans, tabular numerals, 6px controls, 10px blocks, caduceus page icon as a mask.
STORY: The student lands on the workspace home, picks AC 1/2/3 from view tabs or the sidebar page tree, opens a tool in one click, and studies with no chrome in the way; progress is visible and remembered.
FIRST VIEWPORT: Left sidebar page tree (AC 1 / AC 2 / AC 3 expandable). Main: breadcrumb top bar, caduceus page icon, title "7º Período", subtitle line, then a database block with view tabs (AC 1, AC 2, AC 3) and a table/list of the tools with Status and Conteúdo properties; rows open the tool.
FORM: Canon (category standard, Notion dark) chosen by the user; seed key d9a340d1.
SIGNATURE INTERACTION: database view tabs with a sliding underline and row hover "Abrir" affordance; flashcards flip on the Y axis; live simulado progress read from localStorage.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
