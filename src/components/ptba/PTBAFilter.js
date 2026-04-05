import React from 'react';
import _debounce from 'lodash/debounce';
import { Grid, FormControl, InputLabel, Select, MenuItem } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { TextInput, ControlledField, useModulesManager, useTranslations } from '@openimis/fe-core';

const MODULE_NAME = 'activity';
const DEBOUNCE_TIME = 500;

const PTBA_STATUSES = [
  { value: 'DRAFT', label: 'ptba.status.DRAFT' },
  { value: 'APPROVED', label: 'ptba.status.APPROVED' },
  { value: 'ACTIVE', label: 'ptba.status.ACTIVE' },
  { value: 'CLOSED', label: 'ptba.status.CLOSED' },
];

const useStyles = makeStyles((theme) => ({
  form: { padding: '0 0 10px 0', width: '100%' },
  item: { padding: theme.spacing(1) },
}));

function PTBAFilter({ filters, onChangeFilters }) {
  const classes = useStyles();
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);

  const debouncedOnChangeFilters = _debounce(onChangeFilters, DEBOUNCE_TIME);

  const filterTextValue = (name) => filters?.[name]?.value ?? '';

  return (
    <Grid container className={classes.form}>
      <ControlledField
        module={MODULE_NAME}
        id="PTBAFilter.code"
        field={(
          <Grid item xs={3} className={classes.item}>
            <TextInput
              module={MODULE_NAME}
              label="ptba.code"
              value={filterTextValue('code')}
              onChange={(v) => debouncedOnChangeFilters([
                { id: 'code', value: v, filter: v ? `code_Icontains: "${v}"` : null },
              ])}
            />
          </Grid>
        )}
      />
      <ControlledField
        module={MODULE_NAME}
        id="PTBAFilter.name"
        field={(
          <Grid item xs={3} className={classes.item}>
            <TextInput
              module={MODULE_NAME}
              label="ptba.name"
              value={filterTextValue('name')}
              onChange={(v) => debouncedOnChangeFilters([
                { id: 'name', value: v, filter: v ? `name_Icontains: "${v}"` : null },
              ])}
            />
          </Grid>
        )}
      />
      <ControlledField
        module={MODULE_NAME}
        id="PTBAFilter.status"
        field={(
          <Grid item xs={3} className={classes.item}>
            <FormControl fullWidth>
              <InputLabel>{formatMessage('ptba.status')}</InputLabel>
              <Select
                value={filters?.status?.value ?? ''}
                onChange={(e) => onChangeFilters([
                  {
                    id: 'status',
                    value: e.target.value,
                    filter: e.target.value ? `status: "${e.target.value}"` : null,
                  },
                ])}
              >
                <MenuItem value="">{formatMessage('ptba.filter.all')}</MenuItem>
                {PTBA_STATUSES.map((s) => (
                  <MenuItem key={s.value} value={s.value}>{formatMessage(s.label)}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        )}
      />
      <ControlledField
        module={MODULE_NAME}
        id="PTBAFilter.fiscalYear"
        field={(
          <Grid item xs={3} className={classes.item}>
            <TextInput
              module={MODULE_NAME}
              label="ptba.filter.fiscalYear"
              value={filterTextValue('fiscalYear')}
              onChange={(v) => debouncedOnChangeFilters([
                { id: 'fiscalYear', value: v, filter: v ? `fiscalYearStart_Gte: "${v}-01-01"` : null },
              ])}
              placeholder="2025"
            />
          </Grid>
        )}
      />
    </Grid>
  );
}

export default PTBAFilter;
