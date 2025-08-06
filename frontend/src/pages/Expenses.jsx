import React, { useState } from 'react';
import { DollarSign, Plus, TrendingUp, TrendingDown, Calendar, Filter } from 'lucide-react';
import { useFitnessStore } from '../store/fitnessStore';

const Expenses = () => {
  const { transactions, totalBudget, currentBudget, addTransaction } = useFitnessStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    type: '',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleAddTransaction = (e) => {
    e.preventDefault();
    if (newTransaction.type && newTransaction.amount) {
      addTransaction({
        type: newTransaction.type,
        amount: parseFloat(newTransaction.amount),
        date: newTransaction.date
      });
      setNewTransaction({ type: '', amount: '', date: new Date().toISOString().split('T')[0] });
      setShowAddForm(false);
    }
  };

  const totalSpent = totalBudget - currentBudget;
  const spentPercentage = (totalSpent / totalBudget) * 100;

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-base-content">Expenses</h1>
            <p className="text-base-content/70 mt-2">Track your spending and budget</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Expense
          </button>
        </div>
      </div>

      {/* Budget Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card bg-base-200 shadow-lg">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-70">Total Budget</p>
                <p className="text-2xl font-bold text-primary">₹{totalBudget.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-primary" />
            </div>
          </div>
        </div>

        <div className="card bg-base-200 shadow-lg">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-70">Remaining</p>
                <p className="text-2xl font-bold text-success">₹{currentBudget.toLocaleString()}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-success" />
            </div>
          </div>
        </div>

        <div className="card bg-base-200 shadow-lg">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-70">Spent</p>
                <p className="text-2xl font-bold text-error">₹{totalSpent.toLocaleString()}</p>
              </div>
              <TrendingDown className="w-8 h-8 text-error" />
            </div>
          </div>
        </div>

        <div className="card bg-base-200 shadow-lg">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-70">Budget Used</p>
                <p className="text-2xl font-bold text-warning">{spentPercentage.toFixed(1)}%</p>
              </div>
              <div className="radial-progress text-warning" style={{ "--value": spentPercentage }}>
                {spentPercentage.toFixed(0)}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Transaction Modal */}
      {showAddForm && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Add New Expense</h3>
            <form onSubmit={handleAddTransaction}>
              <div className="form-control w-full mb-4">
                <label className="label">
                  <span className="label-text">Expense Type</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Groceries, Gym, Transport"
                  className="input input-bordered w-full"
                  value={newTransaction.type}
                  onChange={(e) => setNewTransaction({...newTransaction, type: e.target.value})}
                />
              </div>
              <div className="form-control w-full mb-4">
                <label className="label">
                  <span className="label-text">Amount (₹)</span>
                </label>
                <input
                  type="number"
                  placeholder="0.00"
                  className="input input-bordered w-full"
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                />
              </div>
              <div className="form-control w-full mb-4">
                <label className="label">
                  <span className="label-text">Date</span>
                </label>
                <input
                  type="date"
                  className="input input-bordered w-full"
                  value={newTransaction.date}
                  onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})}
                />
              </div>
              <div className="modal-action">
                <button type="button" className="btn" onClick={() => setShowAddForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transactions List */}
      <div className="card bg-base-200 shadow-lg">
        <div className="card-body">
          <div className="flex items-center justify-between mb-4">
            <h2 className="card-title">Recent Transactions</h2>
            <div className="flex gap-2">
              <button className="btn btn-ghost btn-sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </button>
              <button className="btn btn-ghost btn-sm">
                <Calendar className="w-4 h-4 mr-2" />
                Date Range
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover">
                    <td>
                      <div className="font-medium">{transaction.type}</div>
                    </td>
                    <td>
                      <div className="font-bold text-error">₹{transaction.amount}</div>
                    </td>
                    <td>
                      <div className="text-sm opacity-70">{transaction.date}</div>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button className="btn btn-ghost btn-xs">Edit</button>
                        <button className="btn btn-ghost btn-xs text-error">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {transactions.length === 0 && (
            <div className="text-center py-8">
              <p className="text-base-content/50">No transactions yet</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="btn btn-primary mt-4"
              >
                Add your first expense
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Expenses;
