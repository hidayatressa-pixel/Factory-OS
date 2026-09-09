// FACTORY OS - One Platform for the Shop Floor
// Modular Shop-Floor Operations Platform

import React, { useState } from 'react';
import { AuthProvider } from './core/auth/AuthContext';
import { AuditProvider } from './core/audit/AuditContext';
import { DataProvider } from './core/data/DataContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { TestRunnerModal } from './components/common/TestRunnerModal';
import { ModuleId } from './types';

// Modules
import { DashboardPage } from './modules/dashboard/DashboardPage';
import { ModuleLauncherPage } from './modules/launcher/ModuleLauncherPage';
import { ProductionPage } from './modules/production/ProductionPage';
import { QualityPage } from './modules/quality/QualityPage';
import { MaintenancePage } from './modules/maintenance/MaintenancePage';
import { MaterialPage } from './modules/material/MaterialPage';
import { AndonPage } from './modules/andon/AndonPage';
import { KnowledgePage } from './modules/knowledge/KnowledgePage';
import { PokaYokePage } from './modules/pokayoke/PokaYokePage';
import { HandoverPage } from './modules/handover/HandoverPage';
import { PeopleSkillPage } from './modules/people/PeopleSkillPage';
import { ReportsPage } from './modules/analytics/ReportsPage';
import { MasterDataPage } from './modules/masterdata/MasterDataPage';
import { UserManagementPage } from './modules/users/UserManagementPage';
import { RolePermissionPage } from './modules/roles/RolePermissionPage';
import { ActivityLogPage } from './modules/audit/ActivityLogPage';
import { SettingsPage } from './modules/settings/SettingsPage';

function FactoryOSApp() {
  const [currentModule, setCurrentModule] = useState<ModuleId>('dashboard');
  const [selectedLineId, setSelectedLineId] = useState<string>('ALL');
  const [isTestModalOpen, setIsTestModalOpen] = useState<boolean>(false);

  const renderModuleContent = () => {
    switch (currentModule) {
      case 'dashboard':
        return (
          <DashboardPage
            selectedLineId={selectedLineId}
            onNavigate={(mod) => setCurrentModule(mod)}
          />
        );
      case 'launcher' as ModuleId:
        return (
          <ModuleLauncherPage
            onSelectModule={(mod) => setCurrentModule(mod)}
          />
        );
      case 'production':
        return <ProductionPage selectedLineId={selectedLineId} />;
      case 'quality':
        return <QualityPage selectedLineId={selectedLineId} />;
      case 'maintenance':
        return <MaintenancePage selectedLineId={selectedLineId} />;
      case 'material':
        return <MaterialPage selectedLineId={selectedLineId} />;
      case 'andon':
        return <AndonPage selectedLineId={selectedLineId} />;
      case 'knowledge':
        return <KnowledgePage />;
      case 'poka-yoke':
        return <PokaYokePage />;
      case 'handover':
        return <HandoverPage />;
      case 'people':
        return <PeopleSkillPage />;
      case 'analytics':
        return <ReportsPage />;
      case 'masterdata':
        return <MasterDataPage />;
      case 'users':
        return <UserManagementPage />;
      case 'roles':
        return <RolePermissionPage />;
      case 'audit':
        return <ActivityLogPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return (
          <DashboardPage
            selectedLineId={selectedLineId}
            onNavigate={(mod) => setCurrentModule(mod)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Industrial Header & Status Bar */}
      <Header
        selectedLineId={selectedLineId}
        onSelectLineId={setSelectedLineId}
        onOpenTestModal={() => setIsTestModalOpen(true)}
      />

      {/* Main Layout: Sidebar & Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Persistent RBAC-Filtered Navigation Sidebar */}
        <Sidebar
          currentModule={currentModule}
          onSelectModule={(mod) => setCurrentModule(mod)}
        />

        {/* Dynamic Shop-Floor Module Stage */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-950">
          <div className="max-w-7xl mx-auto">
            {renderModuleContent()}
          </div>
        </main>
      </div>

      {/* In-App Automated Test Runner Verification Modal */}
      {isTestModalOpen && (
        <TestRunnerModal onClose={() => setIsTestModalOpen(false)} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AuditProvider>
        <DataProvider>
          <FactoryOSApp />
        </DataProvider>
      </AuditProvider>
    </AuthProvider>
  );
}
