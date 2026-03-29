import React from 'react';
import { Chip } from '@material-ui/core';
import { useModulesManager, useTranslations } from '@openimis/fe-core';
import { MODULE_NAME, WEEKLY_STATUS_COLORS } from '../../constants';

function WeeklyStatusBadge({ status, size }) {
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);

  if (!status) return null;

  const backgroundColor = WEEKLY_STATUS_COLORS[status] || WEEKLY_STATUS_COLORS.PLANIFIE;
  const needsDarkText = status === 'PARTIELLEMENT_REALISE';

  return (
    <Chip
      label={formatMessage(`weekly.${status}`)}
      size={size || 'small'}
      style={{
        backgroundColor,
        color: needsDarkText ? '#333' : '#fff',
      }}
    />
  );
}

export default WeeklyStatusBadge;
