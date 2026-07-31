export function daysBetween(a: string, b: string): number {
  const da = new Date(a + 'T00:00:00');
  const db = new Date(b + 'T00:00:00');
  return Math.round((db.getTime() - da.getTime()) / (1000 * 60 * 60 * 24));
}

export interface GanttBar {
  id: string;
  label: string;
  start: string; // ISO date
  end: string; // ISO date (exclusive-ish, end of activity)
  color: string;
  blocked?: boolean;
}

export interface LaidOutBar extends GanttBar {
  row: number;
}

/**
 * Packs bars into the fewest stacked rows such that no two bars in the same
 * row overlap in time. This is what makes overloaded departments visually
 * "stack up" in the Gantt.
 */
export function packBars(bars: GanttBar[]): { rows: LaidOutBar[][]; rowCount: number } {
  const sorted = [...bars].sort((a, b) => a.start.localeCompare(b.start));
  const rowEnds: string[] = []; // end date currently occupying each row
  const laidOut: LaidOutBar[] = [];

  for (const bar of sorted) {
    let placed = false;
    for (let row = 0; row < rowEnds.length; row++) {
      if (rowEnds[row] <= bar.start) {
        rowEnds[row] = bar.end;
        laidOut.push({ ...bar, row });
        placed = true;
        break;
      }
    }
    if (!placed) {
      rowEnds.push(bar.end);
      laidOut.push({ ...bar, row: rowEnds.length - 1 });
    }
  }

  const rows: LaidOutBar[][] = Array.from({ length: rowEnds.length }, () => []);
  for (const bar of laidOut) rows[bar.row].push(bar);
  return { rows, rowCount: rowEnds.length };
}
