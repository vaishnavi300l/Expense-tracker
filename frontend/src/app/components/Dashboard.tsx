import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { DollarSign, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { getExpenses, getCategories } from '../lib/storage';
import { getCurrentUser } from '../lib/auth';
import { Expense, Category } from '../types';
import { format, startOfMonth, endOfMonth, startOfDay } from 'date-fns';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

export function Dashboard() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setExpenses(getExpenses(user.id));
      setCategories(getCategories());
    }
  }, []);

  // Current month expenses
  const currentMonthStart = startOfMonth(new Date());
  const currentMonthEnd = endOfMonth(new Date());
  const monthExpenses = expenses.filter(e => {
    const expenseDate = new Date(e.date);
    return expenseDate >= currentMonthStart && expenseDate <= currentMonthEnd;
  });

  // Calculate totals
  const totalSpent = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalBudget = categories.reduce((sum, c) => sum + (c.budget || 0), 0);
  const budgetRemaining = totalBudget - totalSpent;

  // Today's expenses
  const todayExpenses = expenses.filter(e => {
    const expenseDate = startOfDay(new Date(e.date));
    const today = startOfDay(new Date());
    return expenseDate.getTime() === today.getTime();
  });
  const todayTotal = todayExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Category breakdown
  const categoryData = categories.map(category => {
    const categoryExpenses = monthExpenses.filter(e => e.category === category.name);
    const total = categoryExpenses.reduce((sum, e) => sum + e.amount, 0);
    return {
      name: category.name,
      value: total,
      color: category.color,
      budget: category.budget || 0,
    };
  }).filter(c => c.value > 0);

  // Last 7 days trend
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date;
  });

  const trendData = last7Days.map(date => {
    const dayExpenses = expenses.filter(e => {
      const expenseDate = startOfDay(new Date(e.date));
      const targetDate = startOfDay(date);
      return expenseDate.getTime() === targetDate.getTime();
    });
    const total = dayExpenses.reduce((sum, e) => sum + e.amount, 0);
    return {
      date: format(date, 'EEE'),
      amount: total,
    };
  });

  // Recent transactions
  const recentExpenses = [...expenses]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl mb-2">Dashboard</h1>
        <p className="text-gray-500">Overview of your expenses for {format(new Date(), 'MMMM yyyy')}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Total Spent</CardTitle>
            <DollarSign className="size-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">${totalSpent.toFixed(2)}</div>
            <p className="text-xs text-gray-500 mt-1">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Budget Remaining</CardTitle>
            <Wallet className="size-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">${budgetRemaining.toFixed(2)}</div>
            <p className="text-xs text-gray-500 mt-1">
              Of ${totalBudget.toFixed(2)} budget
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Today's Expenses</CardTitle>
            <TrendingDown className="size-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">${todayTotal.toFixed(2)}</div>
            <p className="text-xs text-gray-500 mt-1">{todayExpenses.length} transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Total Transactions</CardTitle>
            <TrendingUp className="size-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{monthExpenses.length}</div>
            <p className="text-xs text-gray-500 mt-1">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No expenses yet
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Last 7 Days Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                <Bar dataKey="amount" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {recentExpenses.length > 0 ? (
            <div className="space-y-4">
              {recentExpenses.map(expense => {
                const category = categories.find(c => c.name === expense.category);
                return (
                  <div key={expense.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                    <div className="flex items-center gap-3">
                      <div
                        className="size-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: category?.color + '20', color: category?.color }}
                      >
                        <span className="text-lg">💰</span>
                      </div>
                      <div>
                        <p className="font-medium">{expense.description}</p>
                        <p className="text-sm text-gray-500">
                          {expense.category} • {format(new Date(expense.date), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${expense.amount.toFixed(2)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No transactions yet. Start adding expenses!
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}