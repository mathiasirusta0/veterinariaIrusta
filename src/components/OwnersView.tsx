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
  LayoutGrid,
  List,
} from 'lucide-react';
import { useVet } from '../context/VetContext';
import { triggerHaptic } from '../utils/haptics';
import { PageHeader, EmptyState, SearchInput } from './ui';

export const OwnersView: React.FC = () => {
  const {
    owners,
    patients,
    setSelectedPatientId,
    setActivePatientTab,
    setActiveView,
    setQuickModal,
    openWhatsAppHub,
  } = useVet();

  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'CARDS' | 'TABLE'>('CARDS');

  const filteredOwners = owners.filter((o) => {
    const q = (search || '').toLowerCase();
    return (
      `${o.firstName || ''} ${o.lastName || ''}`.toLowerCase().includes(q) ||
      (o.dni || '').includes(q) ||
      (o.phone || '').includes(q) ||
      (o.email || '').toLowerCase().includes(q) ||
      (o.address || '').toLowerCase().includes(q)
    );
  });

  const handleOpenPatient = (patientId: string) => {
    triggerHaptic('medium');
    setSelectedPatientId(patientId);
    setActivePatientTab('SIGNOS');
    setActiveView('PACIENTES');
  };

  return (
    <div className="space-y-6 pb-12 w-full max-w-full">
      {/* Header */}
      <PageHeader
        category="Responsables Legales & Cuentas Corrientes"
        title="Directorio de Tutores & Propietarios"
        description="Gestión integral de clientes, cuentas corrientes, vías de WhatsApp y mascotas asociadas"
        icon={Users}
        actions={[
          {
            label: 'Nuevo Tutor',
            icon: Plus,
            onClick: () => setQuickModal('NUEVO_PROPIETARIO'),
            variant: 'primary',
          },
        ]}
      />

      {/* Search Bar & View Mode Toggle */}
      <div className="bg-white border border-slate-200 p-3 sm:p-4 rounded-2xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs w-full max-w-full">
        <div className="flex-1 w-full">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Buscar tutor por nombre, DNI/CUIT, teléfono, email, dirección..."
          />
        </div>

        <div className="hidden sm:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 flex-shrink-0">
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setViewMode('CARDS');
            }}
            className={`p-1.5 rounded-lg transition-all ${
              viewMode === 'CARDS' ? 'bg-white text-teal-700 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Vista en Tarjetas"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setViewMode('TABLE');
            }}
            className={`p-1.5 rounded-lg transition-all ${
              viewMode === 'TABLE' ? 'bg-white text-teal-700 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Vista en Tabla"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Owners Display */}
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
      ) : viewMode === 'CARDS' ? (
        /* CARDS VIEW (Mobile-optimized) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 w-full">
          {filteredOwners.map((owner) => {
            const linkedPets = patients.filter((p) => p.ownerId === owner.id);
            const isDebt = owner.balance < 0;

            return (
              <div
                key={owner.id}
                className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 space-y-4 hover:border-teal-500/50 transition-all shadow-xs flex flex-col justify-between"
              >
                <div>
                  {/* Card Top: Name, DNI, Balance */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 leading-tight">
                        {[owner.firstName, owner.lastName].filter(Boolean).join(' ') || 'Tutor Registrado'}
                      </h3>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">
                        {owner.dni?.length === 11 ? 'CUIT' : 'DNI'}: {owner.dni || 'S/D'}
                      </p>
                    </div>
                    <span
                      className={`text-[11px] font-black px-2.5 py-1 rounded-full flex-shrink-0 ${
                        isDebt
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : owner.balance > 0
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {isDebt ? `Debe $${Math.abs(owner.balance).toLocaleString('es-AR')}` : owner.balance > 0 ? `Saldo a favor $${owner.balance.toLocaleString('es-AR')}` : 'Al Día ($0)'}
                    </span>
                  </div>

                  {/* Contact info */}
                  <div className="space-y-1.5 text-xs text-slate-600 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="font-mono">{owner.phone || 'Teléfono no registrado'}</span>
                    </div>
                    {owner.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{owner.email}</span>
                      </div>
                    )}
                    {owner.address && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{owner.address}{owner.city ? `, ${owner.city}` : ''}</span>
                      </div>
                    )}
                  </div>

                  {/* Linked Pets (Bidirectional: Tutor -> Patient) */}
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-2 tracking-wider">
                      Mascotas Vinculadas ({linkedPets.length}):
                    </span>
                    {linkedPets.length === 0 ? (
                      <button
                        type="button"
                        onClick={() => setQuickModal('NUEVO_PACIENTE')}
                        className="flex items-center gap-1 text-[11px] font-bold text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100/80 px-2.5 py-1.5 rounded-xl border border-teal-200 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                        <span>+ Vincular Mascota</span>
                      </button>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {linkedPets.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => handleOpenPatient(p.id)}
                            className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 hover:bg-teal-50 rounded-xl text-xs font-bold text-slate-800 hover:text-teal-800 border border-slate-200 hover:border-teal-300 transition-all active:scale-95 touch-manipulation"
                            title={`Abrir ficha clínica de ${p.name}`}
                          >
                            <PawPrint className="w-3 h-3 text-teal-600" />
                            <span>{p.name}</span>
                            <span className="text-[10px] text-slate-400 font-normal">({p.species})</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer buttons */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  {owner.phone && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic('light');
                          openWhatsAppHub({
                            ownerName: `${owner.firstName} ${owner.lastName}`,
                            ownerPhone: owner.phone || owner.whatsapp || '',
                            type: 'CONTROL_GENERAL',
                          });
                        }}
                        className="flex-1 min-h-[40px] py-2 px-3 text-center bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 transition-all active:scale-95 flex items-center justify-center gap-1.5 touch-manipulation"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>WhatsApp</span>
                      </button>

                      <a
                        href={`tel:${owner.phone.replace(/[^0-9]/g, '')}`}
                        className="min-h-[40px] px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded-xl border border-slate-200 flex items-center justify-center gap-1 text-xs transition-all active:scale-95 touch-manipulation"
                        title="Llamar al tutor"
                      >
                        <Phone className="w-3.5 h-3.5 text-teal-600" />
                        <span className="hidden xs:inline">Llamar</span>
                      </a>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW (Desktop / Tablet) */
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs w-full">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase text-slate-500 font-bold tracking-wider">
                <tr>
                  <th className="p-3.5">Tutor & DNI</th>
                  <th className="p-3.5">Contacto</th>
                  <th className="p-3.5">Domicilio</th>
                  <th className="p-3.5">Mascotas Vinculadas</th>
                  <th className="p-3.5 text-center">Estado de Cuenta</th>
                  <th className="p-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredOwners.map((owner) => {
                  const linkedPets = patients.filter((p) => p.ownerId === owner.id);
                  const isDebt = owner.balance < 0;

                  return (
                    <tr key={owner.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5">
                        <span className="font-bold text-slate-900 block">
                          {[owner.firstName, owner.lastName].filter(Boolean).join(' ') || 'Tutor Registrado'}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {owner.dni?.length === 11 ? 'CUIT' : 'DNI'}: {owner.dni || 'S/D'}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <div className="font-mono text-slate-900">{owner.phone || 'S/D'}</div>
                        {owner.email && <div className="text-[10px] text-slate-400 truncate max-w-[160px]">{owner.email}</div>}
                      </td>

                      <td className="p-3.5 text-slate-600">
                        {owner.address ? `${owner.address}${owner.city ? `, ${owner.city}` : ''}` : 'S/D'}
                      </td>

                      <td className="p-3.5">
                        <div className="flex flex-wrap gap-1">
                          {linkedPets.map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => handleOpenPatient(p.id)}
                              className="px-2 py-0.5 bg-slate-100 hover:bg-teal-50 text-slate-800 hover:text-teal-800 rounded-lg text-[11px] font-bold transition-colors border border-slate-200"
                            >
                              🐾 {p.name}
                            </button>
                          ))}
                        </div>
                      </td>

                      <td className="p-3.5 text-center">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            isDebt
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : owner.balance > 0
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {isDebt ? `Debe $${Math.abs(owner.balance).toLocaleString('es-AR')}` : owner.balance > 0 ? `Favor $${owner.balance.toLocaleString('es-AR')}` : 'Al Día ($0)'}
                        </span>
                      </td>

                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {owner.phone && (
                            <button
                              type="button"
                              onClick={() => {
                                triggerHaptic('light');
                                openWhatsAppHub({
                                  ownerName: `${owner.firstName} ${owner.lastName}`,
                                  ownerPhone: owner.phone,
                                  type: 'CONTROL_GENERAL',
                                });
                              }}
                              className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg border border-emerald-200 transition-colors"
                              title="Enviar WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
