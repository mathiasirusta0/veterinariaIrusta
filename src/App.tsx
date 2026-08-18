import React from 'react';
import { VetProvider, useVet } from './context/VetContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { QuickModals } from './components/QuickModals';
import { ClinicalCalculatorsModal } from './components/ClinicalCalculatorsModal';
import { MedicalPrintModal } from './components/MedicalPrintModal';
import { MultiparameterMonitorModal } from './components/MultiparameterMonitorModal';
import { ToastNotification } from './components/ToastNotification';

// Views
import { DashboardView } from './components/DashboardView';
import { PatientsListView } from './components/PatientsListView';
import { Patient360View } from './components/Patient360View';
import { OwnersView } from './components/OwnersView';
import { HospitalizationWhiteboardView } from './components/HospitalizationWhiteboardView';
import { TriageView } from './components/TriageView';
import { AppointmentsView } from './components/AppointmentsView';
import { ConsultationsView } from './components/ConsultationsView';
import { SurgeriesView } from './components/SurgeriesView';
import { LaboratoryView } from './components/LaboratoryView';
import { ImagingView } from './components/ImagingView';
import { VaccinationView } from './components/VaccinationView';
import { InventoryView } from './components/InventoryView';
import { CashAndBillingView } from './components/CashAndBillingView';
import { DocumentsView } from './components/DocumentsView';
import { AiAssistantView } from './components/AiAssistantView';
import { SettingsAndUsersView } from './components/SettingsAndUsersView';

const MainLayout: React.FC = () => {
  const {
    activeView,
    selectedPatientId,
    isCalculatorsOpen,
    setIsCalculatorsOpen,
    isPrintModalOpen,
    closePrintModal,
    printData,
    isMonitorOpen,
    closeMonitor,
    monitorPatientId,
    toasts,
    dismissToast,
  } = useVet();

  const renderActiveView = () => {
    switch (activeView) {
      case 'DASHBOARD':
      case 'INICIO':
        return <DashboardView />;
      case 'PACIENTES':
        return selectedPatientId ? <Patient360View /> : <PatientsListView />;
      case 'PROPIETARIOS':
        return <OwnersView />;
      case 'INTERNACION':
        return <HospitalizationWhiteboardView />;
      case 'SALA_ESPERA':
        return <TriageView />;
      case 'AGENDA':
        return <AppointmentsView />;
      case 'CONSULTAS':
        return <ConsultationsView />;
      case 'CIRUGIAS':
        return <SurgeriesView />;
      case 'LABORATORIO':
        return <LaboratoryView />;
      case 'IMAGENES':
        return <ImagingView />;
      case 'VACUNAS':
      case 'VACUNACION':
        return <VaccinationView />;
      case 'INVENTARIO':
      case 'FARMACIA':
        return <InventoryView />;
      case 'CAJA_FACTURACION':
      case 'CAJA_FACTURAS':
      case 'CAJA':
        return <CashAndBillingView />;
      case 'DOCUMENTOS':
        return <DocumentsView />;
      case 'ASISTENTE_IA':
      case 'IA_CLINICA':
        return <AiAssistantView />;
      case 'CONFIGURACION':
      case 'AUDITORIA_USUARIOS':
        return <SettingsAndUsersView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-[#1E293B] flex flex-col font-sans selection:bg-teal-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar />

      {/* Main App Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar (Sleek Dark Slate-900) */}
        <Sidebar />

        {/* Dynamic Main Content Workspace (Sleek Light Slate-100) */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar bg-[#F1F5F9]">
          <div className="max-w-7xl mx-auto">{renderActiveView()}</div>
        </main>
      </div>

      {/* Overlays & Modals */}
      <GlobalSearchModal />
      <QuickModals />
      <ClinicalCalculatorsModal
        isOpen={isCalculatorsOpen}
        onClose={() => setIsCalculatorsOpen(false)}
      />
      <MedicalPrintModal
        isOpen={isPrintModalOpen}
        onClose={closePrintModal}
        printData={printData}
      />
      <MultiparameterMonitorModal
        isOpen={isMonitorOpen}
        onClose={closeMonitor}
        patientId={monitorPatientId || undefined}
      />

      {/* Global Floating Toast Notifications */}
      <ToastNotification toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};

export default function App() {
  return (
    <VetProvider>
      <MainLayout />
    </VetProvider>
  );
}
