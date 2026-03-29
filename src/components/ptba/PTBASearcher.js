import React, { useState, useRef, useEffect } from 'react';
import { bindActionCreators } from 'redux';
import { connect, useSelector } from 'react-redux';

import { IconButton, Tooltip, Chip } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';

import {
  Searcher,
  useHistory,
  useModulesManager,
  useTranslations,
  clearConfirm,
  coreConfirm,
  journalize,
} from '@openimis/fe-core';
import { fetchPtbas, deletePtba } from '../../actions';
import { ACTION_TYPE } from '../../actions';
import {
  MODULE_NAME,
  RIGHT_PTBA_SEARCH,
  RIGHT_PTBA_DELETE,
  ROUTE_PTBA,
} from '../../constants';

const PTBA_STATUS_COLORS = {
  DRAFT: 'default',
  APPROVED: 'primary',
  ACTIVE: 'primary',
  CLOSED: 'default',
};

function PTBASearcher({
  fetchPtbas,
  fetchingPtbas,
  fetchedPtbas,
  errorPtbas,
  deletePtba,
  ptbas,
  coreConfirm,
  clearConfirm,
  ptbasPageInfo,
  ptbasTotalCount,
  confirmed,
  submittingMutation,
  mutation,
}) {
  const history = useHistory();
  const modulesManager = useModulesManager();
  const { formatMessage, formatMessageWithValues } = useTranslations(MODULE_NAME, modulesManager);
  const rights = useSelector((store) => store.core.user.i_user.rights ?? []);

  const [ptbaToDelete, setPtbaToDelete] = useState(null);
  const [deletedPtbaIds, setDeletedPtbaIds] = useState([]);
  const prevSubmittingMutationRef = useRef();

  const openDeletePtbaConfirmDialog = () => {
    coreConfirm(
      formatMessage('ptba.delete.confirm.title'),
      formatMessage('ptba.delete.confirm.message'),
    );
  };

  useEffect(() => ptbaToDelete && openDeletePtbaConfirmDialog(), [ptbaToDelete]);

  useEffect(() => {
    if (ptbaToDelete && confirmed) {
      deletePtba(
        ptbaToDelete,
        formatMessageWithValues('ptba.mutation.deleteLabel', { id: ptbaToDelete.id }),
      );
      setDeletedPtbaIds([...deletedPtbaIds, ptbaToDelete.id]);
    }
    if (ptbaToDelete && confirmed !== null) {
      setPtbaToDelete(null);
    }
    return () => confirmed && clearConfirm(false);
  }, [confirmed]);

  useEffect(() => {
    if (prevSubmittingMutationRef.current && !submittingMutation) {
      journalize(mutation);
    }
  }, [submittingMutation]);

  useEffect(() => {
    prevSubmittingMutationRef.current = submittingMutation;
  });

  const headers = () => [
    'ptba.code',
    'ptba.name',
    'ptba.status',
    'ptba.fiscalYearStart',
    'ptba.fiscalYearEnd',
    'emptyLabel',
  ];

  const sorts = () => [
    ['code', true],
    ['name', true],
    ['status', true],
    ['fiscalYearStart', true],
    ['fiscalYearEnd', true],
  ];

  const fetchData = (params) => fetchPtbas(modulesManager, params);

  const rowIdentifier = (ptba) => ptba.id;

  const openPtba = (ptba) => rights.includes(RIGHT_PTBA_SEARCH) && history.push(
    `/${ROUTE_PTBA}/${ptba?.id}`,
  );

  const onDelete = (ptba) => setPtbaToDelete(ptba);

  const itemFormatters = () => [
    (ptba) => ptba.code,
    (ptba) => ptba.name,
    (ptba) => (
      <Chip
        label={formatMessage(`ptba.status.${ptba.status}`)}
        color={PTBA_STATUS_COLORS[ptba.status] || 'default'}
        size="small"
      />
    ),
    (ptba) => ptba.fiscalYearStart,
    (ptba) => ptba.fiscalYearEnd,
    (ptba) => (
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <Tooltip title={formatMessage('tooltip.edit')}>
          <IconButton onClick={() => openPtba(ptba)}>
            <EditIcon />
          </IconButton>
        </Tooltip>
        {rights.includes(RIGHT_PTBA_DELETE) && (
          <Tooltip title={formatMessage('tooltip.delete')}>
            <IconButton
              onClick={() => onDelete(ptba)}
              disabled={deletedPtbaIds.includes(ptba.id)}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        )}
      </div>
    ),
  ];

  const onDoubleClick = (ptba) => openPtba(ptba);

  const isRowDisabled = (_, ptba) => deletedPtbaIds.includes(ptba.id);

  const defaultFilters = () => ({});

  return (
    <Searcher
      module="activity"
      fetch={fetchData}
      items={ptbas}
      itemsPageInfo={ptbasPageInfo}
      fetchedItems={!fetchingPtbas}
      fetchingItems={fetchingPtbas}
      errorItems={errorPtbas}
      tableTitle={formatMessageWithValues('ptba.searcherResultsTitle', { count: ptbasTotalCount ?? 0 })}
      headers={headers}
      itemFormatters={itemFormatters}
      sorts={sorts}
      rowIdentifier={rowIdentifier}
      onDoubleClick={onDoubleClick}
      defaultFilters={defaultFilters()}
      rowDisabled={isRowDisabled}
      rowLocked={isRowDisabled}
    />
  );
}

const mapStateToProps = (state) => ({
  rights: state.core?.user?.i_user?.rights ?? [],
  ptbas: state.activity.ptbas,
  ptbasPageInfo: state.activity.ptbasPageInfo,
  fetchingPtbas: state.activity.fetchingPtbas,
  errorPtbas: state.activity.errorPtbas,
  ptbasTotalCount: state.activity.ptbasTotalCount,
  confirmed: state.core.confirmed,
  submittingMutation: state.activity.submittingMutation,
  mutation: state.activity.mutation,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchPtbas,
  deletePtba,
  coreConfirm,
  clearConfirm,
  journalize,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(PTBASearcher);
