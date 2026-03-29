import React from 'react';
import { ConstantBasedPicker } from '@openimis/fe-core';
import { QUARTERS } from '../constants';

function QuarterPicker(props) {
  const {
    required, readOnly, onChange, value, nullLabel, withLabel, withNull,
  } = props;

  const quarterValues = QUARTERS.map((q) => q.value);

  return (
    <ConstantBasedPicker
      module="activity"
      label="quarter"
      constants={quarterValues}
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

export default QuarterPicker;
