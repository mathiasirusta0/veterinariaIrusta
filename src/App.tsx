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
import { AccessDeniedView } from './components/AccessDeniedView';
import { ModuleErrorBoundary } from './components/ModuleErrorBoundary';
import { MobileBottomNav } from './components/MobileBottomNav';
import { hasViewPermission, SystemView } from './utils/rbac';
import { triggerHaptic } from './utils/haptics';

// Icons for Mobile Bottom Navigation Bar
import {
  LayoutDashboard,
  PawPrint,
  BedDouble,
  Clock,
  Plus,
  Menu,
  Receipt,
  Boxes,
  ShieldCheck,
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
import { PrescriptionsView } from './components/PrescriptionsView';
import { SystemQaTestCenterView } from './components/SystemQaTestCenterView';

const MainLayout: React.FC = () => {
  const {
    activeView,
    setActiveView,
    selectedPatientId,
    setSelectedPatientId,
    currentUser,
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
    // Normalizar ID de vista
    let viewKey: SystemView = 'OPERACION';
    if (activeView === 'OPERACION' || activeView === 'DASHBOARD' || activeView === 'INICIO') viewKey = 'OPERACION';
    if (activeView === 'PACIENTES') viewKey = 'PACIENTES';
    else if (activeView === 'PROPIETARIOS') viewKey = 'PROPIETARIOS';
    else if (activeView === 'INTERNACION') viewKey = 'INTERNACION';
    else if (activeView === 'SALA_ESPERA') viewKey = 'SALA_ESPERA';
    else if (activeView === 'AGENDA') viewKey = 'AGENDA';
    else if (activeView === 'CONSULTAS') viewKey = 'CONSULTAS';
    else if (activeView === 'SIGNOS_VITALES' || activeView === 'SIGNOS' || activeView === 'BIOMETRIA') viewKey = 'SIGNOS_VITALES';
    else if (activeView === 'CIRUGIAS') viewKey = 'CIRUGIAS';
    else if (activeView === 'LABORATORIO') viewKey = 'LABORATORIO';
    else if (activeView === 'IMAGENES') viewKey = 'IMAGENES';
    else if (activeView === 'VACUNAS' || activeView === 'VACUNACION') viewKey = 'VACUNAS';
    else if (activeView === 'INVENTARIO' || activeView === 'FARMACIA') viewKey = 'INVENTARIO';
    else if (activeView === 'CAJA_FACTURACION' || activeView === 'CAJA_FACTURAS' || activeView === 'CAJA') viewKey = 'CAJA_FACTURACION';
    else if (activeView === 'DOCUMENTOS') viewKey = 'DOCUMENTOS';
    else if (activeView === 'ASISTENTE_IA' || activeView === 'IA_CLINICA') viewKey = 'ASISTENTE_IA';
    else if (activeView === 'CONFIGURACION' || activeView === 'AUDITORIA_USUARIOS') viewKey = 'CONFIGURACION';

    // Verificación de RBAC
    if (!hasViewPermission(currentUser?.role, viewKey)) {
      return <AccessDeniedView attemptedView={activeView} />;
    }

    switch (activeView) {
      case 'OPERACION':
      case 'DASHBOARD':
      case 'INICIO':
      case 'PACIENTES':
        return (
          <ModuleErrorBoundary moduleName="Directorio de Pacientes">
            {selectedPatientId ? <Patient360View /> : <PatientsListView />}
          </ModuleErrorBoundary>
        );
      case 'GESTION':
        return (
          <ModuleErrorBoundary moduleName="Gestión & Farmacia">
            <InventoryView />
          </ModuleErrorBoundary>
        );

      case 'PROPIETARIOS':
        return (
          <ModuleErrorBoundary moduleName="Propietarios & Tutores">
            <OwnersView />
          </ModuleErrorBoundary>
        );
      case 'INTERNACION':
        return (
          <ModuleErrorBoundary moduleName="Pizarra de Internación UCI">
            <HospitalizationWhiteboardView />
          </ModuleErrorBoundary>
        );
      case 'SALA_ESPERA':
        return (
          <ModuleErrorBoundary moduleName="Sala de Espera & Triage">
            <TriageView />
          </ModuleErrorBoundary>
        );
      case 'AGENDA':
        return (
          <ModuleErrorBoundary moduleName="Agenda de Turnos">
            <AppointmentsView />
          </ModuleErrorBoundary>
        );
      case 'CONSULTAS':
        return (
          <ModuleErrorBoundary moduleName="Consultas Médicas SOAP">
            <ConsultationsView />
          </ModuleErrorBoundary>
        );
      case 'SIGNOS_VITALES':
      case 'SIGNOS':
      case 'BIOMETRIA':
        return (
          <ModuleErrorBoundary moduleName="Signos Vitales">
            <VitalSignsView />
          </ModuleErrorBoundary>
        );
      case 'CIRUGIAS':
        return (
          <ModuleErrorBoundary moduleName="Quirófano & Cirugías">
            <SurgeriesView />
          </ModuleErrorBoundary>
        );
      case 'LABORATORIO':
        return (
          <ModuleErrorBoundary moduleName="Laboratorio Clínico">
            <LaboratoryView />
          </ModuleErrorBoundary>
        );
      case 'IMAGENES':
        return (
          <ModuleErrorBoundary moduleName="Diagnóstico por Imágenes">
            <ImagingView />
          </ModuleErrorBoundary>
        );
      case 'VACUNAS':
      case 'VACUNACION':
        return (
          <ModuleErrorBoundary moduleName="Plan de Vacunación">
            <VaccinationView />
          </ModuleErrorBoundary>
        );
      case 'INVENTARIO':
      case 'FARMACIA':
        return (
          <ModuleErrorBoundary moduleName="Farmacia & Stock">
            <InventoryView />
          </ModuleErrorBoundary>
        );
      case 'CAJA_FACTURACION':
      case 'CAJA_FACTURAS':
      case 'CAJA':
        return (
          <ModuleErrorBoundary moduleName="Caja & Facturación AFIP">
            <CashAndBillingView />
          </ModuleErrorBoundary>
        );
      case 'DOCUMENTOS':
        return (
          <ModuleErrorBoundary moduleName="Documentos & Consentimientos">
            <DocumentsView />
          </ModuleErrorBoundary>
        );
      case 'ASISTENTE_IA':
      case 'IA_CLINICA':
        return (
          <ModuleErrorBoundary moduleName="Asistente de IA Clínica">
            <AiAssistantView />
          </ModuleErrorBoundary>
        );
      case 'RECETAS_OFICIALES':
      case 'RECETAS':
        return (
          <ModuleErrorBoundary moduleName="Recetario Veterinario Oficial SENASA">
            <PrescriptionsView />
          </ModuleErrorBoundary>
        );
      case 'CENTRO_QA':
      case 'TESTS':
      case 'TESTER':
        return (
          <ModuleErrorBoundary moduleName="Centro de Pruebas QA">
            <SystemQaTestCenterView />
          </ModuleErrorBoundary>
        );
      case 'CONFIGURACION':
      case 'AUDITORIA_USUARIOS':
        return (
          <ModuleErrorBoundary moduleName="Configuración & Auditoría">
            <SettingsAndUsersView />
          </ModuleErrorBoundary>
        );
      default:
        return (
          <ModuleErrorBoundary moduleName="Dashboard Principal">
            <DashboardView />
          </ModuleErrorBoundary>
        );
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-[#F1F5F9] text-[#1E293B] flex flex-col font-sans selection:bg-teal-500 selection:text-white w-full max-w-full overflow-x-hidden">
      {/* Top Navbar */}
      <Navbar onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />

      {/* Main App Container */}
      <div className="flex-1 flex overflow-hidden relative w-full max-w-full">
        {/* Left Sidebar (Desktop fixed + Mobile sliding drawer) */}
        <Sidebar
          isOpenMobile={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Dynamic Main Content Workspace with safe bottom padding for fixed mobile nav */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-5 md:p-6 lg:p-8 custom-scrollbar bg-[#F1F5F9] pb-[calc(var(--bottom-nav-height,66px)+env(safe-area-inset-bottom,0px)+10px)] md:pb-8 w-full max-w-full">
          <div className="max-w-7xl mx-auto w-full">{renderActiveView()}</div>
        </main>
      </div>

      {/* Universal Fixed Mobile Bottom Navigation Bar (< md screens) */}
      <MobileBottomNav onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />

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
