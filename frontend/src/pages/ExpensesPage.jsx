import { useState, useEffect } from 'react';
import { useFinanceStore } from '../store/financeStore';
import { useAuthStore } from '../store/authStore';
import { Plus, Edit, Trash2, BarChart3, DollarSign } from 'lucide-react';

const ExpensesPage = () => {
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
  const [filters, setFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    type: '',
    category: ''
  });

  // Filtered transactions for display in table
  const [filteredTransactions, setFilteredTransactions] = useState([]);

  useEffect(() => {
    if (user?.monthlyBudget) {
      setMonthlyBudget(user.monthlyBudget);
      setBudgetForm({ monthlyBudget: user.monthlyBudget });
    }
    // Fetch all transactions for overview cards calculation
    fetchTransactions({});
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
      const transactionData = {
        ...formData,
        amount: parseFloat(formData.amount)
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
    
    const currentMonthTransactions = transactions.filter(transaction => {
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

        {/* Transactions List */}
        <div className="card bg-base-200 shadow-md">
          <div className="card-body">
            <h3 className="card-title mb-4">Transactions</h3>
            
            {error && (
              <div className="alert alert-error mb-4">
                <span>{error}</span>
                <button onClick={clearError} className="btn btn-sm btn-ghost">×</button>
              </div>
            )}

            {isLoading ? (
              <div className="flex justify-center py-8">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-8 text-base-content/70">
                <p>No transactions found for the selected period. Add your first transaction to get started!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-zebra">
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>Category</th>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((transaction) => (
                      <tr key={transaction._id}>
                        <td>{transaction.description || '-'}</td>
                        <td>{transaction.category}</td>
                        <td>
                          <span className={`badge ${transaction.type === 'income' ? 'badge-success' : 'badge-error'}`}>
                            {transaction.type}
                          </span>
                        </td>
                        <td className={`font-bold ${transaction.type === 'income' ? 'text-success' : 'text-error'}`}>
                          {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </td>
                        <td>{formatDate(transaction.date)}</td>
                        <td>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditTransaction(transaction)}
                              className="btn btn-ghost btn-sm"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteTransaction(transaction._id)}
                              className="btn btn-ghost btn-sm text-error"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
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
