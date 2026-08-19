import React, { useState } from 'react';
import { VetProvider, useVet } from './context/VetContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { QuickModals } from './components/QuickModals';
import { ClinicalCalculatorsModal } from './components/ClinicalCalculatorsModal';
import { MedicalPrintModal } from './components/MedicalPrintModal';
import { MultiparameterMonitorModal } from './components/MultiparameterMonitorModal';
import { DentalChartModal } from './components/DentalChartModal';
import { AnatomicalBodyMapModal } from './components/AnatomicalBodyMapModal';
import { AnesthesiaChartModal } from './components/AnesthesiaChartModal';
import { WhatsAppHubModal } from './components/WhatsAppHubModal';
import { ImagingAnnotatorModal } from './components/ImagingAnnotatorModal';
import { ToastNotification } from './components/ToastNotification';

// Icons for Mobile Bottom Navigation Bar
import {
  LayoutDashboard,
  PawPrint,
  BedDouble,
  Clock,
  Plus,
  Menu,
} from 'lucide-react';

// Views
import { DashboardView } from './components/DashboardView';
import { PatientsListView } from './components/PatientsListView';
import { Patient360View } from './components/Patient360View';
import { OwnersView } from './components/OwnersView';
import { HospitalizationWhiteboardView } from './components/HospitalizationWhiteboardView';
import { TriageView } from './components/TriageView';
import { AppointmentsView } from './components/AppointmentsView';
import { ConsultationsView } from './components/ConsultationsView';
import { VitalSignsView } from './components/VitalSignsView';
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
    setActiveView,
    selectedPatientId,
    hospitalizations,
    triageList,
    setQuickModal,
    isCalculatorsOpen,
    setIsCalculatorsOpen,
    isPrintModalOpen,
    closePrintModal,
    printData,
    isMonitorOpen,
    closeMonitor,
    monitorPatientId,

    // Next-Gen Modals
    isDentalChartOpen,
    dentalPatientId,
    closeDentalChart,
    isBodyMapOpen,
    bodyMapPatientId,
    closeBodyMap,
    isAnesthesiaChartOpen,
    anesthesiaPatientId,
    anesthesiaSurgeryName,
    closeAnesthesiaChart,
    isWhatsAppHubOpen,
    whatsAppData,
    closeWhatsAppHub,
    isImagingAnnotatorOpen,
    imagingAnnotatorData,
    closeImagingAnnotator,

    toasts,
    dismissToast,
  } = useVet();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const activeHospitalCount = hospitalizations.filter((h) => h.status === 'ACTIVA').length;
  const waitingTriageCount = triageList.filter((t) => t.status === 'EN_ESPERA').length;

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
      case 'SIGNOS_VITALES':
      case 'SIGNOS':
      case 'BIOMETRIA':
        return <VitalSignsView />;
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
      <Navbar onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />

      {/* Main App Container */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar (Desktop fixed + Mobile sliding drawer) */}
        <Sidebar
          isOpenMobile={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Dynamic Main Content Workspace */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8 custom-scrollbar bg-[#F1F5F9] pb-24 md:pb-8">
          <div className="max-w-7xl mx-auto">{renderActiveView()}</div>
        </main>
      </div>

      {/* Modern Mobile Bottom Navigation Bar (Visible only on < md screens) */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-30 px-2 py-1 flex items-center justify-around shadow-lg">
        <button
          onClick={() => setActiveView('DASHBOARD')}
          className={`flex flex-col items-center gap-0.5 p-2 rounded-xl transition-all ${
            activeView === 'DASHBOARD' || activeView === 'INICIO' ? 'text-teal-600 font-bold' : 'text-slate-500'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px]">Inicio</span>
        </button>

        <button
          onClick={() => setActiveView('PACIENTES')}
          className={`flex flex-col items-center gap-0.5 p-2 rounded-xl transition-all ${
            activeView === 'PACIENTES' ? 'text-teal-600 font-bold' : 'text-slate-500'
          }`}
        >
          <PawPrint className="w-5 h-5" />
          <span className="text-[10px]">Pacientes</span>
        </button>

        {/* Center Quick Action Floating Trigger */}
        <button
          onClick={() => setQuickModal('QUICK_ACTIONS')}
          className="flex flex-col items-center -mt-5 bg-teal-600 text-white p-3 rounded-full shadow-lg shadow-teal-600/30 active:scale-95 transition-transform border-4 border-white"
        >
          <Plus className="w-6 h-6 font-black" />
        </button>

        <button
          onClick={() => setActiveView('INTERNACION')}
          className={`flex flex-col items-center gap-0.5 p-2 rounded-xl transition-all relative ${
            activeView === 'INTERNACION' ? 'text-teal-600 font-bold' : 'text-slate-500'
          }`}
        >
          <BedDouble className="w-5 h-5" />
          <span className="text-[10px]">UCI</span>
          {activeHospitalCount > 0 && (
            <span className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          )}
        </button>

        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="flex flex-col items-center gap-0.5 p-2 rounded-xl text-slate-500 hover:text-slate-900"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px]">Más (18)</span>
        </button>
      </nav>

      {/* Overlays & Specialized Clinical Modals */}
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
      <DentalChartModal
        isOpen={isDentalChartOpen}
        onClose={closeDentalChart}
        patientId={dentalPatientId}
      />
      <AnatomicalBodyMapModal
        isOpen={isBodyMapOpen}
        onClose={closeBodyMap}
        patientId={bodyMapPatientId}
      />
      <AnesthesiaChartModal
        isOpen={isAnesthesiaChartOpen}
        onClose={closeAnesthesiaChart}
        patientId={anesthesiaPatientId}
        surgeryProcedureName={anesthesiaSurgeryName}
      />
      <WhatsAppHubModal
        isOpen={isWhatsAppHubOpen}
        onClose={closeWhatsAppHub}
        initialData={whatsAppData}
      />
      <ImagingAnnotatorModal
        isOpen={isImagingAnnotatorOpen}
        onClose={closeImagingAnnotator}
        patientId={imagingAnnotatorData?.patientId}
        imageUrl={imagingAnnotatorData?.imageUrl}
        studyTitle={imagingAnnotatorData?.studyTitle}
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
