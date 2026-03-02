import { describe, it, expect } from 'vitest';
import { renderTable, formatNumber, configureColor } from './format.js';

// Disable colour for predictable test output
configureColor(true);

describe('renderTable', () => {
  it('renders a basic table', () => {
    const lines = renderTable({
      columns: [
        { header: 'Name', align: 'left' },
        { header: 'Value', align: 'right' },
      ],
      rows: [
        ['Alice', '10'],
        ['Bob', '200'],
      ],
    });

    expect(lines[0]).toContain('┌');
    expect(lines[0]).toContain('┬');
    expect(lines[0]).toContain('┐');
    expect(lines[1]).toContain('Name');
    expect(lines[1]).toContain('Value');
    expect(lines[3]).toContain('Alice');
    expect(lines[3]).toContain('10');
    expect(lines[4]).toContain('Bob');
    expect(lines[4]).toContain('200');
    expect(lines[lines.length - 1]).toContain('└');
  });

  it('right-aligns numeric columns', () => {
    const lines = renderTable({
      columns: [
        { header: 'X', align: 'left' },
        { header: 'Y', align: 'right' },
      ],
      rows: [['ab', '1'], ['c', '99']],
    });

    // Find the data rows (index 3 and 4)
    const row1 = lines[3];
    const row2 = lines[4];
    // Right-aligned: "1" should be padded to same width as "99"
    expect(row1).toContain(' 1');
    expect(row2).toContain('99');
  });

  it('supports separator rows', () => {
    const lines = renderTable({
      columns: [{ header: 'A' }],
      rows: [['x'], ['y'], ['z']],
      separatorAfter: [0],
    });

    // Should have: top, header, sep, row0, sep, row1, row2, bottom = 8 lines
    expect(lines).toHaveLength(8);
    expect(lines[4]).toContain('├');
  });

  it('handles empty rows', () => {
    const lines = renderTable({
      columns: [{ header: 'Name' }],
      rows: [],
    });
    // top, header, header-sep, bottom = 4 lines
    expect(lines).toHaveLength(4);
  });
});

describe('formatNumber', () => {
  it('formats numbers with commas', () => {
    expect(formatNumber(1000)).toBe('1,000');
    expect(formatNumber(10000)).toBe('10,000');
    expect(formatNumber(42)).toBe('42');
  });
});
