import React, { useEffect, useMemo, useState } from 'react';
import { Building2, KeyRound, Plus, Search, Trash2, Users, X } from 'lucide-react';
import { getAuthToken } from '../services/session';

type SettingsTab = 'users' | 'integrations';
type IntegrationTypeLabel = 'Email (Gmail/SMTP)' | 'API INSEE SIREN';

type ProjectUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type IntegrationItem = {
  id: string;
  name: string;
  type: string;
  createdAt?: string;
  updatedAt?: string;
};

type InseeLookupResult = {
  integrationName: string;
  siret: string;
  raisonSociale: string;
  adresse: string;
  activitePrincipale: string;
  dateCreation: string;
};

const BASE_API_URL = (import.meta.env.VITE_BASE_API_URL || '/api').replace(/\/+$/, '');
const integrationOptions: IntegrationTypeLabel[] = ['Email (Gmail/SMTP)', 'API INSEE SIREN'];

const badgeClasses: Record<string, string> = {
  admin: 'bg-slate-900 text-white',
  super_admin: 'bg-amber-500 text-white',
  admission: 'bg-sky-100 text-sky-700',
  commercial: 'bg-emerald-100 text-emerald-700',
  rh: 'bg-fuchsia-100 text-fuchsia-700',
  eleve: 'bg-slate-100 text-slate-700',
};

const withAuthHeaders = (headers: Record<string, string> = {}): Record<string, string> => {
  const token = getAuthToken();
  if (!token) return headers;
  return {
    ...headers,
    Authorization: `Bearer ${token}`,
  };
};

const readJsonSafely = async (response: Response): Promise<any> => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

