import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  PawPrint,
  Receipt,
  ArrowRight,
  MessageCircle,
} from 'lucide-react';
import { useVet } from '../context/VetContext';
import { PageHeader, EmptyState, SearchInput } from './ui';

export const OwnersView: React.FC = () => {
  const {
    owners,
    patients,
    selectedOwnerId,
    setSelectedOwnerId,
    setSelectedPatientId,
    setActiveView,
    setQuickModal,
    openWhatsAppHub,
  } = useVet();

  const [search, setSearch] = useState('');

  const filteredOwners = owners.filter((o) => {
    const q = (search || '').toLowerCase();
    return (
      `${o.firstName || ''} ${o.lastName || ''}`.toLowerCase().includes(q) ||
      (o.dni || '').includes(q) ||
      (o.phone || '').includes(q) ||
      (o.email || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <PageHeader
        category="Responsables Legales & Cuentas Corrientes"
        title="Directorio de Propietarios / Tutores"
        description="Gestión de clientes, cuentas corrientes, vías de WhatsApp y mascotas asociadas"
        icon={Users}
        actions={[
          {
            label: 'Nuevo Propietario',
            icon: Plus,
            onClick: () => setQuickModal('NUEVO_PROPIETARIO'),
            variant: 'primary',
          },
        ]}
      />

      {/* Search Bar */}
      <div className="bg-white border border-slate-200 p-3 sm:p-4 rounded-2xl shadow-xs">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar tutor por nombre, DNI, teléfono, email..."
        />
      </div>

      {/* Owners Grid */}
      {filteredOwners.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No se encontraron propietarios"
          description={
            search
              ? 'No hay tutores o propietarios que coincidan con la búsqueda ingresada.'
              : 'Aún no hay tutores registrados en el sistema.'
          }
          actionLabel="Registrar Nuevo Tutor"
          onAction={() => setQuickModal('NUEVO_PROPIETARIO')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredOwners.map((owner) => {
          const linkedPets = patients.filter((p) => p.ownerId === owner.id);

          return (
            <div
              key={owner.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 hover:border-teal-500/50 transition-all shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {[owner.firstName, owner.lastName].filter(Boolean).join(' ') || 'Tutor Registrado'}
                    </h3>
                    <p className="text-xs text-slate-500 font-mono">DNI: {owner.dni || 'S/D'}</p>
                  </div>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      owner.balance < 0
                        ? 'bg-red-50 text-red-600 border border-red-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    Saldo: ${owner.balance.toLocaleString('es-AR')}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{owner.phone || 'Teléfono no registrado'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{owner.email || 'Email no registrado'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{owner.address ? `${owner.address}, ${owner.city || 'Buenos Aires'}` : 'Dirección no registrada'}</span>
                  </div>
                </div>

                {/* Linked Pets */}
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-2">
                    Mascotas Vinculadas ({linkedPets.length}):
                  </span>
                  {linkedPets.length === 0 ? (
                    <button
                      onClick={() => setQuickModal('NUEVO_PACIENTE')}
                      className="flex items-center gap-1 text-[11px] font-bold text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100/80 px-2.5 py-1.5 rounded-lg border border-teal-200/80 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      <span>+ Registrar y Vincular Mascota</span>
                    </button>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {linkedPets.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => {
                            setSelectedPatientId(p.id);
                            setActiveView('PACIENTES');
                          }}
                          className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 hover:bg-slate-100 rounded-lg text-xs font-semibold text-teal-800 border border-slate-200 hover:border-teal-400 transition-colors"
                        >
                          <PawPrint className="w-3 h-3 text-teal-600" />
                          <span>{p.name || 'Paciente'} ({p.species || 'Canino'})</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() =>
                    openWhatsAppHub({
                      ownerName: `${owner.firstName} ${owner.lastName}`,
                      ownerPhone: owner.phone || owner.whatsapp || '',
                      diagnosis: 'Atención general en clínica veterinaria',
                    })
                  }
                  className="flex-1 py-2 text-center bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold rounded-lg border border-teal-200 transition-colors flex items-center justify-center gap-1.5"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-teal-600" />
                  <span>Enviar WhatsApp</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
};
