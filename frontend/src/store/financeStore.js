import { create } from 'zustand';
import api from '../lib/axios';
import { useAuthStore } from './authStore';

export const useFinanceStore = create((set, get) => ({
  transactions: [],
  monthlyReport: null,
  monthlyBudget: 0,
  isLoading: false,
  error: null,

  // Default categories for expenses and income
  expenseCategories: [
    'Food & Dining',
    'Transportation',
    'Shopping',
    'Entertainment',
    'Bills & Utilities',
    'Healthcare',
    'Education',
    'Travel',
    'Home & Garden',
    'Personal Care',
    'Groceries',
    'Other'
  ],

  incomeCategories: [
    'Salary',
    'Freelance',
    'Investment',
    'Business',
    'Gift',
    'Bonus',
    'Side Hustle',
    'Other'
  ],

  // Fetch all transactions with optional filtering
  fetchTransactions: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (filters.month) params.append('month', filters.month);
      if (filters.year) params.append('year', filters.year);
      if (filters.type) params.append('type', filters.type);
      if (filters.category) params.append('category', filters.category);

      const response = await api.get(`/finance?${params.toString()}`);
      console.log('Transactions fetched:', response.data);
      
      set({ 
        transactions: response.data.logs || [], 
        isLoading: false 
      });
      return response.data.logs;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      const errorMessage = error.response?.data?.message || 'Failed to fetch transactions';
      set({ error: errorMessage, isLoading: false });
      return [];
    }
  },

  // Add a new transaction (income or expense)
  addTransaction: async (transactionData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/finance', transactionData);
      console.log('Transaction added:', response.data);
      
      const newTransaction = response.data.log;
      set((state) => ({
        transactions: [newTransaction, ...state.transactions],
        isLoading: false
      }));
      
      // Dispatch transaction event for achievement checking
      window.dispatchEvent(new CustomEvent('transactionAdded', { 
        detail: { transaction: newTransaction } 
      }));
      
      return newTransaction;
    } catch (error) {
      console.error('Error adding transaction:', error);
      const errorMessage = error.response?.data?.message || 'Failed to add transaction';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Update a transaction
  updateTransaction: async (transactionId, updates) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(`/finance/${transactionId}`, updates);
      console.log('Transaction updated:', response.data);
      
      const updatedTransaction = response.data.log;
      set((state) => ({
        transactions: state.transactions.map(transaction => 
          transaction._id === transactionId ? updatedTransaction : transaction
        ),
        isLoading: false
      }));
      
      return updatedTransaction;
    } catch (error) {
      console.error('Error updating transaction:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update transaction';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Delete a transaction
  deleteTransaction: async (transactionId) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/finance/${transactionId}`);
      console.log('Transaction deleted:', transactionId);
      
      set((state) => ({
        transactions: state.transactions.filter(transaction => transaction._id !== transactionId),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error deleting transaction:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete transaction';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Get monthly report
  fetchMonthlyReport: async (month, year) => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (month) params.append('month', month);
      if (year) params.append('year', year);

      const response = await api.get(`/finance/report/monthly?${params.toString()}`);
      console.log('Monthly report fetched:', response.data);
      
      set({ 
        monthlyReport: response.data.report,
        isLoading: false 
      });
      return response.data.report;
    } catch (error) {
      console.error('Error fetching monthly report:', error);
      const errorMessage = error.response?.data?.message || 'Failed to fetch monthly report';
      set({ error: errorMessage, isLoading: false });
      return null;
    }
  },

  // Update monthly budget
  updateMonthlyBudget: async (budget) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put('/finance/budget/monthly', { monthlyBudget: budget });
      console.log('Monthly budget updated:', response.data);
      
      set({ 
        monthlyBudget: response.data.monthlyBudget,
        isLoading: false 
      });
      
      // Also update the user object in auth store
      const authState = useAuthStore.getState();
      if (authState.user) {
        useAuthStore.setState({
          user: {
            ...authState.user,
            monthlyBudget: response.data.monthlyBudget
          }
        });
      }
      
      return response.data.monthlyBudget;
    } catch (error) {
      console.error('Error updating monthly budget:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update monthly budget';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Get current month's expenses total
  getCurrentMonthExpenses: () => {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    
    return get().transactions
      .filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return transaction.type === 'expense' &&
               transactionDate.getMonth() + 1 === currentMonth &&
               transactionDate.getFullYear() === currentYear;
      })
      .reduce((total, transaction) => total + transaction.amount, 0);
  },

  // Get current month's income total
  getCurrentMonthIncome: () => {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    
    return get().transactions
      .filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return transaction.type === 'income' &&
               transactionDate.getMonth() + 1 === currentMonth &&
               transactionDate.getFullYear() === currentYear;
      })
      .reduce((total, transaction) => total + transaction.amount, 0);
  },

  // Get remaining budget for current month
  getRemainingBudget: () => {
    const monthlyBudget = get().monthlyBudget;
    const currentExpenses = get().getCurrentMonthExpenses();
    return monthlyBudget - currentExpenses;
  },

  // Get budget usage percentage
  getBudgetUsagePercentage: () => {
    const monthlyBudget = get().monthlyBudget;
    const currentExpenses = get().getCurrentMonthExpenses();
    return monthlyBudget > 0 ? (currentExpenses / monthlyBudget) * 100 : 0;
  },

  // Get transactions by type
  getTransactionsByType: (type) => {
    return get().transactions.filter(transaction => transaction.type === type);
  },

  // Get recent transactions (last 5)
  getRecentTransactions: () => {
    return get().transactions.slice(0, 5);
  },

  // Set monthly budget (for initial loading)
  setMonthlyBudget: (budget) => {
    set({ monthlyBudget: budget });
  },

  // Clear all data
  clearData: () => {
    set({ 
      transactions: [], 
      monthlyReport: null, 
      monthlyBudget: 0, 
      isLoading: false, 
      error: null 
    });
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  }
}));
