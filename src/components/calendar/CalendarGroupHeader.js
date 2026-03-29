import React from 'react';
import { Typography, Box, IconButton } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    fontWeight: 600,
    padding: theme.spacing(0.5, 1),
    cursor: 'pointer',
    borderBottom: '1px solid #e0e0e0',
    userSelect: 'none',
    '&:hover': {
      backgroundColor: '#eeeeee',
    },
  },
  expandIcon: {
    padding: 2,
    marginRight: theme.spacing(0.5),
  },
  label: {
    fontSize: '0.8rem',
    fontWeight: 600,
    flex: 1,
  },
  count: {
    fontSize: '0.75rem',
    color: theme.palette.text?.secondary || '#666',
    marginLeft: theme.spacing(1),
  },
}));

function CalendarGroupHeader({ label, count, expanded, onToggle }) {
  const classes = useStyles();

  return (
    <Box className={classes.root} onClick={onToggle}>
      <IconButton className={classes.expandIcon} size="small">
        {expanded ? <ExpandMoreIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
      </IconButton>
      <Typography className={classes.label}>{label}</Typography>
      <Typography className={classes.count}>({count})</Typography>
    </Box>
  );
}

export default CalendarGroupHeader;
