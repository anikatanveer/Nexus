import React, { useEffect, useMemo, useState } from 'react';
import { Banknote, CreditCard, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Card, CardBody, CardHeader } from './ui/Card';
import { Input } from './ui/Input';
import { entrepreneurs, investors, findUserById } from '../data/users';
import { Transaction } from '../types';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const statusVariantMap = {
  pending: 'warning',
  completed: 'success',
  rejected: 'error',
  failed: 'error',
} as const;

export const PaymentCenter: React.FC = () => {
  const { user } = useAuth();
  const [balance, setBalance] = useState(1250000);
  const [action, setAction] = useState<'deposit' | 'withdraw' | 'transfer' | 'funding'>('deposit');
  const [amount, setAmount] = useState('5000');
  const [selectedPartnerId, setSelectedPartnerId] = useState('');
  const [note, setNote] = useState('Deal funding simulation');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [message, setMessage] = useState('');

  const partners = useMemo(() => {
    if (!user) return [];
    return user.role === 'investor' ? entrepreneurs : investors;
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const defaultTransactions: Transaction[] = user.role === 'investor' ? [
      {
        id: 'tx1',
        type: 'funding',
        amount: 250000,
        senderId: user.id,
        senderName: user.name,
        receiverId: 'e1',
        receiverName: 'Sarah Johnson',
        status: 'completed',
        createdAt: '2024-05-10T14:30:00Z',
        note: 'Seed funding to TechWave AI',
      },
      {
        id: 'tx2',
        type: 'deposit',
        amount: 75000,
        senderId: 'stripe',
        senderName: 'Stripe',
        receiverId: user.id,
        receiverName: user.name,
        status: 'completed',
        createdAt: '2024-05-14T09:10:00Z',
        note: 'Wallet top-up',
      },
    ] : [
      {
        id: 'tx1',
        type: 'funding',
        amount: 250000,
        senderId: 'i1',
        senderName: 'Michael Rodriguez',
        receiverId: user.id,
        receiverName: user.name,
        status: 'pending',
        createdAt: '2024-05-16T11:20:00Z',
        note: 'Investor deal funding request',
      },
      {
        id: 'tx2',
        type: 'deposit',
        amount: 32000,
        senderId: 'stripe',
        senderName: 'Stripe',
        receiverId: user.id,
        receiverName: user.name,
        status: 'completed',
        createdAt: '2024-05-13T08:40:00Z',
        note: 'Operational deposit',
      },
    ];

    setTransactions(defaultTransactions);
    setSelectedPartnerId(partners.length > 0 ? partners[0].id : '');
  }, [user, partners]);

  if (!user) {
    return null;
  }

  const currentUserName = user.name;
  const currentPartner = findUserById(selectedPartnerId);
  const actionOptions = user.role === 'investor'
    ? ['deposit', 'withdraw', 'transfer', 'funding'] as const
    : ['deposit', 'withdraw', 'transfer'] as const;

  const formattedBalance = currencyFormatter.format(balance);

  const handleTransaction = () => {
    const parsed = Number(amount.replace(/[^0-9.]/g, ''));
    if (Number.isNaN(parsed) || parsed <= 0) {
      setMessage('Enter a valid amount greater than $0.');
      return;
    }

    const newTransaction: Transaction = {
      id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: action,
      amount: parsed,
      senderId: action === 'deposit' ? 'stripe' : user.id,
      senderName: action === 'deposit' ? 'Stripe' : currentUserName,
      receiverId: action === 'withdraw' ? 'bank' : (selectedPartnerId || user.id),
      receiverName: action === 'withdraw' ? 'Bank Account' : (currentPartner?.name ?? currentUserName),
      status: 'completed',
      createdAt: new Date().toISOString(),
      note: note || (action === 'funding' ? 'Funding deal' : action === 'transfer' ? 'Balance transfer' : action === 'deposit' ? 'Deposit to wallet' : 'Withdraw from wallet'),
    };

    if (action === 'withdraw' && parsed > balance) {
      setTransactions(prev => [{ ...newTransaction, status: 'failed', note: 'Insufficient balance' }, ...prev]);
      setMessage('Not enough balance to withdraw that amount.');
      return;
    }

    if ((action === 'transfer' || action === 'funding') && parsed > balance) {
      setTransactions(prev => [{ ...newTransaction, status: 'failed', note: 'Insufficient balance' }, ...prev]);
      setMessage('Not enough balance to complete this transfer.');
      return;
    }

    setMessage('');

    const transaction = {
      ...newTransaction,
      status: action === 'funding' ? 'pending' : 'completed',
    } as Transaction;

    setTransactions(prev => [transaction, ...prev]);

    if (action === 'deposit') {
      setBalance(prev => prev + parsed);
      setMessage('Deposit completed successfully.');
    }

    if (action === 'withdraw') {
      setBalance(prev => prev - parsed);
      setMessage('Withdraw completed successfully.');
    }

    if (action === 'transfer') {
      setBalance(prev => prev - parsed);
      setMessage(`Transfer completed to ${transaction.receiverName}.`);
    }

    if (action === 'funding') {
      setBalance(prev => prev - parsed);
      setMessage(`Funding request sent to ${transaction.receiverName}.`);
    }

    setAmount('5000');
  };

  const handleUpdateFundingStatus = (transactionId: string, status: 'completed' | 'rejected') => {
    setTransactions(prev => prev.map(tx => tx.id === transactionId ? { ...tx, status } : tx));
    if (status === 'completed') {
      const target = transactions.find(tx => tx.id === transactionId);
      if (target && target.receiverId === user.id) {
        setBalance(prev => prev + target.amount);
      }
    }
  };

  const summaryStats = useMemo(() => {
    const totalPending = transactions.filter(tx => tx.status === 'pending').length;
    const totalCompleted = transactions.filter(tx => tx.status === 'completed').length;
    const totalVolume = transactions.reduce((sum, tx) => sum + tx.amount, 0);

    return { totalPending, totalCompleted, totalVolume };
  }, [transactions]);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Payments & Funding</h2>
            <p className="text-sm text-gray-500">Simulate wallet activity, deal funding, deposit, withdraw, and transfers.</p>
          </div>
          <div className="space-y-2 text-right">
            <div className="text-sm text-gray-500">Available balance</div>
            <div className="text-2xl font-semibold text-slate-900">{formattedBalance}</div>
          </div>
        </div>
      </CardHeader>
      <CardBody className="space-y-6">
        <div className="grid gap-4 xl:grid-cols-[1.3fr_0.9fr]">
          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-slate-900 p-3 text-white">
                  <CreditCard size={20} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">Wallet Balance</p>
                  <p className="text-3xl font-bold text-slate-900">{formattedBalance}</p>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-3">
                <div className="rounded-2xl bg-white p-3 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Pending</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">{summaryStats.totalPending}</p>
                </div>
                <div className="rounded-2xl bg-white p-3 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Completed</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">{summaryStats.totalCompleted}</p>
                </div>
                <div className="rounded-2xl bg-white p-3 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Volume</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">{currencyFormatter.format(summaryStats.totalVolume)}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900">Transaction action</p>
                  <p className="text-sm text-slate-500">Deposit, withdraw, transfer, or fund a deal.</p>
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {actionOptions.map(option => (
                  <button
                    type="button"
                    key={option}
                    onClick={() => setAction(option)}
                    className={`rounded-2xl border px-3 py-2 text-sm font-medium transition ${action === option ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'}`}
                  >
                    {option === 'deposit' ? 'Deposit' : option === 'withdraw' ? 'Withdraw' : option === 'transfer' ? 'Transfer' : 'Fund deal'}
                  </button>
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label="Amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  fullWidth
                />

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Recipient</label>
                  <select
                    className="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                    value={selectedPartnerId}
                    onChange={(e) => setSelectedPartnerId(e.target.value)}
                    disabled={action === 'deposit' || action === 'withdraw'}
                  >
                    {partners.map(partner => (
                      <option key={partner.id} value={partner.id}>{partner.name} • {partner.role === 'investor' ? 'Investor' : partner.role === 'entrepreneur' ? partner.startupName : ''}</option>
                    ))}
                  </select>
                </div>
              </div>

              <Input
                label="Note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                fullWidth
              />

              {message ? <p className="text-sm text-slate-600">{message}</p> : null}
              <Button onClick={handleTransaction} fullWidth>
                {action === 'deposit' ? 'Deposit funds' : action === 'withdraw' ? 'Withdraw funds' : action === 'transfer' ? 'Send transfer' : 'Send funding request'}
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-emerald-500 p-3 text-white">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Funding request flow</p>
                  <p className="text-sm text-slate-500">Investor to entrepreneur mock deal flow with approval and wallet update.</p>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <span>Available partner</span>
                    <span>{partners.length} available</span>
                  </div>
                  <div className="mt-2 text-sm text-slate-900">{currentPartner ? `${currentPartner.name} (${currentPartner.role})` : 'Select a recipient'}</div>
                </div>
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-3 text-slate-600">
                    <Banknote size={18} />
                    <span>Quick mock funding terms</span>
                  </div>
                  <div className="mt-3 space-y-2 text-sm text-slate-700">
                    <p>• Choose a counterparty and amount.</p>
                    <p>• Investor sends funding request to entrepreneur.</p>
                    <p>• Entrepreneur can accept or reject pending requests in the transaction history below.</p>
                  </div>
                </div>
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                  <div className="text-sm font-medium text-slate-900">Most recent activity</div>
                  <div className="mt-2 text-sm text-slate-600">{summaryStats.totalCompleted} completed transaction(s), {summaryStats.totalPending} pending.</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Sender</th>
                  <th className="px-4 py-3">Receiver</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {transactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{currencyFormatter.format(tx.amount)}</td>
                    <td className="px-4 py-3 text-slate-600">{tx.senderName}</td>
                    <td className="px-4 py-3 text-slate-600">{tx.receiverName}</td>
                    <td className="px-4 py-3"><Badge variant={statusVariantMap[tx.status]}>{tx.status}</Badge></td>
                    <td className="px-4 py-3 text-slate-600">{tx.type}</td>
                    <td className="px-4 py-3 text-slate-500">{new Date(tx.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      {user.role === 'entrepreneur' && tx.type === 'funding' && tx.receiverId === user.id && tx.status === 'pending' ? (
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" onClick={() => handleUpdateFundingStatus(tx.id, 'completed')}>Accept</Button>
                          <Button size="sm" variant="outline" onClick={() => handleUpdateFundingStatus(tx.id, 'rejected')}>Decline</Button>
                        </div>
                      ) : user.role === 'investor' && tx.type === 'funding' && tx.senderId === user.id && tx.status === 'pending' ? (
                        <span className="text-xs text-slate-500">Awaiting acceptance</span>
                      ) : (
                        <span className="text-xs text-slate-500">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};
