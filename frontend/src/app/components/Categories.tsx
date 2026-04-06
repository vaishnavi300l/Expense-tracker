import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { getCategories, addCategory, updateCategory, deleteCategory, getExpenses } from '../lib/storage';
import { getCurrentUser } from '../lib/auth';
import { Category } from '../types';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Progress } from './ui/progress';

const ICON_OPTIONS = ['UtensilsCrossed', 'Car', 'ShoppingBag', 'Film', 'Receipt', 'Heart', 'Plane', 'Home', 'Book', 'Coffee', 'Gift', 'Music', 'MoreHorizontal'];
const COLOR_OPTIONS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1', '#14b8a6', '#a855f7'];

export function Categories() {
  const user = getCurrentUser();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLOR_OPTIONS[0]);
  const [icon, setIcon] = useState(ICON_OPTIONS[0]);
  const [budget, setBudget] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setCategories(getCategories());
  };

  const resetForm = () => {
    setName('');
    setColor(COLOR_OPTIONS[0]);
    setIcon(ICON_OPTIONS[0]);
    setBudget('');
    setEditingCategory(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name) {
      toast.error('Please enter a category name');
      return;
    }

    const categoryData: Category = {
      id: editingCategory?.id || crypto.randomUUID(),
      name,
      color,
      icon,
      budget: budget ? parseFloat(budget) : undefined,
    };

    if (editingCategory) {
      updateCategory(categoryData);
      toast.success('Category updated successfully');
    } else {
      addCategory(categoryData);
      toast.success('Category added successfully');
    }

    loadData();
    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setName(category.name);
    setColor(category.color);
    setIcon(category.icon);
    setBudget(category.budget?.toString() || '');
    setIsDialogOpen(true);
  };

  const handleDelete = (categoryId: string) => {
    if (confirm('Are you sure you want to delete this category? This will not delete associated expenses.')) {
      deleteCategory(categoryId);
      loadData();
      toast.success('Category deleted successfully');
    }
  };

  // Get spending per category
  const getCategorySpending = (categoryName: string) => {
    if (!user) return 0;
    const expenses = getExpenses(user.id);
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    
    return expenses
      .filter(e => e.category === categoryName && new Date(e.date) >= firstDay)
      .reduce((sum, e) => sum + e.amount, 0);
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">Categories</h1>
          <p className="text-gray-500">Manage your expense categories and budgets</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="size-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Category Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Groceries"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label>Color</Label>
                <div className="grid grid-cols-6 gap-2">
                  {COLOR_OPTIONS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`size-10 rounded-lg transition-all ${
                        color === c ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : ''
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget">Monthly Budget (Optional)</Label>
                <Input
                  id="budget"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                />
              </div>

              <Button type="submit" className="w-full">
                {editingCategory ? 'Update Category' : 'Add Category'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map(category => {
          const spent = getCategorySpending(category.name);
          const budgetAmount = category.budget || 0;
          const percentage = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;
          const isOverBudget = percentage > 100;

          return (
            <Card key={category.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="size-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: category.color + '20', color: category.color }}
                    >
                      <span className="text-2xl">💰</span>
                    </div>
                    <div>
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                      {category.budget && (
                        <p className="text-sm text-gray-500 mt-1">
                          ${spent.toFixed(2)} / ${category.budget.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(category)}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(category.id)}
                    >
                      <Trash2 className="size-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {category.budget ? (
                  <div className="space-y-2">
                    <Progress value={Math.min(percentage, 100)} className="h-2" />
                    <div className="flex items-center justify-between text-sm">
                      <span className={isOverBudget ? 'text-red-500' : 'text-gray-600'}>
                        {percentage.toFixed(0)}% used
                      </span>
                      {isOverBudget && (
                        <span className="text-red-500 font-medium">
                          Over budget!
                        </span>
                      )}
                      {!isOverBudget && budgetAmount > 0 && (
                        <span className="text-gray-600">
                          ${(budgetAmount - spent).toFixed(2)} left
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No budget set</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {categories.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            No categories yet. Click "Add Category" to create one!
          </CardContent>
        </Card>
      )}
    </div>
  );
}
