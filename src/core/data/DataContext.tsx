// Data Layer Context Provider
// FACTORY OS - One Platform for the Shop Floor

import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';
import {
  LocalMasterDataRepository,
  LocalProductionRepository,
  LocalQualityRepository,
  LocalMaintenanceRepository,
  LocalMaterialRepository,
  LocalAndonRepository,
  LocalKnowledgeRepository,
  LocalPokaYokeRepository,
  LocalShiftHandoverRepository,
} from './localStore';
import {
  IMasterDataRepository,
  IProductionRepository,
  IQualityRepository,
  IMaintenanceRepository,
  IMaterialRepository,
  IAndonRepository,
  IKnowledgeRepository,
  IPokaYokeRepository,
  IShiftHandoverRepository,
} from './types';
import { DeterministicAiFallbackService } from '../ai/IAiProvider';

interface DataContextType {
  masterDataRepo: IMasterDataRepository;
  productionRepo: IProductionRepository;
  qualityRepo: IQualityRepository;
  maintenanceRepo: IMaintenanceRepository;
  materialRepo: IMaterialRepository;
  andonRepo: IAndonRepository;
  knowledgeRepo: IKnowledgeRepository;
  pokaYokeRepo: IPokaYokeRepository;
  shiftHandoverRepo: IShiftHandoverRepository;
  aiService: DeterministicAiFallbackService;
  dataVersion: number;
  notifyDataChanged: () => void;
  resetAllDemoData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dataVersion, setDataVersion] = useState<number>(1);

  // Repositories are instantiated once and persist across re-renders
  const masterDataRepo = useMemo(() => new LocalMasterDataRepository(), []);
  const productionRepo = useMemo(() => new LocalProductionRepository(), []);
  const qualityRepo = useMemo(() => new LocalQualityRepository(), []);
  const maintenanceRepo = useMemo(() => new LocalMaintenanceRepository(), []);
  const materialRepo = useMemo(() => new LocalMaterialRepository(), []);
  const andonRepo = useMemo(() => new LocalAndonRepository(), []);
  const knowledgeRepo = useMemo(() => new LocalKnowledgeRepository(), []);
  const pokaYokeRepo = useMemo(() => new LocalPokaYokeRepository(), []);
  const shiftHandoverRepo = useMemo(() => new LocalShiftHandoverRepository(), []);
  const aiService = useMemo(() => new DeterministicAiFallbackService(), []);

  const notifyDataChanged = useCallback(() => {
    setDataVersion((v) => v + 1);
  }, []);

  const resetAllDemoData = useCallback(() => {
    // Clear custom storage keys
    const keys = [
      'factory_os_data_lines',
      'factory_os_data_machines',
      'factory_os_data_parts',
      'factory_os_data_orders',
      'factory_os_data_downtimes',
      'factory_os_data_defects',
      'factory_os_data_maintenance',
      'factory_os_data_materials',
      'factory_os_data_material_requests',
      'factory_os_data_andon',
      'factory_os_data_knowledge',
      'factory_os_data_pokayoke_rules',
      'factory_os_data_handovers',
    ];
    keys.forEach((k) => localStorage.removeItem(k));
    window.location.reload();
  }, []);

  return (
    <DataContext.Provider
      value={{
        masterDataRepo,
        productionRepo,
        qualityRepo,
        maintenanceRepo,
        materialRepo,
        andonRepo,
        knowledgeRepo,
        pokaYokeRepo,
        shiftHandoverRepo,
        aiService,
        dataVersion,
        notifyDataChanged,
        resetAllDemoData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const ctx = useContext(DataContext);
  if (!ctx) {
    throw new Error('useData must be used within a DataProvider');
  }
  return ctx;
};
