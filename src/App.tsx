// FACTORY OS - One Platform for the Shop Floor
import React, { useState } from 'react';
import { AuthProvider } from './core/auth/AuthContext';
import { AuditProvider } from './core/audit/AuditContext';
import { DataProvider } from './core/data/DataContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { TestRunnerModal } from './components/common/TestRunnerModal';
import { ModuleId } from './types';
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
  const [selectedLineId, setSelectedLineId] = useState('ALL');
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);

  const renderModuleContent = () => {
    switch (currentModule) {
      case 'dashboard': return <DashboardPage selectedLineId={selectedLineId} onNavigate={setCurrentModule} />;
      case 'launcher' as ModuleId: return <ModuleLauncherPage onSelectModule={setCurrentModule} />;
      case 'production': return <ProductionPage selectedLineId={selectedLineId} />;
      case 'quality': return <QualityPage selectedLineId={selectedLineId} />;
      case 'maintenance': return <MaintenancePage selectedLineId={selectedLineId} />;
      case 'material': return <MaterialPage selectedLineId={selectedLineId} />;
      case 'andon': return <AndonPage selectedLineId={selectedLineId} />;
      case 'knowledge': return <KnowledgePage />;
      case 'poka-yoke': return <PokaYokePage />;
      case 'handover': return <HandoverPage />;
      case 'people': return <PeopleSkillPage />;
      case 'analytics': return <ReportsPage />;
      case 'masterdata': return <MasterDataPage />;
      case 'users': return <UserManagementPage />;
      case 'roles': return <RolePermissionPage />;
      case 'audit': return <ActivityLogPage />;
      case 'settings': return <SettingsPage />;
      default: return <DashboardPage selectedLineId={selectedLineId} onNavigate={setCurrentModule} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans">
      <Header selectedLineId={selectedLineId} onSelectLineId={setSelectedLineId} onOpenTestModal={() => setIsTestModalOpen(true)} />
      <div className="flex-1 flex min-h-0">
        <Sidebar currentModule={currentModule} onSelectModule={setCurrentModule} />
        <main className="factory-stage flex-1 overflow-y-auto min-w-0">
          <div className="w-full max-w-[1600px] mx-auto px-4 py-5 sm:px-6 sm:py-6 xl:px-8 xl:py-8">
            {renderModuleContent()}
          </div>
        </main>
      </div>
      {isTestModalOpen && <TestRunnerModal onClose={() => setIsTestModalOpen(false)} />}
    </div>
  );
}

export default function App() {
  return <AuthProvider><AuditProvider><DataProvider><FactoryOSApp /></DataProvider></AuditProvider></AuthProvider>;
}
