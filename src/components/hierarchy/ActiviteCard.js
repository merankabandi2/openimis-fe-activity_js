import React from 'react';

import {
  Card,
  CardActionArea,
  CardContent,
  Typography,
  Chip,
  Grid,
} from '@material-ui/core';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import { makeStyles } from '@material-ui/styles';

import { useModulesManager, useTranslations } from '@openimis/fe-core';
import { MODULE_NAME } from '../../constants';
import { formatBIFAmount } from '../../utils/string-utils';

const STATUS_CHIP_COLORS = {
  PLANIFIE: { backgroundColor: '#9e9e9e', color: '#fff' },
  BUDGETISE: { backgroundColor: '#1976d2', color: '#fff' },
  EN_COURS: { backgroundColor: '#ff9800', color: '#fff' },
  REALISE: { backgroundColor: '#4caf50', color: '#fff' },
  CLOTURE: { backgroundColor: '#424242', color: '#fff' },
};

const useStyles = makeStyles((theme) => ({
  card: {
    marginBottom: theme.spacing(1),
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: 'none',
    '&:hover': {
      boxShadow: theme.shadows[2],
    },
  },
  cardContent: {
    padding: theme.spacing(1.5),
    '&:last-child': {
      paddingBottom: theme.spacing(1.5),
    },
  },
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleArea: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    flexGrow: 1,
  },
  activiteName: {
    fontWeight: 500,
    fontSize: '0.9rem',
  },
  budgetText: {
    fontWeight: 'bold',
    fontSize: '0.9rem',
    color: theme.palette.text.primary,
  },
  detailRow: {
    display: 'flex',
    gap: theme.spacing(2),
    marginTop: theme.spacing(0.5),
  },
  detailItem: {
    fontSize: '0.8rem',
    color: theme.palette.text.secondary,
  },
}));

function ActiviteCard({ activite, readOnly, onClick }) {
  const modulesManager = useModulesManager();
  const classes = useStyles();
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);

  const sousActivites = activite.sousActivites?.edges?.map((e) => e.node) || [];
  const totalBudget = sousActivites.reduce(
    (sum, sa) => sum + parseFloat(sa.budgetTotal || 0),
    0,
  );

  const chipStyle = STATUS_CHIP_COLORS[activite.status] || STATUS_CHIP_COLORS.PLANIFIE;

  const handleClick = () => {
    if (onClick) onClick(activite);
  };

  return (
    <Card className={classes.card}>
      <CardActionArea onClick={handleClick}>
        <CardContent className={classes.cardContent}>
          <div className={classes.headerRow}>
            <div className={classes.titleArea}>
              <Chip
                label={formatMessage(`status.${activite.status}`)}
                size="small"
                style={chipStyle}
              />
              <Typography className={classes.activiteName}>
                {activite.code ? `${activite.code} - ` : ''}{activite.name}
              </Typography>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Typography className={classes.budgetText}>
                {formatBIFAmount(totalBudget)} BIF
              </Typography>
              <ChevronRightIcon color="action" />
            </div>
          </div>
          {(activite.implementingStructure || activite.province) && (
            <div className={classes.detailRow}>
              {activite.implementingStructure && (
                <Typography className={classes.detailItem}>
                  {activite.implementingStructure}
                </Typography>
              )}
              {activite.province && (
                <Typography className={classes.detailItem}>
                  {activite.province}
                </Typography>
              )}
            </div>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export default ActiviteCard;
