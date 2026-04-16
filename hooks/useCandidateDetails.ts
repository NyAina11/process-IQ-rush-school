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
        onSuccess: (response: any) => {
            onUpdate();
            setIsModalOpen(false);

            // Automate document regeneration after modification
            const recordId = selectedCandidate?.id || response?.record_id || response?.id;
            if (recordId) {
                console.log('🔄 Triggering document regeneration for:', recordId);
                api.generateCerfa(recordId).catch(err => console.error("CERFA regeneration failed:", err));
                api.generateFicheRenseignement(recordId).catch(err => console.error("Fiche regeneration failed:", err));
                api.generateConventionApprentissage(recordId).catch(err => console.error("Convention regeneration failed:", err));
                api.generateCertificatScolarite(recordId).catch(err => console.error("Certificat regeneration failed:", err));
            }
        }
    });

    const { execute: deleteApi, loading: isDeleting } = useApi(api.deleteCandidate, {
        successMessage: "Étudiant supprimé avec succès.",
        onSuccess: () => {
            onUpdate();
            setIsModalOpen(false);
        }
    });

    const handleViewDetails = useCallback(async (id: string) => {
        setIsModalOpen(true);
        setIsEditing(false);
        await fetchDetails(id);
    }, [fetchDetails]);

    const handleEdit = useCallback(async (id: string) => {
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
    }, [candidates, fetchDetails]);

    const handleSaveEdit = useCallback(async () => {
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
    }, [selectedCandidate, editForm, updateApi]);

    const handleDelete = useCallback(async () => {
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
    }, [selectedCandidate, deleteApi, showToast]);

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
