import React from 'react';
import { PresenceStatus, STATUS_CONFIG } from '../types';

interface StatusBadgeProps {
  status: PresenceStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config = STATUS_CONFIG[status];

  return (
    <span
      className={`inline-flex items-center rounded-md border text-xs px-2.5 py-1 gap-2 font-medium tracking-wide ${config.badgeClass}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotClass}`} aria-hidden="true" />
      <span>{config.label}</span>
    </span>
  );
};
