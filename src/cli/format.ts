import chalk from 'chalk';

/** Call once at startup to disable colour when --no-color is set. */
export function configureColor(noColor: boolean): void {
  if (noColor) {
    chalk.level = 0;
  }
}

export function fmt(): typeof chalk {
  return chalk;
}

// --- Table renderer ---

export interface Column {
  header: string;
  align?: 'left' | 'right';
}

export interface TableOptions {
  columns: Column[];
  rows: string[][];
  indent?: number;
  dimBorders?: boolean;
  /** Insert a separator row after these row indices (0-based). */
  separatorAfter?: number[];
}

/**
 * Render a box-drawing table.
 *
 * Returns an array of lines (no trailing newline).
 */
export function renderTable(opts: TableOptions): string[] {
  const { columns, rows, indent = 2, dimBorders = true, separatorAfter = [] } = opts;
  const c = fmt();
  const pad = ' '.repeat(indent);

  // Compute column widths
  const widths = columns.map((col, i) => {
    const dataMax = rows.reduce((max, row) => Math.max(max, (row[i] ?? '').length), 0);
    return Math.max(col.header.length, dataMax);
  });

  const border = dimBorders ? (s: string) => c.dim(s) : (s: string) => s;

  function cellStr(value: string, colIdx: number): string {
    const w = widths[colIdx];
    const align = columns[colIdx].align ?? 'left';
    return align === 'right' ? value.padStart(w) : value.padEnd(w);
  }

  function horizontalLine(left: string, mid: string, right: string): string {
    const segments = widths.map((w) => '─'.repeat(w + 2));
    return pad + border(left + segments.join(mid) + right);
  }

  function dataRow(row: string[]): string {
    const cells = columns.map((_, i) => ` ${cellStr(row[i] ?? '', i)} `);
    return pad + border('│') + cells.join(border('│')) + border('│');
  }

  const lines: string[] = [];

  // Top border
  lines.push(horizontalLine('┌', '┬', '┐'));

  // Header row
  const headerCells = columns.map((col, i) => ` ${cellStr(col.header, i)} `);
  lines.push(pad + border('│') + headerCells.join(border('│')) + border('│'));

  // Header separator
  lines.push(horizontalLine('├', '┼', '┤'));

  // Data rows
  rows.forEach((row, rowIdx) => {
    lines.push(dataRow(row));
    if (separatorAfter.includes(rowIdx)) {
      lines.push(horizontalLine('├', '┼', '┤'));
    }
  });

  // Bottom border
  lines.push(horizontalLine('└', '┴', '┘'));

  return lines;
}

// --- Output helpers ---

/** Format a number with comma separators. */
export function formatNumber(n: number): string {
  return n.toLocaleString('en-US');
}

/** Print lines with a blank line before. */
export function printSection(lines: string[]): void {
  console.log();
  lines.forEach((line) => console.log(line));
}
