import React from 'react';
import { Chip } from '@material-ui/core';
import { useModulesManager, useTranslations } from '@openimis/fe-core';
import { MODULE_NAME, STATUS_COLORS } from '../../constants';

function StatusBadge({ status, size }) {
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);

  if (!status) return null;

  const backgroundColor = STATUS_COLORS[status] || STATUS_COLORS.PLANIFIE;

  return (
    <Chip
      label={formatMessage(`status.${status}`)}
      size={size || 'small'}
      style={{ backgroundColor, color: '#fff' }}
    />
  );
}

export default StatusBadge;