const getApiErrorMessage = (payload: any, fallback: string): string => {
  if (!payload) return fallback;
  return payload.error || payload.message || payload.detail || fallback;
};

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('users');
  const [users, setUsers] = useState<ProjectUser[]>([]);
  const [integrations, setIntegrations] = useState<IntegrationItem[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingIntegrations, setLoadingIntegrations] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [integrationName, setIntegrationName] = useState('');
  const [integrationType, setIntegrationType] = useState<IntegrationTypeLabel>('API INSEE SIREN');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');

  const [siret, setSiret] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [lookupResult, setLookupResult] = useState<InseeLookupResult | null>(null);

  const hasInseeIntegration = useMemo(
    () => integrations.some((integration) => integration.type === 'API INSEE SIREN'),
    [integrations]
  );

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await fetch(`${BASE_API_URL}/settings/users`, {
        method: 'GET',
        headers: withAuthHeaders({ Accept: 'application/json' }),
      });
      const json = await readJsonSafely(response);
      if (!response.ok) {
        throw new Error(getApiErrorMessage(json, 'Impossible de charger les utilisateurs'));
      }
      setUsers(Array.isArray(json?.data) ? json.data : []);
    } catch (error: any) {
      setPageError(error?.message || 'Impossible de charger les utilisateurs');
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadIntegrations = async () => {
    setLoadingIntegrations(true);
    try {
      const response = await fetch(`${BASE_API_URL}/settings/integrations`, {
        method: 'GET',
        headers: withAuthHeaders({ Accept: 'application/json' }),
      });
      const json = await readJsonSafely(response);
      if (!response.ok) {
        throw new Error(getApiErrorMessage(json, 'Impossible de charger les integrations'));
      }
      setIntegrations(Array.isArray(json?.data) ? json.data : []);
    } catch (error: any) {
      setPageError(error?.message || 'Impossible de charger les integrations');
    } finally {
      setLoadingIntegrations(false);
    }
  };

  useEffect(() => {
    void Promise.all([loadUsers(), loadIntegrations()]);
  }, []);

  const resetCreateForm = () => {
    setIntegrationName('');
    setIntegrationType('API INSEE SIREN');
    setApiKey('');
    setApiSecret('');
    setCreateError(null);
  };

  const handleOpenModal = () => {
    resetCreateForm();
    setIsModalOpen(true);
  };

  const handleCreateIntegration = async (event: React.FormEvent) => {
    event.preventDefault();
    setCreateError(null);
    setCreateLoading(true);

    try {
      const response = await fetch(`${BASE_API_URL}/settings/integrations`, {
        method: 'POST',
        headers: withAuthHeaders({
          'Content-Type': 'application/json',
          Accept: 'application/json',
        }),
        body: JSON.stringify({
          name: integrationName,
          type: integrationType,
          apiKey: integrationType === 'API INSEE SIREN' ? apiKey : undefined,
          apiSecret: integrationType === 'API INSEE SIREN' ? apiSecret : undefined,
        }),
      });
      const json = await readJsonSafely(response);
      if (!response.ok) {
        throw new Error(getApiErrorMessage(json, "Creation de l'integration impossible"));
      }

      await loadIntegrations();
      setIsModalOpen(false);
      resetCreateForm();
    } catch (error: any) {
      setCreateError(error?.message || "Creation de l'integration impossible");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeleteIntegration = async (integrationId: string) => {
    try {
      const response = await fetch(`${BASE_API_URL}/settings/integrations/${integrationId}`, {
        method: 'DELETE',
        headers: withAuthHeaders({ Accept: 'application/json' }),
      });
      const json = await readJsonSafely(response);
      if (!response.ok) {
        throw new Error(getApiErrorMessage(json, "Suppression de l'integration impossible"));
      }

      if (lookupResult && !integrations.some((item) => item.id !== integrationId && item.type === 'API INSEE SIREN')) {
        setLookupResult(null);
      }
      await loadIntegrations();
    } catch (error: any) {
      setPageError(error?.message || "Suppression de l'integration impossible");
    }
  };

  const handleLookup = async (event: React.FormEvent) => {
    event.preventDefault();
    setLookupLoading(true);
    setLookupError(null);
    setLookupResult(null);

    try {
      const response = await fetch(`${BASE_API_URL}/settings/insee-siren/siret/${encodeURIComponent(siret)}`, {
        method: 'GET',
        headers: withAuthHeaders({ Accept: 'application/json' }),
      });
      const json = await readJsonSafely(response);
      if (!response.ok) {
        throw new Error(getApiErrorMessage(json, 'Recherche SIRET impossible'));
      }

      setLookupResult(json?.data || null);
    } catch (error: any) {
      setLookupError(error?.message || 'Recherche SIRET impossible');
    } finally {
      setLookupLoading(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Configuration</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">Paramètres</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-500">
              Gérez les membres du projet et les intégrations externes disponibles pour ProcessIQ.
            </p>
          </div>

          {activeTab === 'integrations' && (
            <button
              type="button"
              onClick={handleOpenModal}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              <Plus size={16} />
              Créer une intégration
            </button>
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition ${
              activeTab === 'users' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Users size={16} />
            Utilisateurs
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('integrations')}
            className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition ${
              activeTab === 'integrations' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <KeyRound size={16} />
            Intégrations
          </button>
        </div>
      </section>

      {pageError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{pageError}</div>
      )}

      {activeTab === 'users' && (
        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
              <Users size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Membres du projet</h2>
              <p className="text-sm text-slate-500">Liste des utilisateurs enregistrés dans l’application.</p>
            </div>
          </div>

          {loadingUsers ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-sm text-slate-500">
              Chargement des utilisateurs...
            </div>
          ) : users.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-sm text-slate-500">
              Aucun utilisateur disponible
            </div>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {users.map((user) => (
                <article key={user.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{user.name || 'Utilisateur sans nom'}</h3>
                      <p className="mt-1 text-sm text-slate-500">{user.email}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${badgeClasses[user.role] || 'bg-slate-200 text-slate-700'}`}>
                      {user.role}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {activeTab === 'integrations' && (
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                <Building2 size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Intégrations configurées</h2>
                <p className="text-sm text-slate-500">Ajoutez vos services externes et supprimez-les si besoin.</p>
              </div>
            </div>

            {loadingIntegrations ? (
              <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-sm text-slate-500">
                Chargement des intégrations...
              </div>
            ) : integrations.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-sm text-slate-500">
                Aucune intégration disponible
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {integrations.map((integration) => (
                  <article key={integration.id} className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-5 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{integration.name}</h3>
                      <p className="mt-1 text-sm text-slate-500">{integration.type}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteIntegration(integration.id)}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-200 px-4 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
                    >
                      <Trash2 size={16} />
                      Supprimer
                    </button>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
                <Search size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Recherche INSEE Sirène</h2>
                <p className="text-sm text-slate-500">Utilise automatiquement la clé API enregistrée.</p>
              </div>
            </div>

            {!hasInseeIntegration && (
              <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                Créez d’abord une intégration de type API INSEE SIREN pour activer la recherche par SIRET.
              </div>
            )}

            <form className="mt-6 space-y-4" onSubmit={handleLookup}>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Numéro SIRET</label>
                <input
                  value={siret}
                  onChange={(event) => setSiret(event.target.value.replace(/\D/g, '').slice(0, 14))}
                  placeholder="12345678901234"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={!hasInseeIntegration || lookupLoading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                <Search size={16} />
                {lookupLoading ? 'Recherche en cours...' : 'Rechercher une entreprise'}
              </button>
            </form>

            {lookupError && (
              <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{lookupError}</div>
            )}

            {lookupResult && (
              <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">{lookupResult.integrationName}</p>
                <h3 className="mt-2 text-lg font-bold text-slate-900">{lookupResult.raisonSociale}</h3>
                <div className="mt-4 space-y-3 text-sm text-slate-600">
                  <p><span className="font-semibold text-slate-900">SIRET :</span> {lookupResult.siret}</p>
                  <p><span className="font-semibold text-slate-900">Adresse :</span> {lookupResult.adresse}</p>
                  <p><span className="font-semibold text-slate-900">Activité principale :</span> {lookupResult.activitePrincipale}</p>
                  <p><span className="font-semibold text-slate-900">Date de création :</span> {lookupResult.dateCreation}</p>
                </div>
              </div>
            )}
          </section>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-[28px] bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Nouvelle intégration</p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">Créer une intégration</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-2xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
              >
                <X size={18} />
              </button>
            </div>

            <form className="mt-6 space-y-5" onSubmit={handleCreateIntegration}>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Nom de l’intégration</label>
                <input
                  value={integrationName}
                  onChange={(event) => setIntegrationName(event.target.value)}
                  placeholder="API_INSEE_NomDeLEcole"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Type d’intégration</label>
                <select
                  value={integrationType}
                  onChange={(event) => setIntegrationType(event.target.value as IntegrationTypeLabel)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
                >
                  {integrationOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              {integrationType === 'API INSEE SIREN' && (
                <>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Client ID / Clé API</label>
                    <input
                      value={apiKey}
                      onChange={(event) => setApiKey(event.target.value)}
                      placeholder="Collez ici votre client ID INSEE"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Client Secret</label>
                    <input
                      value={apiSecret}
                      onChange={(event) => setApiSecret(event.target.value)}
                      placeholder="Collez ici votre client secret INSEE si fourni"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
                    />
                  </div>
                </>
              )}

              {createError && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{createError}</div>
              )}

              <button
                type="submit"
                disabled={createLoading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                <Plus size={16} />
                {createLoading ? 'Création en cours...' : 'Créer une intégration'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
