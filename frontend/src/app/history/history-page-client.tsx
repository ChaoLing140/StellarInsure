'use client';

import React, {
  startTransition,
  useEffect,
  useDeferredValue,
  useMemo,
  useState,
} from 'react';
import Link from 'next/link';

import { useAppTranslation } from '@/i18n/provider';
import { Icon } from '@/components/icon';
import { Skeleton } from '@/components/skeleton';
import { TransactionRetryUI } from '@/components/transaction-retry-ui';

type TxType = 'premium' | 'payout' | 'refund' | 'all';
type TxStatus = 'successful' | 'pending' | 'failed' | 'all';

interface Transaction {
  id: number;
  transaction_hash: string;
  amount: number;
  transaction_type: string;
  status: string;
  policy_id: number | null;
  claim_id: number | null;
  created_at: string;
}

const MOCK_TRANSACTIONS: Transaction[] = Array.from({ length: 38 }, (_, i) => {
  const types = ['premium', 'payout', 'refund', 'premium', 'premium', 'payout'];
  const statuses = [
    'successful',
    'successful',
    'successful',
    'pending',
    'failed',
    'successful',
  ];
  const hashes = [
    'a1b2c3d4e5f6789012345678901234567890123456789012345678901234abcd',
    'b2c3d4e5f6789012345678901234567890123456789012345678901234abcde',
    'c3d4e5f6789012345678901234567890123456789012345678901234abcdef',
    'd4e5f6789012345678901234567890123456789012345678901234abcdef01',
    'e5f6789012345678901234567890123456789012345678901234abcdef0123',
    'f6789012345678901234567890123456789012345678901234abcdef012345',
  ];
  const amounts = [50.25, 1000.0, 200.5, 75.0, 150.75, 500.0];
  const idx = i % 6;
  const date = new Date(2026, 2, 27 - i * 2);

  return {
    id: i + 1,
    transaction_hash: hashes[idx].slice(0, 24) + i.toString().padStart(4, '0'),
    amount: amounts[idx],
    transaction_type: types[idx],
    status: statuses[idx],
    policy_id: idx % 2 === 0 ? Math.floor(i / 2) + 1 : null,
    claim_id: idx === 1 ? i + 1 : null,
    created_at: date.toISOString(),
  };
});

const STELLAR_EXPLORER_BASE = 'https://stellar.expert/explorer/testnet/tx/';
const PER_PAGE = 8;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function shortenHash(hash: string): string {
  return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
}

