import { useState, useCallback } from 'react';
import { api } from '../services/api';
import { useAppStore } from '../store/useAppStore';
import { getC } from './useCandidates';
import { useApi } from './useApi';

export const useCandidateDetails = (candidates: any[], onUpdate: () => void) => {
    const { showToast } = useAppStore();
    const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<any>(null);

    // API Hooks
    const { execute: fetchDetails, loading: detailsLoading } = useApi(api.getCandidateById, {
        onSuccess: (data) => setSelectedCandidate(data),
        errorMessage: "Erreur lors de la récupération des détails"
    });

    const { execute: updateApi, loading: isSaving } = useApi(api.updateCandidate, {
        successMessage: "Candidat mis à jour avec succès",
        onSuccess: () => {
            onUpdate();
            setIsModalOpen(false);
        }
    });

    const { execute: deleteApi, loading: isDeleting } = useApi(api.deleteCandidate, {
        successMessage: "Étudiant supprimé avec succès.",
        onSuccess: () => {
            onUpdate();
            setIsModalOpen(false);
        }
    });

    const handleViewDetails = async (id: string) => {
        setIsModalOpen(true);
        setIsEditing(false);
        await fetchDetails(id);
    };

    const handleEdit = async (id: string) => {
        // Find candidate in local state first for instant pre-fill
        const localRaw = candidates.find(cand => {
            const c = getC(cand);
            return c.id === id;
        });

        if (localRaw) {
            const c = getC(localRaw);
            setSelectedCandidate(localRaw);
            setEditForm({
                prenom: c.prenom || "",
                nom_naissance: c.nom || "",
                email: c.email || "",
                telephone: c.telephone || "",
                formation_souhaitee: c.formation || "",
                ville: c.ville || "",
                entreprise_d_accueil: c.entreprise || "Non",
            });
        }

        setIsModalOpen(true);
        setIsEditing(true);
        const data = await fetchDetails(id);
        if (data) {
            const c = getC(data);
            setEditForm({
                prenom: c.prenom || "",
                nom_naissance: c.nom || "",
                email: c.email || "",
                telephone: c.telephone || "",
                formation_souhaitee: c.formation || "",
                ville: c.ville || "",
                entreprise_d_accueil: c.entreprise || "Non",
            });
        }
    };

    const handleSaveEdit = async () => {
        if (!selectedCandidate || !editForm) return;

        const userRole = localStorage.getItem('userRole') || 'admission';

        const cleanedForm = Object.keys(editForm).reduce((acc: any, key) => {
            acc[key] = editForm[key] === "" ? null : editForm[key];
            return acc;
        }, {});

        const updatedCandidate = {
            ...selectedCandidate,
            ...cleanedForm,
            informations_personnelles: {
                ...(selectedCandidate.informations_personnelles || {}),
                ...cleanedForm
            }
        };

        await updateApi(selectedCandidate.id, updatedCandidate, userRole);
    };

    const handleDelete = async () => {
        if (!selectedCandidate) return;

        const c = getC(selectedCandidate);
        const candidateId = c.id;

        if (!candidateId) {
            showToast("Erreur: ID de l'étudiant introuvable.", "error");
            return;
        }

        const confirmDelete = window.confirm(`Êtes-vous sûr de vouloir supprimer l'étudiant ${c.prenom} ${c.nom} ? Cette action est irréversible.`);
        if (!confirmDelete) return;

        await deleteApi(candidateId);
    };

    return {
        selectedCandidate,
        setSelectedCandidate,
        isModalOpen,
        setIsModalOpen,
        detailsLoading,
        isEditing,
        setIsEditing,
        editForm,
        setEditForm,
        isSaving,
        isDeleting,
        handleViewDetails,
        handleEdit,
        handleSaveEdit,
        handleDelete
    };
};
