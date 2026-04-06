import { Expense, Category } from '../types';

const EXPENSES_KEY = 'expense_tracker_expenses';
const CATEGORIES_KEY = 'expense_tracker_categories';

const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: 'Food & Dining', color: '#ef4444', icon: 'UtensilsCrossed', budget: 500 },
  { id: '2', name: 'Transportation', color: '#3b82f6', icon: 'Car', budget: 300 },
  { id: '3', name: 'Shopping', color: '#8b5cf6', icon: 'ShoppingBag', budget: 400 },
  { id: '4', name: 'Entertainment', color: '#ec4899', icon: 'Film', budget: 200 },
  { id: '5', name: 'Bills & Utilities', color: '#f59e0b', icon: 'Receipt', budget: 600 },
  { id: '6', name: 'Health & Fitness', color: '#10b981', icon: 'Heart', budget: 250 },
  { id: '7', name: 'Travel', color: '#06b6d4', icon: 'Plane', budget: 500 },
  { id: '8', name: 'Other', color: '#6b7280', icon: 'MoreHorizontal' },
];

export function getExpenses(userId: string): Expense[] {
  const expensesStr = localStorage.getItem(EXPENSES_KEY);
  if (!expensesStr) return [];
  
  try {
    const allExpenses: Expense[] = JSON.parse(expensesStr);
    return allExpenses.filter(e => e.userId === userId);
  } catch {
    return [];
  }
}

export function addExpense(expense: Expense): void {
  const expensesStr = localStorage.getItem(EXPENSES_KEY);
  const expenses: Expense[] = expensesStr ? JSON.parse(expensesStr) : [];
  expenses.push(expense);
  localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
}

export function updateExpense(expense: Expense): void {
  const expensesStr = localStorage.getItem(EXPENSES_KEY);
  if (!expensesStr) return;
  
  const expenses: Expense[] = JSON.parse(expensesStr);
  const index = expenses.findIndex(e => e.id === expense.id);
  if (index !== -1) {
    expenses[index] = expense;
    localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
  }
}

export function deleteExpense(expenseId: string): void {
  const expensesStr = localStorage.getItem(EXPENSES_KEY);
  if (!expensesStr) return;
  
  const expenses: Expense[] = JSON.parse(expensesStr);
  const filtered = expenses.filter(e => e.id !== expenseId);
  localStorage.setItem(EXPENSES_KEY, JSON.stringify(filtered));
}

export function getCategories(): Category[] {
  const categoriesStr = localStorage.getItem(CATEGORIES_KEY);
  if (!categoriesStr) {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(DEFAULT_CATEGORIES));
    return DEFAULT_CATEGORIES;
  }
  
  try {
    return JSON.parse(categoriesStr);
  } catch {
    return DEFAULT_CATEGORIES;
  }
}

export function addCategory(category: Category): void {
  const categories = getCategories();
  categories.push(category);
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
}

export function updateCategory(category: Category): void {
  const categories = getCategories();
  const index = categories.findIndex(c => c.id === category.id);
  if (index !== -1) {
    categories[index] = category;
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  }
}

export function deleteCategory(categoryId: string): void {
  const categories = getCategories();
  const filtered = categories.filter(c => c.id !== categoryId);
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(filtered));
}
