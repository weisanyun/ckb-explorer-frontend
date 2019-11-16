import React, {useContext, useEffect, useState} from 'react'
import queryString from 'query-string'
import {RouteComponentProps} from 'react-router'
import {StateWithDispatch} from '../../contexts/providers/reducer'
import {AppContext} from '../../contexts/providers'
import Content from '../../components/Content'
import HashCard from '../../components/Card/HashCard'
import i18n from '../../utils/i18n'
import {DaoContentPanel, DaoTabBarPanel} from './styled'
import OverviewCard, {
  OverviewItemData,
} from '../../components/Card/OverviewCard'
import {localeNumberString} from '../../utils/number'
import {isMobile} from '../../utils/screen'
import {
  getNervosDao,
  getNervosDaoTransactions,
  getNervosDaoDepositors,
} from '../../service/app/nervosDao'
import {shannonToCkb} from '../../utils/util'
import DaoTransactions from './DaoTransactions'
import DaoSearch from '../../components/Search/DaoSearch'
import DepositorRank from './DepositorRank'
import {parsePageNumber} from '../../utils/string'
import {PageParams} from '../../utils/const'
import DecimalCapacity from '../../components/DecimalCapacity'

enum DaoTab {
  Transactions,
  Depositor,
}

const NervosDaoOverview = ({nervosDao}: {nervosDao: State.NervosDao}) => {
  const overviewItems: OverviewItemData[] = [
    {
      title: i18n.t('nervos_dao.total_deposit'),
      content: (
        <DecimalCapacity
          value={localeNumberString(shannonToCkb(nervosDao.totalDeposit))}
          fontSize="11px"
          color="#999999"
        />
      ),
    },
    {
      title: i18n.t('nervos_dao.compensation'),
      content: (
        <DecimalCapacity
          value={localeNumberString(shannonToCkb(nervosDao.interestGranted))}
          fontSize="11px"
          color="#999999"
        />
      ),
    },
    {
      title: i18n.t('nervos_dao.current_depositors'),
      content: localeNumberString(nervosDao.depositorsCount),
    },
  ]

  if (isMobile()) {
    const newItems: OverviewItemData[] = []
    overviewItems.forEach((item, index) =>
      index % 2 === 0 ? newItems.push(item) : null,
    )
    overviewItems.forEach((item, index) =>
      index % 2 !== 0 ? newItems.push(item) : null,
    )
  }

  return <OverviewCard items={overviewItems} />
}

export const NervosDao = ({
  location: {search},
  dispatch,
}: React.PropsWithoutRef<StateWithDispatch & RouteComponentProps>) => {
  const parsed = queryString.parse(search)

  const currentPage = parsePageNumber(parsed.page, PageParams.PageNo)
  const pageSize = parsePageNumber(parsed.size, PageParams.PageSize)

  const {nervosDaoState} = useContext(AppContext)
  const [daoTab, setDaoTab] = useState(DaoTab.Transactions)

  useEffect(() => {
    getNervosDao(dispatch)
    getNervosDaoTransactions(dispatch, currentPage, pageSize)
    getNervosDaoDepositors(dispatch)
  }, [dispatch, currentPage, pageSize])

  return (
    <Content>
      <DaoContentPanel className="container">
        <HashCard
          title={i18n.t('nervos_dao.nervos_dao')}
          hash={nervosDaoState.nervosDao.daoTypeHash}
          dispatch={dispatch}
        />
        <NervosDaoOverview nervosDao={nervosDaoState.nervosDao} />

        <DaoTabBarPanel containSearchBar={daoTab === DaoTab.Transactions}>
          <div className="nervos_dao_tab_bar">
            <div
              role="button"
              tabIndex={-1}
              onKeyDown={() => {}}
              className={
                daoTab === DaoTab.Transactions
                  ? 'tab_bar_selected'
                  : 'tab_bar_normal'
              }
              onClick={() => setDaoTab(DaoTab.Transactions)}
            >
              {i18n.t('nervos_dao.dao_tab_transactions')}
            </div>
            <div
              role="button"
              tabIndex={-1}
              onKeyDown={() => {}}
              className={
                daoTab === DaoTab.Depositor
                  ? 'tab_bar_selected'
                  : 'tab_bar_normal'
              }
              onClick={() => setDaoTab(DaoTab.Depositor)}
            >
              {i18n.t('nervos_dao.dao_tab_depositors')}
            </div>
          </div>
          {daoTab === DaoTab.Transactions && <DaoSearch dispatch={dispatch} />}
        </DaoTabBarPanel>

        {daoTab === DaoTab.Transactions ? (
          <DaoTransactions currentPage={currentPage} pageSize={pageSize} />
        ) : (
          <DepositorRank />
        )}
      </DaoContentPanel>
    </Content>
  )
}

export default NervosDao
