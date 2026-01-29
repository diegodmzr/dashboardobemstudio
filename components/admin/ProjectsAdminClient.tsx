"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Topbar from "@/components/Topbar";
import ProjectModal, { ProjectFormData } from "./ProjectModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import StepConfirmModal from "./StepConfirmModal";
import StepProgressBar from "./StepProgressBar";
import Toast from "@/components/Toast";
import { useToast } from "@/hooks/useToast";
import { useDebounce } from "@/hooks/useDebounce";

export type AdminProject = {
  id: string;
  name: string;
  clientId: string;
  clientName: string;
  status: string;
  progress: number;
  amount: number;
  type: string | null;
  technology: string | null;
  paymentType: string | null;
  deadline: string | null;
  cpp: number | null;
  commission: number | null;
  attributes: string[];
  level: string | null;
  createdAt: string;
  progressConfig?: string | null;
  formSubmissionId?: string | null;
  formSubmissionTitle?: string | null;
};

type Props = {
  projects: AdminProject[];
};

const statusOptions = ["Brief", "Design", "Dev", "Tests", "Livré"];
const typeOptions = ["E-commerce", "Vitrine", "Landing page"];

export default function ProjectsAdminClient({ projects }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { toasts, removeToast, success, error } = useToast();

  // URL Params State
  const currentSearch = searchParams.get("search") || "";
  const currentStatus = searchParams.get("status") || "";
  const currentType = searchParams.get("type") || "";
  const currentClientId = searchParams.get("clientId") || "";

  // Local state for search input to avoid lagging
  const [searchTerm, setSearchTerm] = useState(currentSearch);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Modals state
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingProject, setEditingProject] = useState<AdminProject | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteProject, setDeleteProject] = useState<AdminProject | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState<string>("created_desc");

  // Step transition state
  const [stepTransition, setStepTransition] = useState<{
    project: AdminProject;
    direction: "next" | "previous";
    targetStep: string;
  } | null>(null);
  const [stepLoading, setStepLoading] = useState(false);

  // Unique clients for filter
  const uniqueClients = Array.from(new Set(projects.map(p => JSON.stringify({ id: p.clientId, name: p.clientName }))))
    .map(s => JSON.parse(s))
    .sort((a, b) => a.name.localeCompare(b.name));

  const clientOptions = uniqueClients.map(c => c.name);

  // Sync local search with URL
  useEffect(() => {
    setSearchTerm(currentSearch);

    // Check for action param
    const action = searchParams.get("action");
    if (action === "create") {
      setShowCreateModal(true);
    }
  }, [currentSearch, searchParams]);

  const createQueryString = useCallback(
    (name: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams]
  );

  // Debounced search update
  useEffect(() => {
    if (debouncedSearchTerm !== currentSearch) {
      router.push(pathname + "?" + createQueryString("search", debouncedSearchTerm));
    }
  }, [debouncedSearchTerm, currentSearch, router, pathname, createQueryString]);

  const handleFilterChange = (key: string, value: string | null) => {
    // If filtering by client name, find the ID usually, but here we might just filter by name or ID?
    // Let's stick to ID if possible, but FilterPill usually takes strings. 
    // Wait, the FilterPill is generic. Let's make a specific select for keys that need IDs vs names.
    // For simplicity, let's just pass the value directly.

    // Special handling if using the generic FilterPill with names but we need IDs:
    // Actually, let's create a ClientFilterPill or adapt logic.
    // For now, let's simplify: FilterPill returns the value selected.
    // If it is client, we can match the name back to ID or just filter by clientName if easier for display.
    // Ideally we filter by ID. Let's assume FilterPill for client returns ID.

    router.push(pathname + "?" + createQueryString(key, value));
  };

  const resetFilters = () => {
    router.push(pathname);
    setSearchTerm("");
  };

  const getSortedProjects = () => {
    let sorted = [...projects];

    // Filter by Client ID if present
    if (currentClientId) {
      sorted = sorted.filter(p => p.clientId === currentClientId);
    }

    switch (sortOrder) {
      case "created_desc":
        return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case "created_asc":
        return sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      case "amount_desc":
        return sorted.sort((a, b) => b.amount - a.amount);
      case "amount_asc":
        return sorted.sort((a, b) => a.amount - b.amount);
      case "progress_desc":
        return sorted.sort((a, b) => b.progress - a.progress);
      case "progress_asc":
        return sorted.sort((a, b) => a.progress - b.progress);
      case "deadline_asc":
        return sorted.sort((a, b) => {
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        });
      default:
        return sorted;
    }
  };

  const sortedProjects = getSortedProjects();
  const selected = projects.find((p) => p.id === selectedId) ?? null;

  const handleCreate = async (data: ProjectFormData) => {
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      success("Projet créé avec succès !");
      setShowCreateModal(false);
      router.refresh();
    } catch (err: any) {
      error(err.message);
    }
  };

  const handleUpdate = async (data: ProjectFormData) => {
    if (!editingProject) return;
    try {
      const res = await fetch(`/api/projects/${editingProject.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      success("Projet mis à jour !");
      setEditingProject(null);
      router.refresh();
    } catch (err: any) {
      error(err.message);
    }
  };

  const handleDelete = async () => {
    if (!deleteProject) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/projects/${deleteProject.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error);
      success("Projet supprimé !");
      setDeleteProject(null);
      router.refresh();
    } catch (err: any) {
      error(err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const getNextStep = (currentStep: string, config?: string | null): string | null => {
    let steps = ["Brief", "Design", "Dev", "Tests", "Livré"];
    if (config) {
      try {
        const parsed = typeof config === 'string' ? JSON.parse(config) : config;
        if (parsed.steps && Array.isArray(parsed.steps)) steps = parsed.steps.map((s: any) => s.key || s.label);
      } catch (e) { }
    }
    const idx = steps.indexOf(currentStep);
    if (idx === -1) return steps.length > 1 ? steps[1] : null;
    return idx < steps.length - 1 ? steps[idx + 1] : null;
  };

  const getPreviousStep = (currentStep: string, config?: string | null): string | null => {
    let steps = ["Brief", "Design", "Dev", "Tests", "Livré"];
    if (config) {
      try {
        const parsed = typeof config === 'string' ? JSON.parse(config) : config;
        if (parsed.steps && Array.isArray(parsed.steps)) steps = parsed.steps.map((s: any) => s.key || s.label);
      } catch (e) { }
    }
    const idx = steps.indexOf(currentStep);
    return idx > 0 ? steps[idx - 1] : null;
  };

  const handleStepNavigation = (project: AdminProject, direction: "next" | "previous") => {
    const targetStep = direction === "next"
      ? getNextStep(project.status, project.progressConfig)
      : getPreviousStep(project.status, project.progressConfig);
    if (targetStep) setStepTransition({ project, direction, targetStep });
  };

  const confirmStepTransition = async () => {
    if (!stepTransition) return;
    setStepLoading(true);
    try {
      const res = await fetch(`/api/projects/${stepTransition.project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: stepTransition.targetStep }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      success(`Étape mise à jour : ${stepTransition.targetStep}`);
      setStepTransition(null);
      router.refresh();
    } catch (err: any) {
      error(err.message);
    } finally {
      setStepLoading(false);
    }
  };

  return (
    <>
      {/* ... keeping topbar ... */}
      <Topbar
        title="Projets (Admin)"
        rightContent={
          <div className="flex w-full md:w-auto flex-col md:flex-row items-center gap-3">
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher..."
              className="h-11 w-full md:w-64 rounded-full border border-[#e0e0e0] px-4 text-sm outline-none transition focus:border-[#2f2f2f] focus:ring-2 focus:ring-[#2f2f2f]/20 dark:bg-[#1a1a1a] dark:border-[#333] dark:text-white dark:focus:border-white"
            />
            <button
              onClick={() => setShowCreateModal(true)}
              className="w-full md:w-auto cursor-pointer rounded-full bg-black px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
            >
              + Nouveau projet
            </button>
          </div>
        }
      />

      <main className="flex-1 px-4 md:px-8 py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-2">
            <FilterPill
              label="Statut"
              value={currentStatus || null}
              options={statusOptions}
              onSelect={(val) => handleFilterChange("status", val)}
            />
            <FilterPill
              label="Type"
              value={currentType || null}
              options={typeOptions}
              onSelect={(val) => handleFilterChange("type", val)}
            />
            {/* Client Filter */}
            <div className="flex items-center">
              <div className="relative">
                <select
                  value={currentClientId || ""}
                  onChange={(e) => handleFilterChange("clientId", e.target.value || null)}
                  className="cursor-pointer appearance-none rounded-xl border border-[#e0e0e0] bg-white pl-4 pr-10 py-2.5 text-sm font-semibold text-[#4a4a4a] outline-none transition hover:border-[#b0b0b0] focus:border-[#2f2f2f] focus:ring-2 focus:ring-[#2f2f2f]/10 dark:bg-[#1a1a1a] dark:border-[#333] dark:text-white dark:focus:border-white"
                >
                  <option value="">Client: Tous</option>
                  {uniqueClients.map((client) => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#6a6a6a]">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Reset Button */}
            {(currentStatus || currentType || currentClientId || currentSearch) && (
              <button
                onClick={resetFilters}
                className="ml-2 text-xs font-semibold text-rose-500 hover:text-rose-600 transition"
              >
                Réinitialiser
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-[#6a6a6a] dark:text-gray-400">Trier par:</span>
            <div className="relative">
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="cursor-pointer appearance-none rounded-xl border border-[#e0e0e0] bg-white pl-4 pr-10 py-2.5 text-sm font-semibold text-[#2f2f2f] outline-none transition focus:border-[#2f2f2f] focus:ring-2 focus:ring-[#2f2f2f]/10 dark:bg-[#1a1a1a] dark:border-[#333] dark:text-white dark:focus:border-white"
              >
                <option value="created_desc">Plus récent</option>
                <option value="created_asc">Plus ancien</option>
                <option value="amount_desc">Montant (Décroissant)</option>
                <option value="amount_asc">Montant (Croissant)</option>
                <option value="progress_desc">Progression (Avancé)</option>
                <option value="progress_asc">Progression (Début)</option>
                <option value="deadline_asc">Proche Échéance</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#6a6a6a]">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {sortedProjects.length === 0 ? (
          <div className="mt-20 flex flex-col items-center justify-center">
            <div className="mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-[#f8f6fb] to-[#ece7ef] dark:from-[#333] dark:to-[#222]">
              <svg className="h-16 w-16 text-[#8b7aa8] dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-bold text-[#2f2f2f] dark:text-white">Aucun projet trouvé</h3>
            <p className="mb-6 text-sm text-[#6a6a6a] dark:text-gray-400">
              {currentSearch || currentStatus || currentType ? "Essayez de modifier vos filtres" : "Commencez par créer votre premier projet"}
            </p>
            {!currentSearch && !currentStatus && !currentType && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="cursor-pointer rounded-full bg-black px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
              >
                + Créer un projet
              </button>
            )}
          </div>
        ) : (
          <div className="mt-5 grid gap-4">
            {sortedProjects.map((p) => (
              <article
                key={p.id}
                onClick={() => setSelectedId(p.id)}
                className="group relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4 rounded-2xl border border-[#ece7ef] bg-[#f8f6fb] p-4 shadow-[0_2px_6px_rgba(0,0,0,0.04)] transition hover:-translate-y-1 hover:shadow-[0_8px_16px_rgba(0,0,0,0.08)] cursor-pointer dark:bg-[#1a1a1a] dark:border-[#333] dark:hover:bg-[#222]"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-semibold text-[#2f2f2f] dark:text-white">{p.name}</h2>
                    {p.type && (
                      <span className="rounded-full bg-[#e0e0e0] px-2 py-0.5 text-xs font-semibold text-[#2f2f2f] dark:bg-[#333] dark:text-white">{p.type}</span>
                    )}
                  </div>
                  <p className="text-sm text-[#6a6a6a] dark:text-gray-400">{p.clientName}</p>
                  <div className="flex items-center gap-2 text-xs text-[#8a8a8a] dark:text-gray-500">
                    <span>{p.status}</span>
                    <span>•</span>
                    <span>{p.amount.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}</span>
                    <span>•</span>
                    <span>{new Date(p.createdAt).toLocaleDateString("fr-FR")}</span>
                  </div>
                </div>

                <div className="flex w-full md:w-auto items-center justify-between md:justify-end gap-3 mt-2 md:mt-0">
                  <StepProgressBar currentStatus={p.status} size="small" showTooltips={true} />
                  <div className="flex items-center gap-1 opacity-100 md:opacity-0 transition md:group-hover:opacity-100">
                    <button
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e0e0e0] bg-white text-[#4a4a4a] transition hover:bg-gray-50 hover:text-black dark:bg-[#333] dark:border-[#444] dark:text-white dark:hover:bg-[#444]"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingProject(p);
                      }}
                      title="Modifier"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                      </svg>
                    </button>
                    <button
                      className="cursor-pointer flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 transition hover:bg-gray-50 hover:text-red-500 hover:border-red-200 dark:bg-[#333] dark:border-[#444] dark:text-white dark:hover:bg-[#444]"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteProject(p);
                      }}
                      title="Supprimer"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {selected && (
        <EnhancedProjectModal
          project={selected}
          onClose={() => setSelectedId(null)}
          onStepNavigation={handleStepNavigation}
          getNextStep={getNextStep}
          getPreviousStep={getPreviousStep}
        />
      )}
      {showCreateModal && (
        <ProjectModal onClose={() => setShowCreateModal(false)} onSave={handleCreate} />
      )}
      {editingProject && (
        <ProjectModal project={editingProject} onClose={() => setEditingProject(null)} onSave={handleUpdate} />
      )}
      {deleteProject && (
        <DeleteConfirmModal projectName={deleteProject.name} onConfirm={handleDelete} onCancel={() => setDeleteProject(null)} loading={deleteLoading} />
      )}
      {stepTransition && (
        <StepConfirmModal
          direction={stepTransition.direction}
          currentStep={stepTransition.project.status}
          targetStep={stepTransition.targetStep}
          projectName={stepTransition.project.name}
          onConfirm={confirmStepTransition}
          onCancel={() => setStepTransition(null)}
          loading={stepLoading}
        />
      )}
    </>
  );
}

const FilterPill = ({ label, value, options, onSelect }: { label: string; value: string | null; options: string[]; onSelect: (val: string | null) => void; }) => (
  <div className="flex items-center">
    <div className="relative">
      <select
        value={value ?? ""}
        onChange={(e) => onSelect(e.target.value || null)}
        className="cursor-pointer appearance-none rounded-xl border border-[#e0e0e0] bg-white pl-4 pr-10 py-2.5 text-sm font-semibold text-[#4a4a4a] outline-none transition hover:border-[#b0b0b0] focus:border-[#2f2f2f] focus:ring-2 focus:ring-[#2f2f2f]/10 dark:bg-[#1a1a1a] dark:border-[#333] dark:text-white dark:focus:border-white"
      >
        <option value="">{label}: Tous</option>
        {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#6a6a6a]">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  </div>
);

const EnhancedProjectModal = ({ project, onClose, onStepNavigation, getNextStep, getPreviousStep }: any) => {
  const benefit = project.commission ? project.amount * (project.commission / 100) : 0;
  const netAmount = project.amount - benefit;
  const formatCurrency = (amount: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(amount);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn" onClick={onClose}>
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 md:p-8 shadow-2xl animate-scaleIn dark:bg-[#111]" onClick={(e) => e.stopPropagation()}>
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#2f2f2f] mb-1 dark:text-white">{project.name}</h2>
            <p className="text-sm text-[#6a6a6a] dark:text-gray-400">Client: {project.clientName}</p>
          </div>
          <button onClick={onClose} className="cursor-pointer h-10 w-10 flex items-center justify-center rounded-full bg-[#f5f5f5] text-lg font-semibold text-[#2f2f2f] hover:bg-[#e0e0e0] dark:bg-[#333] dark:text-white dark:hover:bg-[#444]">✕</button>
        </div>
        <div className="mb-6 rounded-2xl border border-[#e0e0e0] bg-[#f5f5f5] p-6 dark:bg-[#1a1a1a] dark:border-[#333]">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-[#4a4a4a] dark:text-gray-400">Progression</h3>
          <div className="flex justify-center"><StepProgressBar currentStatus={project.status} size="large" showTooltips={true} /></div>
        </div>

        {/* Linked Brief Action */}
        {project.formSubmissionId && (
          <div className="mb-6 flex items-center justify-between rounded-xl bg-blue-50 px-4 py-3 dark:bg-blue-900/20">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Relié au formulaire : {project.formSubmissionTitle || "Brief"}
              </span>
            </div>
            <a
              href={`/dashboard/forms?view=submission&id=${project.formSubmissionId}`}
              target="_blank"
              className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition"
            >
              Voir le brief
            </a>
          </div>
        )}

        <div className="space-y-4">
          <div className="rounded-2xl border border-[#e0e0e0] bg-white p-6 dark:bg-[#1a1a1a] dark:border-[#333]">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-[#4a4a4a] dark:text-gray-400">Détails</h3>
            <div className="space-y-2 dark:text-gray-200">
              <p className="text-sm"><span className="font-semibold">Type:</span> {project.type || "-"}</p>
              <p className="text-sm"><span className="font-semibold">Tech:</span> {project.technology || "-"}</p>
              <p className="text-sm"><span className="font-semibold">Difficulté:</span> {project.level || "-"}</p>
              <p className="text-sm"><span className="font-semibold">Montant:</span> {formatCurrency(project.amount)}</p>

              {/* Financial Breakdown */}
              {project.commission ? (
                <div className="mt-2 rounded-xl bg-gray-50 p-3 text-sm dark:bg-[#222]">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Commission ({project.commission}%):</span>
                    <span>{formatCurrency(benefit)}</span>
                  </div>
                  <div className="mt-1 flex justify-between font-semibold">
                    <span>Net:</span>
                    <span>{formatCurrency(netAmount)}</span>
                  </div>
                </div>
              ) : null}

              {/* Attributes (Tags) */}
              {project.attributes && project.attributes.length > 0 && (
                <div className="mt-3">
                  <span className="block mb-1 text-xs font-semibold text-gray-500 uppercase">Attributs</span>
                  <div className="flex flex-wrap gap-1">
                    {project.attributes.map((attr: string, i: number) => (
                      <span key={i} className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700 border border-gray-200 dark:bg-[#333] dark:text-gray-200 dark:border-[#444]">
                        {attr}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4 border-t border-gray-100 pt-3 text-xs text-gray-500 dark:border-[#333]">
                <p>Créé le {new Date(project.createdAt).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" })}</p>
              </div>
            </div>
          </div>
          <div className="flex justify-center gap-3">
            <button onClick={() => onStepNavigation(project, "previous")} disabled={!getPreviousStep(project.status, project.progressConfig)} className="cursor-pointer rounded-full border-2 border-[#2f2f2f] px-6 py-2 text-sm font-semibold disabled:opacity-50 dark:border-white dark:text-white">← Préc.</button>
            <button onClick={() => onStepNavigation(project, "next")} disabled={!getNextStep(project.status, project.progressConfig)} className="cursor-pointer rounded-full bg-black text-white px-6 py-2 text-sm font-semibold disabled:opacity-50 dark:bg-white dark:text-black">Suiv. →</button>
          </div>
        </div>
      </div>
    </div>
  );
};
