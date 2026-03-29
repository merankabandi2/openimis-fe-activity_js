import React from 'react';
import { ConstantBasedPicker } from '@openimis/fe-core';
import { ACTIVITY_STATUS_LIST } from '../constants';

function ActivityStatusPicker(props) {
  const {
    required, readOnly, onChange, value, nullLabel, withLabel, withNull,
  } = props;

  return (
    <ConstantBasedPicker
      module="activity"
      label="activite.status"
      constants={ACTIVITY_STATUS_LIST}
      onChange={onChange}
      value={value}
      required={required}
      readOnly={readOnly}
      nullLabel={nullLabel}
      withLabel={withLabel}
      withNull={withNull}
    />
  );
}

export default ActivityStatusPicker;
