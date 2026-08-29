import React, { useState, Suspense } from 'react';
import { VetProvider, useVet } from './context/VetContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { QuickModals } from './components/QuickModals';
import { ToastNotification } from './components/ToastNotification';
import { AccessDeniedView } from './components/AccessDeniedView';
import { ModuleErrorBoundary } from './components/ModuleErrorBoundary';
import { MobileBottomNav } from './components/MobileBottomNav';
import { hasViewPermission, resolveSystemView } from './utils/rbac';
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
  Loader2,
} from 'lucide-react';

// Helper para carga diferida sin recargas forzosas del navegador
function lazyRetry<T extends React.ComponentType<any>>(componentImport: () => Promise<{ default: T }>): React.LazyExoticComponent<T> {
  return React.lazy(async () => {
    try {
      return await componentImport();
    } catch (error) {
      // Reintento suave tras breve pausa antes de fallar (sin recargar la ventana)
      try {
        await new Promise((resolve) => setTimeout(resolve, 400));
        return await componentImport();
      } catch (secondError) {
        console.error('Error al cargar módulo:', secondError);
        throw secondError;
      }
    }
  });
}

// Modals Lazy Loaded
const ClinicalCalculatorsModal = lazyRetry(() => import('./components/ClinicalCalculatorsModal').then((m) => ({ default: m.ClinicalCalculatorsModal })));
const MedicalPrintModal = lazyRetry(() => import('./components/MedicalPrintModal').then((m) => ({ default: m.MedicalPrintModal })));
const DentalChartModal = lazyRetry(() => import('./components/DentalChartModal').then((m) => ({ default: m.DentalChartModal })));
const AnatomicalBodyMapModal = lazyRetry(() => import('./components/AnatomicalBodyMapModal').then((m) => ({ default: m.AnatomicalBodyMapModal })));
const AnesthesiaChartModal = lazyRetry(() => import('./components/AnesthesiaChartModal').then((m) => ({ default: m.AnesthesiaChartModal })));
const WhatsAppHubModal = lazyRetry(() => import('./components/WhatsAppHubModal').then((m) => ({ default: m.WhatsAppHubModal })));
const ImagingAnnotatorModal = lazyRetry(() => import('./components/ImagingAnnotatorModal').then((m) => ({ default: m.ImagingAnnotatorModal })));

// Views Lazy Loaded
const DashboardView = lazyRetry(() => import('./components/DashboardView').then((m) => ({ default: m.DashboardView })));
const PatientsListView = lazyRetry(() => import('./components/PatientsListView').then((m) => ({ default: m.PatientsListView })));
const Patient360View = lazyRetry(() => import('./components/Patient360View').then((m) => ({ default: m.Patient360View })));
const OwnersView = lazyRetry(() => import('./components/OwnersView').then((m) => ({ default: m.OwnersView })));
const AppointmentsView = lazyRetry(() => import('./components/AppointmentsView').then((m) => ({ default: m.AppointmentsView })));
const VitalSignsView = lazyRetry(() => import('./components/VitalSignsView').then((m) => ({ default: m.VitalSignsView })));
const SurgeriesView = lazyRetry(() => import('./components/SurgeriesView').then((m) => ({ default: m.SurgeriesView })));
const LaboratoryView = lazyRetry(() => import('./components/LaboratoryView').then((m) => ({ default: m.LaboratoryView })));
const ImagingView = lazyRetry(() => import('./components/ImagingView').then((m) => ({ default: m.ImagingView })));
const VaccinationView = lazyRetry(() => import('./components/VaccinationView').then((m) => ({ default: m.VaccinationView })));
const InventoryView = lazyRetry(() => import('./components/InventoryView').then((m) => ({ default: m.InventoryView })));
const FinancesUnifiedView = lazyRetry(() => import('./components/FinancesUnifiedView').then((m) => ({ default: m.FinancesUnifiedView })));
const LoginView = lazyRetry(() => import('./components/LoginView').then((m) => ({ default: m.LoginView })));
const PublicLandingView = lazyRetry(() => import('./components/PublicLandingView').then((m) => ({ default: m.PublicLandingView })));
const DocumentsView = lazyRetry(() => import('./components/DocumentsView').then((m) => ({ default: m.DocumentsView })));
const PrescriptionsView = lazyRetry(() => import('./components/PrescriptionsView').then((m) => ({ default: m.PrescriptionsView })));

