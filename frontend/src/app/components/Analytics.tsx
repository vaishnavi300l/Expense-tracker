import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { getExpenses, getCategories } from '../lib/storage';
import { getCurrentUser } from '../lib/auth';
import { Expense, Category } from '../types';
import { format, startOfMonth, endOfMonth, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export function Analytics() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | '3months' | '6months'>('month');

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setExpenses(getExpenses(user.id));
      setCategories(getCategories());
    }
  }, []);

  // Get filtered expenses based on time range
  const getFilteredExpenses = () => {
    const now = new Date();
    let startDate: Date;

    switch (timeRange) {
      case 'week':
        startDate = startOfWeek(now);
        break;
      case 'month':
        startDate = startOfMonth(now);
        break;
      case '3months':
        startDate = startOfMonth(subMonths(now, 2));
        break;
      case '6months':
        startDate = startOfMonth(subMonths(now, 5));
        break;
    }

    return expenses.filter(e => new Date(e.date) >= startDate);
  };

  const filteredExpenses = getFilteredExpenses();

  // Monthly trend data
  const getMonthlyTrend = () => {
    const months = timeRange === '6months' ? 6 : timeRange === '3months' ? 3 : 1;
    const data = [];

    for (let i = months - 1; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      
      const monthExpenses = filteredExpenses.filter(e => {
        const expenseDate = new Date(e.date);
        return expenseDate >= monthStart && expenseDate <= monthEnd;
      });

      const total = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
      
      data.push({
        month: format(date, 'MMM yyyy'),
        amount: parseFloat(total.toFixed(2)),
        count: monthExpenses.length,
      });
    }

    return data;
  };

  // Category breakdown
  const getCategoryBreakdown = () => {
    return categories.map(category => {
      const categoryExpenses = filteredExpenses.filter(e => e.category === category.name);
      const total = categoryExpenses.reduce((sum, e) => sum + e.amount, 0);
      const budget = category.budget || 0;
      const percentage = budget > 0 ? (total / budget) * 100 : 0;

      return {
        name: category.name,
        spent: parseFloat(total.toFixed(2)),
        budget,
        remaining: parseFloat((budget - total).toFixed(2)),
        percentage: parseFloat(percentage.toFixed(1)),
        color: category.color,
        count: categoryExpenses.length,
      };
    }).filter(c => c.spent > 0 || c.budget > 0);
  };

  // Top expenses
  const getTopExpenses = () => {
    return [...filteredExpenses]
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  };

  const monthlyTrend = getMonthlyTrend();
  const categoryBreakdown = getCategoryBreakdown();
  const topExpenses = getTopExpenses();
  const totalSpent = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const avgExpense = filteredExpenses.length > 0 ? totalSpent / filteredExpenses.length : 0;

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">Analytics</h1>
          <p className="text-gray-500">Insights into your spending patterns</p>
        </div>
        <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="3months">Last 3 Months</SelectItem>
            <SelectItem value="6months">Last 6 Months</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl">${totalSpent.toFixed(2)}</div>
            <p className="text-sm text-gray-500 mt-1">{filteredExpenses.length} transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Average Expense</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl">${avgExpense.toFixed(2)}</div>
            <p className="text-sm text-gray-500 mt-1">Per transaction</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Most Spent Category</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryBreakdown.length > 0 ? (
              <>
                <div className="text-3xl">
                  {categoryBreakdown.reduce((max, c) => c.spent > max.spent ? c : max).name}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  ${categoryBreakdown.reduce((max, c) => c.spent > max.spent ? c : max).spent.toFixed(2)}
                </p>
              </>
            ) : (
              <div className="text-gray-500">No data</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Spending Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyTrend.length > 0 && monthlyTrend.some(m => m.amount > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                  <Legend />
                  <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2} name="Amount" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryBreakdown.length > 0 && categoryBreakdown.some(c => c.spent > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryBreakdown.filter(c => c.spent > 0)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name} ${percentage}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="spent"
                  >
                    {categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Budget vs Spending */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Budget vs Actual Spending</CardTitle>
        </CardHeader>
        <CardContent>
          {categoryBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={categoryBreakdown}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                <Legend />
                <Bar dataKey="budget" fill="#94a3b8" name="Budget" />
                <Bar dataKey="spent" fill="#3b82f6" name="Spent" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[400px] flex items-center justify-center text-gray-500">
              No budget data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Expenses */}
      <Card>
        <CardHeader>
          <CardTitle>Top 5 Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          {topExpenses.length > 0 ? (
            <div className="space-y-4">
              {topExpenses.map((expense, index) => {
                const cat = categories.find(c => c.name === expense.category);
                return (
                  <div key={expense.id} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-bold text-gray-300">#{index + 1}</div>
                      <div
                        className="size-12 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: cat?.color + '20', color: cat?.color }}
                      >
                        <span className="text-xl">💰</span>
                      </div>
                      <div>
                        <p className="font-medium">{expense.description}</p>
                        <p className="text-sm text-gray-500">
                          {expense.category} • {format(new Date(expense.date), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="text-xl font-semibold">${expense.amount.toFixed(2)}</div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No expenses found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}