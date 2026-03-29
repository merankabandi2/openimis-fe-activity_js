import React from 'react';
import { injectIntl } from 'react-intl';

import { Grid } from '@material-ui/core';
import { withTheme, withStyles } from '@material-ui/core/styles';

import {
  FormPanel,
  withModulesManager,
  TextInput,
  PublishedComponent,
} from '@openimis/fe-core';
import { PTBA_STATUS_LIST } from '../../constants';

const styles = (theme) => ({
  tableTitle: theme.table.title,
  item: theme.paper.item,
  fullHeight: {
    height: '100%',
  },
});

class PTBAForm extends FormPanel {
  render() {
    const {
      edited,
      classes,
      readOnly,
    } = this.props;
    const ptba = { ...edited };

    return (
      <Grid container className={classes.item}>
        <Grid item xs={4} className={classes.item}>
          <TextInput
            module="activity"
            label="ptba.code"
            required
            readOnly={readOnly}
            value={ptba?.code ?? ''}
            onChange={(code) => this.updateAttribute('code', code)}
          />
        </Grid>
        <Grid item xs={8} className={classes.item}>
          <TextInput
            module="activity"
            label="ptba.name"
            required
            readOnly={readOnly}
            value={ptba?.name ?? ''}
            onChange={(name) => this.updateAttribute('name', name)}
          />
        </Grid>
        <Grid item xs={4} className={classes.item}>
          <PublishedComponent
            pubRef="core.DatePicker"
            module="activity"
            label="ptba.fiscalYearStart"
            required
            readOnly={readOnly}
            value={ptba?.fiscalYearStart ?? ''}
            onChange={(fiscalYearStart) => this.updateAttribute('fiscalYearStart', fiscalYearStart)}
          />
        </Grid>
        <Grid item xs={4} className={classes.item}>
          <PublishedComponent
            pubRef="core.DatePicker"
            module="activity"
            label="ptba.fiscalYearEnd"
            required
            readOnly={readOnly}
            value={ptba?.fiscalYearEnd ?? ''}
            onChange={(fiscalYearEnd) => this.updateAttribute('fiscalYearEnd', fiscalYearEnd)}
          />
        </Grid>
        <Grid item xs={4} className={classes.item}>
          <TextInput
            module="activity"
            label="ptba.status"
            readOnly
            value={ptba?.status ?? 'DRAFT'}
          />
        </Grid>
      </Grid>
    );
  }
}

export default withModulesManager(injectIntl(withTheme(withStyles(styles)(PTBAForm))));
