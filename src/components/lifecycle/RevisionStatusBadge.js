import React from 'react';
import { Chip } from '@material-ui/core';
import { useModulesManager, useTranslations } from '@openimis/fe-core';
import { MODULE_NAME, REVISION_STATUS_COLORS, REVISION_STATUS } from '../../constants';

function RevisionStatusBadge({ status, size }) {
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);

  if (!status) return null;

  const backgroundColor = REVISION_STATUS_COLORS[status] || REVISION_STATUS_COLORS.INITIAL;
  const isAbandonne = status === REVISION_STATUS.ABANDONNE;

  return (
    <Chip
      label={formatMessage(`revision.${status}`)}
      size={size || 'small'}
      style={{
        backgroundColor,
        color: '#fff',
        textDecoration: isAbandonne ? 'line-through' : 'none',
      }}
    />
  );
}

export default RevisionStatusBadge;
