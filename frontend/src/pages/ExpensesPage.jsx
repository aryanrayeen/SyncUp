import { useState, useEffect, useMemo } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useFinanceStore } from '../store/financeStore';
import { useAuthStore } from '../store/authStore';
import { Plus, Edit, Trash2, BarChart3, DollarSign } from 'lucide-react';

const ExpensesPage = () => {
  // Store hooks FIRST (so transactions is available for useMemo)
  const { user, checkAuth } = useAuthStore();
  const {
    transactions,
    monthlyReport,
    monthlyBudget,
    isLoading,
    error,
    expenseCategories,
    incomeCategories,
    fetchTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    fetchMonthlyReport,
    updateMonthlyBudget,
    getCurrentMonthExpenses,
    getCurrentMonthIncome,
    getRemainingBudget,
    getBudgetUsagePercentage,
    setMonthlyBudget,
    clearError
  } = useFinanceStore();

  // Filter states
  const [filters, setFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    type: '',
    category: ''
  });

  // Calendar and modal state
  // Set calendar to today by default
  const today = new Date();
  // selectedDate is the currently selected day (default: today)
  // Modal open state
  const [selectedDate, setSelectedDate] = useState(null);
  // calendarMonth is the month currently being viewed in the calendar
  const [calendarMonth, setCalendarMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  // Sync calendar month with monthly report filter
  useEffect(() => {
    setCalendarMonth(new Date(filters.year, filters.month - 1));
  }, [filters.month, filters.year]);

  // When calendar month changes, update filter
  const handleCalendarMonthChange = ({ activeStartDate }) => {
    if (!activeStartDate) return;
    const newMonth = activeStartDate.getMonth() + 1;
    const newYear = activeStartDate.getFullYear();
    if (filters.month !== newMonth || filters.year !== newYear) {
      setFilters(prev => ({ ...prev, month: newMonth, year: newYear }));
    }
    setCalendarMonth(activeStartDate);
  };

  // Group transactions by date for calendar
  // Group transactions by local date (not UTC)
  // Group transactions by date string as-is (no timezone conversion)
  const txByDate = useMemo(() => {
    const map = {};
    transactions.forEach(tx => {
      const dateStr = tx.date;
      if (!map[dateStr]) map[dateStr] = [];
      map[dateStr].push(tx);
    });
    return map;
  }, [transactions]);

  // Form states
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [budgetForm, setBudgetForm] = useState({ monthlyBudget: '' });

  // Filter states

  // Filtered transactions for display in table
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]); // For top cards

  useEffect(() => {
    if (user?.monthlyBudget) {
      setMonthlyBudget(user.monthlyBudget);
      setBudgetForm({ monthlyBudget: user.monthlyBudget });
    }
    // Fetch all transactions for overview cards calculation
    (async () => {
      const all = await fetchTransactions({});
      setAllTransactions(all || []);
    })();
  }, [user]);

  // Separate effect for filter changes - only affects the filtered view
  useEffect(() => {
    const fetchFilteredData = async () => {
      const filtered = await fetchTransactions(filters);
      setFilteredTransactions(filtered || []);
    };
    fetchFilteredData();
    fetchMonthlyReport(filters.month, filters.year);
  }, [filters.month, filters.year]);

  const handleSubmitTransaction = async (e) => {
    e.preventDefault();
    try {
      // Fix: always use local date string for transaction
      // Use the date string from the form as-is (YYYY-MM-DD), do not convert to Date or toISOString
      const transactionData = {
        ...formData,
        amount: parseFloat(formData.amount),
        date: formData.date
      };

      if (editingTransaction) {
        await updateTransaction(editingTransaction._id, transactionData);
      } else {
        await addTransaction(transactionData);
      }

      setShowTransactionModal(false);
      resetTransactionForm();
      
      // Refresh all transactions for overview cards
      await fetchTransactions({});
      // Refresh filtered data
      const filtered = await fetchTransactions(filters);
      setFilteredTransactions(filtered || []);
      // Refresh monthly report
      fetchMonthlyReport(filters.month, filters.year);
    } catch (error) {
      console.error('Error submitting transaction:', error);
    }
  };

  const handleSubmitBudget = async (e) => {
    e.preventDefault();
    try {
      await updateMonthlyBudget(parseFloat(budgetForm.monthlyBudget));
      // Refresh auth data to ensure dashboard updates
      await checkAuth();
      setShowBudgetModal(false);
    } catch (error) {
      console.error('Error updating budget:', error);
    }
  };

  const handleDeleteTransaction = async (transactionId) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await deleteTransaction(transactionId);
        
        // Refresh all transactions for overview cards
        await fetchTransactions({});
        // Refresh filtered data
        const filtered = await fetchTransactions(filters);
        setFilteredTransactions(filtered || []);
        // Refresh monthly report
        fetchMonthlyReport(filters.month, filters.year);
      } catch (error) {
        console.error('Error deleting transaction:', error);
      }
    }
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      type: transaction.type,
      amount: transaction.amount.toString(),
      category: transaction.category,
      description: transaction.description || '',
      date: new Date(transaction.date).toISOString().split('T')[0]
    });
    setShowTransactionModal(true);
  };

  const resetTransactionForm = () => {
    setEditingTransaction(null);
    setFormData({
      type: 'expense',
      amount: '',
      category: '',
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const currentCategories = formData.type === 'expense' ? expenseCategories : incomeCategories;
  
  // Current month data (always current month, not affected by filters)
  const getCurrentMonthData = () => {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const currentMonthTransactions = allTransactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate.getMonth() + 1 === currentMonth &&
             transactionDate.getFullYear() === currentYear;
    });
    const expenses = currentMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((total, t) => total + t.amount, 0);
    const income = currentMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((total, t) => total + t.amount, 0);
    return { expenses, income };
  };
  const { expenses: currentMonthExpenses, income: currentMonthIncome } = getCurrentMonthData();
  const remainingBudget = monthlyBudget - currentMonthExpenses;
  const budgetUsage = monthlyBudget > 0 ? (currentMonthExpenses / monthlyBudget) * 100 : 0;

  return (
    <div className="min-h-screen bg-base-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-base-content">Expense Management</h1>
          <div className="flex gap-4">
            <button
              onClick={() => setShowBudgetModal(true)}
              className="btn btn-outline btn-primary"
            >
              <DollarSign className="w-5 h-5" />
              Set Budget
            </button>
            <button
              onClick={() => {
                resetTransactionForm();
                setShowTransactionModal(true);
              }}
              className="btn btn-primary"
            >
              <Plus className="w-5 h-5" />
              Add Transaction
            </button>
          </div>
        </div>

        {/* Financial Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card bg-base-200 shadow-md">
            <div className="card-body">
              <h3 className="card-title text-sm text-base-content/70">Monthly Budget</h3>
              <p className="text-2xl font-bold text-primary">{formatCurrency(monthlyBudget)}</p>
            </div>
          </div>
          
          <div className="card bg-base-200 shadow-md">
            <div className="card-body">
              <h3 className="card-title text-sm text-base-content/70">Total Expenses</h3>
              <p className="text-2xl font-bold text-error">{formatCurrency(currentMonthExpenses)}</p>
            </div>
          </div>
          
          <div className="card bg-base-200 shadow-md">
            <div className="card-body">
              <h3 className="card-title text-sm text-base-content/70">Total Income</h3>
              <p className="text-2xl font-bold text-success">{formatCurrency(currentMonthIncome)}</p>
            </div>
          </div>
          
          <div className="card bg-base-200 shadow-md">
            <div className="card-body">
              <h3 className="card-title text-sm text-base-content/70">Remaining Budget</h3>
              <p className={`text-2xl font-bold ${remainingBudget >= 0 ? 'text-success' : 'text-error'}`}>
                {formatCurrency(remainingBudget)}
              </p>
              <div className="w-full bg-base-300 rounded-full h-2 mt-2">
                <div 
                  className={`h-2 rounded-full ${budgetUsage > 100 ? 'bg-error' : budgetUsage > 80 ? 'bg-warning' : 'bg-success'}`}
                  style={{ width: `${Math.min(budgetUsage, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-base-content/70 mt-1">{budgetUsage.toFixed(1)}% used</p>
            </div>
          </div>
        </div>

        {/* Filters and Monthly Report */}
        <div className="card bg-base-200 shadow-md mb-6">
          <div className="card-body">
            <h3 className="card-title mb-4">
              <BarChart3 className="w-6 h-6" />
              Monthly Report
            </h3>
            
            {/* Filters Section */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold mb-4">Filters</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">
                    <span className="label-text">Month</span>
                  </label>
                  <select
                    className="select select-bordered w-full"
                    value={filters.month}
                    onChange={(e) => handleFilterChange('month', parseInt(e.target.value))}
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {new Date(2024, i).toLocaleString('en-US', { month: 'long' })}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="label">
                    <span className="label-text">Year</span>
                  </label>
                  <select
                    className="select select-bordered w-full"
                    value={filters.year}
                    onChange={(e) => handleFilterChange('year', parseInt(e.target.value))}
                  >
                    {Array.from({ length: 5 }, (_, i) => {
                      const year = new Date().getFullYear() - 2 + i;
                      return (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
            </div>

            {/* Monthly Report Section */}
            {monthlyReport && (
              <div>
                <h4 className="text-lg font-semibold mb-4">
                  Report for {new Date(filters.year, filters.month - 1).toLocaleString('en-US', { month: 'long', year: 'numeric' })}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="stat bg-base-100 rounded-lg">
                    <div className="stat-title">Total Income</div>
                    <div className="stat-value text-success">{formatCurrency(monthlyReport.totalIncome)}</div>
                  </div>
                  <div className="stat bg-base-100 rounded-lg">
                    <div className="stat-title">Total Expenses</div>
                    <div className="stat-value text-error">{formatCurrency(monthlyReport.totalExpenses)}</div>
                  </div>
                </div>
                
                {monthlyReport.categoriesBreakdown && monthlyReport.categoriesBreakdown.length > 0 && (
                  <div>
                    <h5 className="text-md font-semibold mb-4">Categories Breakdown</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {monthlyReport.categoriesBreakdown.map((category, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-base-100 rounded-lg">
                          <span className="font-medium">{category._id}</span>
                          <span className="text-sm font-bold">{formatCurrency(category.total)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>


        {/* Transactions List: Always show for selected date, default to today if none selected */}
        <div className="card bg-base-200 shadow-md">
          <div className="card-body">
            <h3 className="card-title mb-4">Transactions</h3>
            {(() => {
              const dateToShow = selectedDate || today;
              const year = dateToShow.getFullYear();
              const month = String(dateToShow.getMonth() + 1).padStart(2, '0');
              const day = String(dateToShow.getDate()).padStart(2, '0');
              const dateStr = `${year}-${month}-${day}`;
              const txs = txByDate[dateStr] || [];
              return (
                <>
                  <h4 className="mb-2 font-semibold">Transactions for {formatDate(dateToShow)}</h4>
                  {txs.length ? (
                    <ul className="divide-y">
                      {txs.map(tx => (
                        <li key={tx._id} className="py-2 flex justify-between items-center">
                          <div>
                            <span className={`font-bold ${tx.type === 'income' ? 'text-success' : 'text-error'}`}>{tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}</span>
                            <span className="ml-2">{tx.category}</span>
                            {tx.description && <span className="ml-2 text-xs text-base-content/60">{tx.description}</span>}
                          </div>
                          <div className="flex gap-2">
                            <button className="btn btn-xs btn-outline" onClick={() => handleEditTransaction(tx)}><Edit className="w-4 h-4" /></button>
                            <button className="btn btn-xs btn-outline btn-error" onClick={() => handleDeleteTransaction(tx._id)}><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-base-content/60">No transactions for this date.</p>
                  )}
                </>
              );
            })()}
          </div>
        </div>


        {/* Calendar at the bottom with daily totals */}
        <div className="mt-16 flex flex-col items-center">
          <h2 className="text-xl font-semibold mb-4 text-base-content">Finance Calendar</h2>
          <Calendar
              value={selectedDate || today}
              activeStartDate={calendarMonth}
              onActiveStartDateChange={handleCalendarMonthChange}
              onClickDay={date => {
                setSelectedDate(date);
                setCalendarMonth(new Date(date.getFullYear(), date.getMonth(), 1));
              }}
            className="rounded-lg shadow-lg bg-base-200 p-4"
            style={{ width: '700px', fontSize: '1.15rem' }}
            tileContent={({ date, view }) => {
              if (view !== 'month') return null;
              // Use local date string (YYYY-MM-DD) for calendar cell
              const year = date.getFullYear();
              const month = String(date.getMonth() + 1).padStart(2, '0');
              const day = String(date.getDate()).padStart(2, '0');
              const dateStr = `${year}-${month}-${day}`;
              const txs = txByDate[dateStr] || [];
              if (!txs.length) return null;
              const totalIncome = txs.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
              const totalExpense = txs.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
              return (
                <div className="flex flex-col items-center mt-1 space-y-0.5">
                  {totalIncome > 0 && (
                    <span className="inline-block text-xs bg-green-100 text-green-700 rounded px-1 font-bold">
                      +{totalIncome}
                    </span>
                  )}
                  {totalExpense > 0 && (
                    <span className="inline-block text-xs bg-red-100 text-red-700 rounded px-1 font-bold">
                      -{totalExpense}
                    </span>
                  )}
                </div>
              );
            }}
          />
        </div>

        {/* Modal for date details and CRUD */}
        {selectedDate && (
          <div className="modal modal-open" onClick={e => {
            if (e.target.classList.contains('modal-open')) {
              setSelectedDate(null);
            }
          }}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
              <h3 className="font-bold text-lg mb-4">Transactions for {formatDate(selectedDate)}</h3>
              {txByDate[
                (() => {
                  // selectedDate is a Date object, convert to YYYY-MM-DD string
                  if (!selectedDate) return '';
                  const year = selectedDate.getFullYear();
                  const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
                  const day = String(selectedDate.getDate()).padStart(2, '0');
                  return `${year}-${month}-${day}`;
                })()
              ]?.length ? (
                <ul className="divide-y">
                  {txByDate[
                    (() => {
                      if (!selectedDate) return '';
                      const year = selectedDate.getFullYear();
                      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
                      const day = String(selectedDate.getDate()).padStart(2, '0');
                      return `${year}-${month}-${day}`;
                    })()
                  ].map(tx => (
                    <li key={tx._id} className="py-2 flex justify-between items-center">
                      <div>
                        <span className={`font-bold ${tx.type === 'income' ? 'text-success' : 'text-error'}`}>{tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}</span>
                        <span className="ml-2">{tx.category}</span>
                        {tx.description && <span className="ml-2 text-xs text-base-content/60">{tx.description}</span>}
                      </div>
                      <div className="flex gap-2">
                        <button className="btn btn-xs btn-outline" onClick={() => handleEditTransaction(tx)}><Edit className="w-4 h-4" /></button>
                        <button className="btn btn-xs btn-outline btn-error" onClick={() => handleDeleteTransaction(tx._id)}><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-base-content/60">No transactions for this date.</p>
              )}
              <div className="modal-action">
                <button className="btn btn-primary" onClick={() => {
                  // Always use selectedDate as local YYYY-MM-DD string
                  function toLocalDateString(date) {
                    if (!date) return '';
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    return `${year}-${month}-${day}`;
                  }
                  const localDate = toLocalDateString(selectedDate);
                  resetTransactionForm();
                  setFormData(f => ({ ...f, date: localDate }));
                  setShowTransactionModal(false); // force close if open
                  setTimeout(() => {
                    setShowTransactionModal(true);
                  }, 0);
                }}>
                  <Plus className="w-4 h-4" /> Add Transaction
                </button>
                <button className="btn btn-ghost" onClick={() => setSelectedDate(null)}>Close</button>
              </div>
            </div>
          </div>
        )}

        {/* Modal for date details and CRUD (to be implemented next) */}
        {/* {selectedDate && (...)} */}
      </div>

      {/* Transaction Modal */}
      {showTransactionModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">
              {editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}
            </h3>
            <form onSubmit={handleSubmitTransaction} className="space-y-4">
              <div>
                <label className="label">
                  <span className="label-text">Type</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value, category: '' })}
                  required
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              
              <div>
                <label className="label">
                  <span className="label-text">Amount</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="input input-bordered w-full"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <label className="label">
                  <span className="label-text">Category</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                >
                  <option value="">Select a category</option>
                  {currentCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="label">
                  <span className="label-text">Description (Optional)</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              
              <div>
                <label className="label">
                  <span className="label-text">Date</span>
                </label>
                <input
                  type="date"
                  className="input input-bordered w-full"
                  value={formData.date}
                  min={formData.date}
                  max={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              
              <div className="modal-action">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    setShowTransactionModal(false);
                    resetTransactionForm();
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isLoading}>
                  {isLoading ? 'Saving...' : (editingTransaction ? 'Update' : 'Add')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Budget Modal */}
      {showBudgetModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Set Monthly Budget</h3>
            <form onSubmit={handleSubmitBudget} className="space-y-4">
              <div>
                <label className="label">
                  <span className="label-text">Monthly Budget</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="input input-bordered w-full"
                  value={budgetForm.monthlyBudget}
                  onChange={(e) => setBudgetForm({ monthlyBudget: e.target.value })}
                  required
                />
              </div>
              
              <div className="modal-action">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setShowBudgetModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Update Budget'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpensesPage;
