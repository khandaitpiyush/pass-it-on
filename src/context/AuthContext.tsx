import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  userId: string;
  name: string;
  email: string;
  collegeCode: string;
  collegeName: string;
  isVerified: boolean;
  role: 'student';
  branch?: string;
  year?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: SignupData) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

interface SignupData {
  name: string;
  email: string;
  password: string;
  collegeCode: string;
  branch?: string;
  year?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    // Mock login - In production, this would call your backend API
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API call
    
    // Mock user data based on email
    const isCollegeEmail = email.includes('@dbit.in') || email.includes('@college.edu');
    const collegeCode = email.includes('@dbit.in') ? 'DBIT' : 'VJTI';
    const collegeName = email.includes('@dbit.in') ? 'Don Bosco Institute of Technology' : 'Veermata Jijabai Technological Institute';
    
    const mockUser: User = {
      userId: `${collegeCode}.${Math.floor(Math.random() * 1000000)}`,
      name: email.split('@')[0],
      email,
      collegeCode,
      collegeName,
      isVerified: isCollegeEmail,
      role: 'student',
      branch: 'Computer Engineering',
      year: '3rd Year',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
    };
    
    setUser(mockUser);
    localStorage.setItem('user', JSON.stringify(mockUser));
    setIsLoading(false);
  };

  const signup = async (userData: SignupData) => {
    setIsLoading(true);
    
    // Mock signup - In production, this would call your backend API
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    
    const isCollegeEmail = userData.email.includes('@dbit.in') || userData.email.includes('@college.edu');
    
    // Get college name from code
    const colleges: Record<string, string> = {
      'DBIT': 'Don Bosco Institute of Technology',
      'VJTI': 'Veermata Jijabai Technological Institute',
      'SPIT': 'Sardar Patel Institute of Technology',
      'TSEC': 'Thadomal Shahani Engineering College',
      'KJ': 'K.J. Somaiya College of Engineering'
    };
    
    const mockUser: User = {
      userId: `${userData.collegeCode}.${Date.now()}`,
      name: userData.name,
      email: userData.email,
      collegeCode: userData.collegeCode,
      collegeName: colleges[userData.collegeCode] || 'College',
      isVerified: isCollegeEmail,
      role: 'student',
      branch: userData.branch,
      year: userData.year,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.email}`
    };
    
    setUser(mockUser);
    localStorage.setItem('user', JSON.stringify(mockUser));
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
