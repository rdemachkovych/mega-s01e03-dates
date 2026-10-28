# #4471 split — support kb page

The support desk merged 412 date reports into one ticket, #4471, and marked it *known: one issue,
one fix queued*. The reports hold more than one problem. This repo has one issue per problem, each
with how many reports it covers, and the kb page about them.

- **Tickets:** this repo's [issues](../../issues) — one per problem.
- **The page:** [`src/routes/kb/incidents/4471-split/+page.svx`](src/routes/kb/incidents/4471-split/+page.svx), signed.
- **The page as the desk sees it:** [`rendered/4471-split.html`](rendered/4471-split.html) (one file, CSS inlined) and [`rendered/4471-split.png`](rendered/4471-split.png).

## What is here

Only the files added to the desk's kb, at the paths they take in it:

```
src/routes/kb/incidents/4471-split/+page.svx   the page (words)
src/lib/kb/split.ts                            the split: problem per report, groups, counts
src/lib/kb/SplitTable.svelte                   the table the page renders
package.json, svelte.config.js, vite.config.js, src/app.html, src/routes/+layout.js
                                               build config (the export ships without one)
scripts/standalone.mjs                         one built page → one HTML file
rendered/                                      the built page and a screenshot
```

The counts are not typed into the page. `SplitTable` computes them at render time from the kb's
`reports-4471.json` and `desk-notes.json`: one id, one report; the tenant's locale and booking form
decide `parser` or `hint` (the kb's `causes.ts`); the desk's `oneDayMove` list decides `one-day`.
When the desk changes its data, the table follows.

## Build

Put these files over the desk's kb export (its `src/` tree), then:

```sh
npm ci
npm run build                     # static site in build/, page at build/kb/incidents/4471-split/
node scripts/standalone.mjs build kb/incidents/4471-split rendered/4471-split.html
```

Svelte 5, SvelteKit 2, mdsvex, adapter-static 3.