// Sleek iOS-style Non-Jarring Skeleton Fallback
const ViewLoadingFallback: React.FC = () => (
  <div className="space-y-4 animate-in fade-in duration-100 w-full max-w-full p-2">
    {/* Micro progress line */}
    <div className="h-1 w-full bg-slate-100/80 rounded-full overflow-hidden">
      <div className="h-full bg-teal-600/80 rounded-full w-1/3 animate-pulse" />
    </div>
    {/* Header Skeleton */}
    <div className="h-16 bg-slate-200/50 rounded-2xl w-full animate-pulse" />
    {/* KPI Cards Skeleton */}
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
      <div className="h-24 bg-slate-200/40 rounded-2xl animate-pulse" />
      <div className="h-24 bg-slate-200/40 rounded-2xl animate-pulse" />
      <div className="h-24 bg-slate-200/40 rounded-2xl animate-pulse" />
      <div className="h-24 bg-slate-200/40 rounded-2xl animate-pulse" />
    </div>
    {/* Main Content Skeleton */}
    <div className="h-64 bg-slate-200/30 rounded-3xl w-full animate-pulse" />
  </div>
);

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

  // Sincronización bidireccional de rutas y URL Hash (#app/*)
  React.useEffect(() => {
    const syncViewFromHash = () => {
      const hash = (window.location.hash || '').toLowerCase();
      if (!hash || !hash.startsWith('#app/')) return;

      const appRoute = hash.replace('#app/', '');
      if (appRoute.includes('paciente')) {
        setActiveView('PACIENTES');
      } else if (appRoute.includes('propietario') || appRoute.includes('tutor')) {
        setActiveView('PROPIETARIOS');
      } else if (appRoute.includes('agenda') || appRoute.includes('turno')) {
        setActiveView('AGENDA');
      } else if (appRoute.includes('cirugia') || appRoute.includes('quirofano')) {
        setActiveView('CIRUGIAS');
      } else if (appRoute.includes('vital') || appRoute.includes('signos')) {
        setActiveView('SIGNOS_VITALES');
      } else if (appRoute.includes('farmacia') || appRoute.includes('inventario') || appRoute.includes('stock')) {
        setActiveView('INVENTARIO');
      } else if (appRoute.includes('caja') || appRoute.includes('finanzas') || appRoute.includes('factura')) {
        setActiveView('CAJA_FACTURACION');
      } else if (appRoute.includes('documento')) {
        setActiveView('DOCUMENTOS');
      } else if (appRoute.includes('vacuna')) {
        setActiveView('VACUNAS');
      } else if (appRoute.includes('receta')) {
        setActiveView('RECETAS_OFICIALES');
      } else if (appRoute.includes('laboratorio')) {
        setActiveView('LABORATORIO');
      } else if (appRoute.includes('imagen')) {
        setActiveView('IMAGENES');
      } else if (appRoute.includes('inicio') || appRoute.includes('dashboard') || appRoute.includes('operacion')) {
        setActiveView('OPERACION');
      }
    };

    syncViewFromHash();
    window.addEventListener('hashchange', syncViewFromHash);
    return () => window.removeEventListener('hashchange', syncViewFromHash);
  }, [setActiveView]);

  // Actualizar hash en URL cuando cambia la vista sin forzar recarga
  React.useEffect(() => {
    const targetHash = `#app/${activeView.toLowerCase().replace(/_/g, '-')}`;
    if (window.location.hash !== targetHash) {
      window.history.replaceState(null, '', targetHash);
    }
  }, [activeView]);

  const activeHospitalCount = (hospitalizations || []).filter((h) => h.status === 'ACTIVA').length;
  const waitingTriageCount = (triageList || []).filter((t) => t.status === 'EN_ESPERA').length;

  const renderActiveView = () => {
    const viewKey = resolveSystemView(activeView);

    // Verificación de RBAC
    if (!hasViewPermission(currentUser?.role, viewKey)) {
      return <AccessDeniedView attemptedView={activeView} />;
    }

    switch (activeView) {
      case 'OPERACION':
      case 'DASHBOARD':
        return (
          <ModuleErrorBoundary moduleName="Panel de Control">
            <DashboardView />
          </ModuleErrorBoundary>
        );
      case 'PACIENTES':
        return (
          <ModuleErrorBoundary moduleName="Expediente Clínico & Pacientes">
            {selectedPatientId ? <Patient360View /> : <PatientsListView />}
          </ModuleErrorBoundary>
        );

      case 'PROPIETARIOS':
        return (
          <ModuleErrorBoundary moduleName="Propietarios & Tutores">
            <OwnersView />
          </ModuleErrorBoundary>
        );
      case 'INTERNACION':
      case 'SALA_ESPERA':
        return (
          <ModuleErrorBoundary moduleName="Expediente Clínico & Pacientes">
            {selectedPatientId ? <Patient360View /> : <PatientsListView />}
          </ModuleErrorBoundary>
        );
      case 'AGENDA':
        return (
          <ModuleErrorBoundary moduleName="Agenda de Turnos">
            <AppointmentsView />
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
      case 'GESTION_ECONOMICA':
      case 'ECONOMIA':
      case 'FINANZAS':
        return (
          <ModuleErrorBoundary moduleName="Administración & Finanzas Unificadas">
            <FinancesUnifiedView />
          </ModuleErrorBoundary>
        );
      case 'DOCUMENTOS':
        return (
          <ModuleErrorBoundary moduleName="Documentos & Consentimientos">
            <DocumentsView />
          </ModuleErrorBoundary>
        );
      case 'RECETAS_OFICIALES':
      case 'RECETAS':
        return (
          <ModuleErrorBoundary moduleName="Recetario Veterinario Oficial SENASA">
            <PrescriptionsView />
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
    <div className="min-h-screen min-h-[100dvh] bg-[#F1F5F9] text-[#1E293B] flex flex-col font-sans selection:bg-teal-500 selection:text-white w-full max-w-full">
      {/* Top Navbar */}
      <Navbar onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />

      {/* Main App Container */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative w-full max-w-full">
        {/* Left Sidebar */}
        <Sidebar
          isMobileMenuOpen={isMobileMenuOpen}
          onCloseMobileMenu={() => setIsMobileMenuOpen(false)}
        />

        {/* Central Dynamic Content Area */}
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto w-full relative bg-[#F8FAFC] main-content-pad p-3 sm:p-5 lg:p-6 box-border">
          <Suspense fallback={<ViewLoadingFallback />}>
            <div className="w-full">
              {renderActiveView()}
            </div>
          </Suspense>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />

      {/* Global Modals */}
      <GlobalSearchModal />
      <QuickModals />

      <Suspense fallback={null}>
        <ClinicalCalculatorsModal
          isOpen={isCalculatorsOpen}
          onClose={() => setIsCalculatorsOpen(false)}
        />

        <MedicalPrintModal
          isOpen={isPrintModalOpen}
          onClose={closePrintModal}
          data={printData}
        />

        {/* 🦷 Next-Gen Hospital Modals */}
        <DentalChartModal
          isOpen={isDentalChartOpen}
          patientId={dentalPatientId}
          onClose={closeDentalChart}
        />

        <AnatomicalBodyMapModal
          isOpen={isBodyMapOpen}
          patientId={bodyMapPatientId}
          onClose={closeBodyMap}
        />

        <AnesthesiaChartModal
          isOpen={isAnesthesiaChartOpen}
          patientId={anesthesiaPatientId}
          surgeryName={anesthesiaSurgeryName}
          onClose={closeAnesthesiaChart}
        />

        <WhatsAppHubModal
          isOpen={isWhatsAppHubOpen}
          data={whatsAppData}
          onClose={closeWhatsAppHub}
        />

        <ImagingAnnotatorModal
          isOpen={isImagingAnnotatorOpen}
          data={imagingAnnotatorData}
          onClose={closeImagingAnnotator}
        />
      </Suspense>

      {/* Toast Notifications System */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <ToastNotification
            key={toast.id}
            toast={toast}
            onDismiss={() => dismissToast(toast.id)}
          />
        ))}
      </div>
    </div>
  );
};

export const AppContent: React.FC = () => {
  const { currentUser, isAuthLoading } = useVet();
  const [authViewMode, setAuthViewMode] = useState<'LANDING' | 'LOGIN'>('LANDING');

  if (isAuthLoading) {
    return (
      <div className="min-h-screen min-h-[100dvh] bg-slate-50 p-4 sm:p-8" role="status" aria-live="polite">
        <span className="sr-only">Verificando sesión segura</span>
        <ViewLoadingFallback />
      </div>
    );
  }

  if (!currentUser) {
    if (authViewMode === 'LOGIN') {
      return (
        <Suspense fallback={<ViewLoadingFallback />}>
          <LoginView onBackToLanding={() => setAuthViewMode('LANDING')} />
        </Suspense>
      );
    }
    return (
      <Suspense fallback={<ViewLoadingFallback />}>
        <PublicLandingView
          onGoToLogin={() => setAuthViewMode('LOGIN')}
          onOpenLogin={() => setAuthViewMode('LOGIN')}
        />
      </Suspense>
    );
  }

  return <MainLayout />;
};

export default function App() {
  return (
    <VetProvider>
      <AppContent />
    </VetProvider>
  );
}
