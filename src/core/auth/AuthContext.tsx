// Centralized Authentication & Session Management
// FACTORY OS - One Platform for the Shop Floor
// NOTE: DEMO MODE AUTHENTICATION - Designed for role simulation and rapid shop-floor authorization testing

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, RoleType, ModuleId } from '../../types';
import { hasPermission, canAccessModule, Permission } from './rbac';

export const DEMO_USERS: User[] = [
  {
    id: 'usr-001',
    name: 'Teguh Prasetyo',
    badgeNumber: 'OP-8821',
    email: 'teguh.p@factory.local',
    role: 'OPERATOR',
    department: 'Stamping Line 1',
    assignedLineId: 'line-01',
    active: true,
  },
  {
    id: 'usr-002',
    name: 'Budi Santoso',
    badgeNumber: 'LD-4412',
    email: 'budi.s@factory.local',
    role: 'LEADER',
    department: 'Assembly Line A',
    assignedLineId: 'line-01',
    active: true,
  },
  {
    id: 'usr-003',
    name: 'Hadi Wijaya',
    badgeNumber: 'SP-1002',
    email: 'hadi.w@factory.local',
    role: 'SUPERVISOR',
    department: 'Shop Floor Section 1',
    assignedLineId: 'line-01',
    active: true,
  },
  {
    id: 'usr-004',
    name: 'Dewi Lestari',
    badgeNumber: 'PR-3021',
    email: 'dewi.l@factory.local',
    role: 'PRODUCTION',
    department: 'Production Control',
    active: true,
  },
  {
    id: 'usr-005',
    name: 'Rian Kurniawan',
    badgeNumber: 'QA-5509',
    email: 'rian.k@factory.local',
    role: 'QUALITY',
    department: 'Quality Assurance',
    active: true,
  },
  {
    id: 'usr-006',
    name: 'Ahmad Fauzi',
    badgeNumber: 'EN-7704',
    email: 'ahmad.f@factory.local',
    role: 'ENGINEERING',
    department: 'Process Engineering',
    active: true,
  },
  {
    id: 'usr-007',
    name: 'Surya Pratama',
    badgeNumber: 'MT-6601',
    email: 'surya.p@factory.local',
    role: 'MAINTENANCE',
    department: 'Mechanical Maintenance',
    active: true,
  },
  {
    id: 'usr-008',
    name: 'Nita Rahmawati',
    badgeNumber: 'ML-2210',
    email: 'nita.r@factory.local',
    role: 'MATERIAL',
    department: 'Internal Logistics & Kanban',
    active: true,
  },
  {
    id: 'usr-009',
    name: 'Ir. Hendra Gunawan',
    badgeNumber: 'MG-0010',
    email: 'hendra.g@factory.local',
    role: 'MANAGER',
    department: 'Plant Operations',
    active: true,
  },
  {
    id: 'usr-010',
    name: 'Admin System',
    badgeNumber: 'AD-0001',
    email: 'admin@factoryos.local',
    role: 'ADMIN',
    department: 'Plant IT / Industrial Systems',
    active: true,
  },
];

interface AuthContextType {
  currentUser: User | null;
  currentRole: RoleType;
  allUsers: User[];
  loginAs: (userId: string) => void;
  switchRoleDirectly: (role: RoleType) => void;
  logout: () => void;
  checkPermission: (perm: Permission) => boolean;
  checkModuleAccess: (modId: ModuleId) => boolean;
  isDemoMode: boolean;
  toggleDemoMode: (val?: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'factory_os_active_user_id';
const DEMO_MODE_KEY = 'factory_os_demo_mode';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(DEMO_USERS);
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedId = localStorage.getItem(AUTH_STORAGE_KEY);
    const found = DEMO_USERS.find((u) => u.id === savedId);
    return found || DEMO_USERS[1]; // Default to LEADER Budi Santoso for best shop floor visibility
  });

  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(DEMO_MODE_KEY);
    return saved !== null ? saved === 'true' : true;
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(AUTH_STORAGE_KEY, currentUser.id);
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [currentUser]);

  const loginAs = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setCurrentUser(user);
    }
  };

  const switchRoleDirectly = (role: RoleType) => {
    // Find an existing demo user with this role, or create temporary active role profile
    const existing = users.find((u) => u.role === role);
    if (existing) {
      setCurrentUser(existing);
    } else if (currentUser) {
      const updated = { ...currentUser, role };
      setCurrentUser(updated);
    }
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const currentRole: RoleType = currentUser ? currentUser.role : 'OPERATOR';

  const checkPermission = (perm: Permission): boolean => {
    return hasPermission(currentRole, perm);
  };

  const checkModuleAccess = (modId: ModuleId): boolean => {
    return canAccessModule(currentRole, modId);
  };

  const toggleDemoMode = (val?: boolean) => {
    const newVal = val !== undefined ? val : !isDemoMode;
    setIsDemoMode(newVal);
    localStorage.setItem(DEMO_MODE_KEY, String(newVal));
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole,
        allUsers: users,
        loginAs,
        switchRoleDirectly,
        logout,
        checkPermission,
        checkModuleAccess,
        isDemoMode,
        toggleDemoMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
