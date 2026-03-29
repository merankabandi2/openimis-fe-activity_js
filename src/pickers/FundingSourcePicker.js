import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { MenuItem, TextField } from '@material-ui/core';

import { useModulesManager, useTranslations } from '@openimis/fe-core';
import { fetchFundingSources } from '../actions';
import { MODULE_NAME } from '../constants';

function FundingSourcePicker({
  fetchFundingSources,
  fundingSources,
  fetchingFundingSources,
  value,
  onChange,
  required,
  readOnly,
  label,
}) {
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);

  useEffect(() => {
    fetchFundingSources(modulesManager, ['isActive: true']);
  }, []);

  return (
    <TextField
      select
      label={label || formatMessage('fundingSource')}
      value={value || ''}
      onChange={(e) => {
        const selected = fundingSources?.find((fs) => fs.id === e.target.value);
        onChange(selected || null);
      }}
      required={required}
      disabled={readOnly || fetchingFundingSources}
      fullWidth
      variant="standard"
    >
      <MenuItem value="">
        <em>-</em>
      </MenuItem>
      {(fundingSources || []).map((fs) => (
        <MenuItem key={fs.id} value={fs.id}>
          {fs.code} - {fs.name}
        </MenuItem>
      ))}
    </TextField>
  );
}

const mapStateToProps = (state) => ({
  fundingSources: state.activity.fundingSources,
  fetchingFundingSources: state.activity.fetchingFundingSources,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchFundingSources,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(FundingSourcePicker);
