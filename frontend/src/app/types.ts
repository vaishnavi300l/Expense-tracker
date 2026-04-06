export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Expense {
  id: string;
  userId: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  budget?: number;
}

export interface Budget {
  categoryId: string;
  amount: number;
  period: 'monthly' | 'weekly';
}