function StatusBadge({ status }: { status: string }) {
  const classMap: Record<string, string> = {
    successful: 'tx-badge tx-badge--success',
    pending: 'tx-badge tx-badge--pending',
    failed: 'tx-badge tx-badge--failed',
  };

  return (
    <span className={classMap[status] ?? 'tx-badge'}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function TypeBadge({ type }: { type: string }) {
  const classMap: Record<string, string> = {
    premium: 'tx-badge tx-badge--premium',
    payout: 'tx-badge tx-badge--payout',
    refund: 'tx-badge tx-badge--refund',
  };

  return (
    <span className={classMap[type] ?? 'tx-badge'}>
      {type.charAt(0).toUpperCase() + type.slice(1)}
    </span>
  );
}

export default function TransactionHistoryPage() {
  const { t } = useAppTranslation();
  const [typeFilter, setTypeFilter] = useState<TxType>('all');
  const [statusFilter, setStatusFilter] = useState<TxStatus>('all');
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [retryingTransactionId, setRetryingTransactionId] = useState<
    number | null
  >(null);
  const deferredTypeFilter = useDeferredValue(typeFilter);
  const deferredStatusFilter = useDeferredValue(statusFilter);
  const isFiltering =
    deferredTypeFilter !== typeFilter || deferredStatusFilter !== statusFilter;

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const filtered = useMemo(() => {
    return MOCK_TRANSACTIONS.filter((tx) => {
      const matchType =
        deferredTypeFilter === 'all' ||
        tx.transaction_type === deferredTypeFilter;
      const matchStatus =
        deferredStatusFilter === 'all' || tx.status === deferredStatusFilter;

      return matchType && matchStatus;
    });
  }, [deferredStatusFilter, deferredTypeFilter]);

  const total = filtered.length;
  const totalPages = Math.ceil(total / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  function getPolicyHref(policyId: number | null) {
    if (policyId === 1) {
      return '/policies/weather-alpha';
    }
    if (policyId === 2) {
      return '/policies/flight-orbit';
    }
    return '/policies/weather-alpha';
  }

  function handleTypeChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const value = event.target.value as TxType;
    startTransition(() => {
      setTypeFilter(value);
      setPage(1);
      setExpandedId(null);
    });
  }

  function handleStatusChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const value = event.target.value as TxStatus;
    startTransition(() => {
      setStatusFilter(value);
      setPage(1);
      setExpandedId(null);
    });
  }

  async function handleRetryTransaction(transactionId: number) {
    // Simulate retry API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate 80% success rate
        if (Math.random() > 0.2) {
          resolve(undefined);
        } else {
          reject(
            new Error('Network error: Unable to connect to Stellar network')
          );
        }
      }, 1500);
    });
  }

  return (
    <main id="main-content" tabIndex={-1} className="tx-history-page">
      <div className="section-header">
        <span className="eyebrow">{t('history.eyebrow')}</span>
        <h1 id="tx-history-title">{t('history.title')}</h1>
        <p>{t('history.desc')}</p>
      </div>

      <div
        className="tx-filters motion-panel"
        role="search"
        aria-label="Filter transactions"
      >
        <div className="tx-filter-group">
          <label htmlFor="type-filter" className="tx-filter-label">
            {t('history.filters.type')}
          </label>
          <select
            id="type-filter"
            className="tx-select"
            value={typeFilter}
            onChange={handleTypeChange}
          >
            <option value="all">{t('history.filters.allTypes')}</option>
            <option value="premium">{t('history.filters.types.premium')}</option>
            <option value="payout">{t('history.filters.types.payout')}</option>
            <option value="refund">{t('history.filters.types.refund')}</option>
          </select>
        </div>

        <div className="tx-filter-group">
          <label htmlFor="status-filter" className="tx-filter-label">
            {t('history.filters.status')}
          </label>
          <select
            id="status-filter"
            className="tx-select"
            value={statusFilter}
            onChange={handleStatusChange}
          >
            <option value="all">{t('history.filters.allStatuses')}</option>
            <option value="successful">{t('history.filters.statuses.successful')}</option>
            <option value="pending">{t('history.filters.statuses.pending')}</option>
            <option value="failed">{t('history.filters.statuses.failed')}</option>
          </select>
        </div>

        <p className="tx-result-count" aria-live="polite">
          {total} {t('history.filters.found')}
        </p>
        <p className="tx-filtering" aria-live="polite" role="status">
          {isFiltering
            ? t('history.filters.updating')
            : t('history.filters.upToDate')}
        </p>
      </div>

      {isLoading ? (
        <div
          className="tx-table-wrapper motion-panel"
          role="region"
          aria-label="Loading transactions"
          aria-busy="true"
        >
          <span className="visually-hidden">
            Loading transactions, please wait.
          </span>
          <table className="tx-table">
            <thead>
              <tr>
                <th scope="col">{t('history.table.date')}</th>
                <th scope="col">{t('history.table.type')}</th>
                <th scope="col">{t('history.table.amount')}</th>
                <th scope="col">{t('history.table.status')}</th>
                <th scope="col">{t('history.table.hash')}</th>
                <th scope="col">{t('history.table.details')}</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 6 }).map((_, i) => (
                <tr key={`sk-row-${i}`} className="tx-row">
                  <td>
                    <Skeleton style={{ height: '14px', width: '120px' }} />
                  </td>
                  <td>
                    <Skeleton
                      style={{
                        height: '22px',
                        width: '64px',
                        borderRadius: '20px',
                      }}
                    />
                  </td>
                  <td>
                    <Skeleton style={{ height: '14px', width: '60px' }} />
                  </td>
                  <td>
                    <Skeleton
                      style={{
                        height: '22px',
                        width: '80px',
                        borderRadius: '20px',
                      }}
                    />
                  </td>
                  <td>
                    <Skeleton style={{ height: '14px', width: '100px' }} />
                  </td>
                  <td>
                    <Skeleton
                      style={{
                        height: '24px',
                        width: '28px',
                        borderRadius: '4px',
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : paginated.length === 0 ? (
        <div className="tx-empty" role="status">
          <span className="tx-empty-icon" aria-hidden="true">
            <Icon name="document" size="lg" tone="muted" />
          </span>
          <h2>{t('history.empty.title')}</h2>
          <p>{t('history.empty.message')}</p>
          <div className="tx-empty-actions">
            {typeFilter !== 'all' || statusFilter !== 'all' ? (
              <button
                className="cta-primary"
                onClick={() => {
                  startTransition(() => {
                    setTypeFilter('all');
                    setStatusFilter('all');
                    setPage(1);
                  });
                }}
              >
                <Icon name="refresh" size="sm" aria-hidden="true" />
                {t('history.empty.clearFilters')}
              </button>
            ) : (
              <Link href="/create" className="cta-primary">
                <Icon name="plus" size="sm" aria-hidden="true" />
                {t('history.empty.createFirstPolicy')}
              </Link>
            )}
            <Link href="/policies" className="cta-secondary">
              {t('history.empty.viewPolicies')}
            </Link>
          </div>
        </div>
      ) : (
        <div
          className={`tx-table-wrapper motion-panel ${isFiltering ? 'tx-table-wrapper--loading' : ''}`}
          role="region"
          aria-label="Transaction list"
          aria-busy={isFiltering}
        >
          {isFiltering ? (
            <table className="tx-table">
              <thead>
                <tr>
                  <th scope="col">{t('history.table.date')}</th>
                  <th scope="col">{t('history.table.type')}</th>
                  <th scope="col">{t('history.table.amount')}</th>
                  <th scope="col">{t('history.table.status')}</th>
                  <th scope="col">{t('history.table.hash')}</th>
                  <th scope="col">{t('history.table.details')}</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 6 }).map((_, i) => (
                  <tr key={`filter-sk-${i}`} className="tx-row">
                    <td>
                      <Skeleton style={{ height: '14px', width: '120px' }} />
                    </td>
                    <td>
                      <Skeleton
                        style={{
                          height: '22px',
                          width: '64px',
                          borderRadius: '20px',
                        }}
                      />
                    </td>
                    <td>
                      <Skeleton style={{ height: '14px', width: '60px' }} />
                    </td>
                    <td>
                      <Skeleton
                        style={{
                          height: '22px',
                          width: '80px',
                          borderRadius: '20px',
                        }}
                      />
                    </td>
                    <td>
                      <Skeleton style={{ height: '14px', width: '100px' }} />
                    </td>
                    <td>
                      <Skeleton
                        style={{
                          height: '24px',
                          width: '28px',
                          borderRadius: '4px',
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="tx-table" aria-labelledby="tx-history-title">
              <thead>
                <tr>
                  <th scope="col">{t('history.table.date')}</th>
                  <th scope="col">{t('history.table.type')}</th>
                  <th scope="col">{t('history.table.amount')}</th>
                  <th scope="col">{t('history.table.status')}</th>
                  <th scope="col">{t('history.table.hash')}</th>
                  <th scope="col">{t('history.table.details')}</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((tx) => (
                  <React.Fragment key={tx.id}>
                    <tr
                      className={`tx-row ${expandedId === tx.id ? 'tx-row--expanded' : ''}`}
                    >
                      <td data-label="Date">{formatDate(tx.created_at)}</td>
                      <td data-label="Type">
                        <TypeBadge type={tx.transaction_type} />
                      </td>
                      <td data-label="Amount" className="tx-amount">
                        {tx.amount.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 7,
                        })}
                      </td>
                      <td data-label="Status">
                        <StatusBadge status={tx.status} />
                      </td>
                      <td data-label="Hash">
                        <a
                          href={`${STELLAR_EXPLORER_BASE}${tx.transaction_hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="tx-hash-link"
                          aria-label={`View transaction ${shortenHash(tx.transaction_hash)} on Stellar Explorer`}
                        >
                          <span>{shortenHash(tx.transaction_hash)}</span>
                          <span className="tx-external-icon" aria-hidden="true">
                            <Icon
                              name="arrow-up-right"
                              size="sm"
                              tone="accent"
                            />
                          </span>
                        </a>
                      </td>
                      <td data-label="Details">
                        <button
                          className="tx-expand-btn"
                          aria-expanded={expandedId === tx.id}
                          aria-controls={`tx-detail-${tx.id}`}
                          aria-label={`${expandedId === tx.id ? 'Collapse' : 'Expand'} transaction ${tx.id} details`}
                          onClick={() => setExpandedId(expandedId === tx.id ? null : tx.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setExpandedId(expandedId === tx.id ? null : tx.id);
                            }
                          }}
                        >
                          <Icon
                            name={
                              expandedId === tx.id
                                ? 'chevron-up'
                                : 'chevron-down'
                            }
                            size="sm"
                            tone="muted"
                          />
                        </button>
                      </td>
                    </tr>
                    {expandedId === tx.id && (
                      <tr
                        className="tx-detail-row"
                        id={`tx-detail-${tx.id}`}
                        role="region"
                        aria-label="Transaction detail"
                      >
                        <td colSpan={6}>
                          <div className="tx-detail-panel">
                            {tx.status === 'failed' &&
                              retryingTransactionId === tx.id && (
                                <div className="tx-detail-retry-section">
                                  <TransactionRetryUI
                                    transactionId={tx.id}
                                    transactionHash={tx.transaction_hash}
                                    transactionType={tx.transaction_type}
                                    amount={tx.amount}
                                    onRetry={handleRetryTransaction}
                                    onDismiss={() =>
                                      setRetryingTransactionId(null)
                                    }
                                  />
                                </div>
                              )}
                            {tx.status === 'failed' &&
                              retryingTransactionId !== tx.id && (
                                <div className="tx-detail-retry-prompt">
                                  <div className="tx-detail-retry-content">
                                    <Icon
                                      name="alert-circle"
                                      size="md"
                                      tone="danger"
                                      aria-hidden="true"
                                    />
                                    <div>
                                      <p className="tx-detail-retry-message">
                                        {t('history.details.retryPrompt')}
                                      </p>
                                    </div>
                                  </div>
                                  <button
                                    className="tx-detail-retry-action"
                                    onClick={() =>
                                      setRetryingTransactionId(tx.id)
                                    }
                                    aria-label={`Retry transaction ${tx.id}`}
                                  >
                                    <Icon
                                      name="refresh-cw"
                                      size="sm"
                                      aria-hidden="true"
                                    />
                                    {t('history.details.startRetry')}
                                  </button>
                                </div>
                              )}
                            <div className="tx-detail-grid">
                              <div>
                                <span className="tx-detail-label">
                                  {t('history.details.transactionId')}
                                </span>
                                <span className="tx-detail-value">
                                  #{tx.id}
                                </span>
                              </div>
                              <div>
                                <span className="tx-detail-label">
                                  {t('history.details.fullHash')}
                                </span>
                                <span className="tx-detail-value tx-detail-hash">
                                  {tx.transaction_hash}
                                </span>
                              </div>
                              {tx.policy_id && (
                                <div>
                                  <span className="tx-detail-label">
                                    {t('history.details.policyId')}
                                  </span>
                                  <Link
                                    className="tx-detail-link"
                                    href={getPolicyHref(tx.policy_id)}
                                    onClick={(
                                      event: React.MouseEvent<HTMLAnchorElement>
                                    ) => event.stopPropagation()}
                                  >
                                    #{tx.policy_id} {t('history.details.policySnapshot')}
                                  </Link>
                                </div>
                              )}
                              {tx.claim_id && (
                                <div>
                                  <span className="tx-detail-label">
                                    {t('history.details.claimId')}
                                  </span>
                                  <span className="tx-detail-value">
                                    #{tx.claim_id}
                                  </span>
                                </div>
                              )}
                              <div>
                                <span className="tx-detail-label">
                                  {t('history.details.explorer')}
                                </span>
                                <a
                                  href={`${STELLAR_EXPLORER_BASE}${tx.transaction_hash}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="tx-detail-link tx-detail-link--with-icon"
                                >
                                  <span>{t('history.details.viewOnStellarExpert')}</span>
                                  <Icon
                                    name="arrow-up-right"
                                    size="sm"
                                    tone="accent"
                                  />
                                </a>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {totalPages > 1 && (
        <nav
          className="tx-pagination"
          aria-label="Transaction history pagination"
        >
          <button
            className="tx-page-btn"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            aria-label="Previous page"
          >
            {t('history.pagination.prev')}
          </button>

          <div className="tx-page-numbers" role="list">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
              )
              .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                if (idx > 0 && p - (arr[idx - 1] as number) > 1)
                  acc.push('...');
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === '...' ? (
                  <span
                    key={`ellipsis-${i}`}
                    className="tx-page-ellipsis"
                    aria-hidden="true"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={p}
                    role="listitem"
                    className={`tx-page-btn ${p === page ? 'tx-page-btn--active' : ''}`}
                    onClick={() => setPage(p)}
                    aria-label={`Page ${p}`}
                    aria-current={p === page ? 'page' : undefined}
                  >
                    {p}
                  </button>
                )
              )}
          </div>

          <button
            className="tx-page-btn"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            aria-label="Next page"
          >
            {t('history.pagination.next')}
          </button>
        </nav>
      )}

      <p className="tx-pagination-info" aria-live="polite">
        {t('history.pagination.showing')} {Math.min((page - 1) * PER_PAGE + 1, total)}-
        {Math.min(page * PER_PAGE, total)} {t('history.pagination.of')} {total}
      </p>
    </main>
  );
}
