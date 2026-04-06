import { User } from '../types';

const USERS_KEY = 'expense_tracker_users';
const CURRENT_USER_KEY = 'expense_tracker_current_user';

export function register(email: string, password: string, name: string): User | null {
  const users = getUsers();
  
  if (users.find(u => u.email === email)) {
    return null; // User already exists
  }

  const newUser: User = {
    id: crypto.randomUUID(),
    email,
    name,
  };

  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  localStorage.setItem(`${USERS_KEY}_${newUser.id}_password`, password);
  
  return newUser;
}

export function login(email: string, password: string): User | null {
  const users = getUsers();
  const user = users.find(u => u.email === email);
  
  if (!user) return null;
  
  const storedPassword = localStorage.getItem(`${USERS_KEY}_${user.id}_password`);
  if (storedPassword !== password) return null;
  
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  return user;
}

export function logout(): void {
  localStorage.removeItem(CURRENT_USER_KEY);
}

export function getCurrentUser(): User | null {
  const userStr = localStorage.getItem(CURRENT_USER_KEY);
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

function getUsers(): User[] {
  const usersStr = localStorage.getItem(USERS_KEY);
  if (!usersStr) return [];
  
  try {
    return JSON.parse(usersStr);
  } catch {
    return [];
  }
}
