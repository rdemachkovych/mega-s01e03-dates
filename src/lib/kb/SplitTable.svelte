<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import type { Report } from '#lib/kb/causes';
  import { splitTicket, type Problem } from '#lib/kb/split';

  // Where each problem is tracked now: problem → ticket URL.
  let { ticket, tickets }: { ticket: number; tickets: Partial<Record<Problem, string>> } = $props();

  const split = $derived(splitTicket(reports as Report[], ticket, notes.oneDayMove));
  const channels = (c: Record<string, number>) =>
    Object.entries(c)
      .sort((a, b) => b[1] - a[1])
      .map(([ch, n]) => `${ch} ×${n}`)
      .join(' · ');
  const issueNo = (url: string) => url.replace(/.*\/issues\//, '#');
</script>

<p class="sum">
  <strong>{split.merged.length}</strong> reports in #{ticket} ·
  <strong>{split.groups.length}</strong>
  {split.groups.length === 1 ? 'problem' : 'problems'}
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>tenants</th><th>came in by</th><th>seen</th><th>ticket</th></tr>
  </thead>
  <tbody>
    {#each split.groups as g (g.problem)}
      <tr class:open={!tickets[g.problem]}>
        <td><code>{g.problem}</code></td>
        <td>{g.reports.length}{#if Object.keys(g.alsoIn).length}<sup>*</sup>{/if}</td>
        <td>{g.tenants}</td>
        <td class="small">{channels(g.channels)}</td>
        <td>{g.firstSeen} → {g.lastSeen}</td>
        <td>
          {#if tickets[g.problem]}<a href={tickets[g.problem]}>{issueNo(tickets[g.problem]!)}</a>{:else}no ticket yet{/if}
        </td>
      </tr>
    {/each}
  </tbody>
</table>

<p class="small">
  {split.groups.filter((g) => !Object.keys(g.alsoIn).length).map((g) => g.reports.length).join(' + ')} =
  {split.merged.length} unique reports · {split.rows} rows in the export, {split.repeats} of them repeats of the same id.
</p>

{#each split.groups.filter((g) => Object.keys(g.alsoIn).length) as g (g.problem)}
  {#each Object.entries(g.alsoIn) as [cause, n] (cause)}
    <p class="small">
      The {n} <code>{g.problem}</code> reports are counted under <code>{cause}</code> too: the desk files a report
      by its tenant and reads it as a one-day move (<code>desk-notes.json</code>).
    </p>
  {/each}
{/each}

<style>
  .sum { font-size: 1.1rem; }
  .small { color: var(--muted); font-size: 0.85em; }
  .open td { background: var(--warn-bg); }
  .open td:last-child { color: var(--warn); font-weight: 600; }
</style>
