export interface BadgeStyle {
  label: string;
  className: string;
}

export const typeBadge: Record<string, BadgeStyle> = {
  dice: {
    label: 'Dice',
    className: 'bg-badge-dice-bg text-badge-dice-text',
  },
  card: {
    label: 'Card',
    className: 'bg-badge-card-bg text-badge-card-text',
  },
  list: {
    label: 'List',
    className: 'bg-badge-list-bg text-badge-list-text',
  },
};

const fallbackBadge: BadgeStyle = {
  label: 'Unknown',
  className: 'bg-edge-subtle text-muted',
};

export function getBadge(type: string): BadgeStyle {
  return typeBadge[type] ?? { ...fallbackBadge, label: type };
}
