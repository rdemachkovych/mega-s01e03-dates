// #4471 split back into the problems its reports show, counted the desk's way. The page explains it;
// this file is what runs.
import { causeOf, uniqueById, type Report } from '#lib/kb/causes';
import { tenantOf } from '#lib/kb/locales';

// `parser` and `hint` come from the tenant (causes.ts): every report has one of them. A one-day move
// is a third problem: the day moves by one, the month stays. The desk lists the reports it read that
// way in desk-notes.json and keeps counting them where they're filed, under their tenant's cause.
export type Problem = 'parser' | 'hint' | 'one-day' | 'unplaced';

export type ProblemGroup = {
  problem: Problem;
  reports: Report[];
  tenants: number;
  channels: Record<string, number>;
  firstSeen: string;
  lastSeen: string;
  // For `one-day`: the groups its reports are also counted in, group → count.
  alsoIn: Partial<Record<Problem, number>>;
};

function group(problem: Problem, rs: Report[], alsoIn: ProblemGroup['alsoIn'] = {}): ProblemGroup {
  const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
  return {
    problem,
    reports: rs,
    tenants: new Set(rs.map((r) => r.tenant)).size,
    channels: rs.reduce<Record<string, number>>((n, r) => ({ ...n, [r.channel]: (n[r.channel] ?? 0) + 1 }), {}),
    firstSeen: days[0],
    lastSeen: days[days.length - 1],
    alsoIn,
  };
}

export function splitTicket(all: Report[], ticket: number, oneDayMove: readonly string[]) {
  const merged = uniqueById(all).filter((r) => r.mergedInto === ticket);
  const causeOfReport = (r: Report): Problem => causeOf(r, tenantOf(r)) ?? 'unplaced';

  const byCause = new Map<Problem, Report[]>();
  for (const r of merged) byCause.set(causeOfReport(r), [...(byCause.get(causeOfReport(r)) ?? []), r]);
  const groups = [...byCause.entries()].map(([p, rs]) => group(p, rs)).sort((a, b) => b.reports.length - a.reports.length);

  const moved = merged.filter((r) => oneDayMove.includes(r.id));
  if (moved.length) {
    const alsoIn = moved.reduce<ProblemGroup['alsoIn']>((n, r) => ({ ...n, [causeOfReport(r)]: (n[causeOfReport(r)] ?? 0) + 1 }), {});
    groups.push(group('one-day', moved, alsoIn));
  }
  return { rows: all.length, repeats: all.length - uniqueById(all).length, merged, groups };
}
