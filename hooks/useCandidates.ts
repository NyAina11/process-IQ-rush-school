import { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../services/api';
import { useApi } from './useApi';
import { useAppStore } from '../store/useAppStore';

export const getC = (c: any) => {
    const d = c.fields || c.data || c || {};
    const info = c.informations_personnelles || {};
    let alt = d.alternance || info.alternance || c.alternance;
    if (alt === true || alt === 'Oui') alt = "Oui";
    else if (alt === false || alt === 'Non') alt = "Non";
    else alt = alt || "Non";

    // Normalize enterprise info
    const raw_id_ent = c.id_entreprise || c.record_id_entreprise || d.id_entreprise || d.record_id_entreprise || d['ID Entreprise'] || d['record_id_entreprise'] || d['Entreprise'];
    const id_ent = Array.isArray(raw_id_ent) ? raw_id_ent[0] : raw_id_ent;
    const nom_ent = c.entreprise_raison_sociale || d.entreprise_raison_sociale || d['Raison sociale (from Entreprise)'] || d['Entreprise d\'accueil'] || d['Entreprise daccueil'] || info.entreprise_d_accueil || d.entreprise;

    return {
        id: c.record_id || c.id || d.id || d.record_id,
        prenom: info.prenom || d['Prénom'] || d.prenom || d.firstname || c.prenom || "",
        nom: info.nom_naissance || d['NOM de naissance'] || d.nom_naissance || d.nom || d.lastname || c.nom || "",
        email: info.email || d['E-mail'] || d.email || c.email || "",
        formation: info.formation_souhaitee || d['Formation'] || d.formation_souhaitee || d.formation || c.formation || "Non renseigné",
        ville: info.ville || d['Commune de naissance'] || d.ville || d.commune_naissance || c.ville || "Non renseigné",
        entreprise: nom_ent || "En recherche",
        telephone: info.telephone || d['Téléphone'] || d.telephone || c.telephone || "",
        sexe: info.sexe || d['Sexe'] || d.sexe || c.sexe || "",
        date_naissance: info.date_naissance || d['Date de naissance'] || d.date_naissance || c.date_naissance || "",
        numero_inscription: info.numero_inscription || d['Numero Inscription'] || d.numero_inscription || c.numero_inscription || "",
        alternance: alt,
        id_entreprise: id_ent,
        has_cerfa: c.has_cerfa || d.has_cerfa,
        has_fiche_renseignement: c.has_fiche_renseignement || d.has_fiche_renseignement,
        has_cv: c.has_cv || d.has_cv,
        has_cni: c.has_cni || d.has_cni || !!(d['CIN'] && d['CIN'].length > 0) || !!(d['cin'] && d['cin'].length > 0),
        has_lettre_motivation: d.has_lettre_motivation || c.has_lettre_motivation || !!(d['lettre de motivation'] && d['lettre de motivation'].length > 0) || !!(d['lettre'] && d['lettre'].length > 0),
        has_vitale: c.has_vitale || d.has_vitale || !!(d['Photocopie carte vitale'] && d['Photocopie carte vitale'].length > 0) || !!(d['Carte Vitale'] && d['Carte Vitale'].length > 0) || !!(d['vitale'] && d['vitale'].length > 0),
        has_diplome: d.has_diplome || c.has_diplome || !!(d['dernier diplome'] && d['dernier diplome'].length > 0) || !!(d['diplome'] && d['diplome'].length > 0),
        has_atre: c.has_atre || d.has_atre,
        has_compte_rendu: c.has_compte_rendu || d.has_compte_rendu,
        has_convention: c.has_convention || d.has_convention || !!((d['Convention Apprentissage'] || d['Convention']) && (d['Convention Apprentissage'] || d['Convention']).length > 0),
        has_livret_apprentissage: c.has_livret_apprentissage || d.has_livret_apprentissage || !!((d['livret dapprentissage'] || d['Livret Apprentissage']) && (d['livret dapprentissage'] || d['Livret Apprentissage']).length > 0),
        has_certificat_scolarite: c.has_certificat_scolarite || d.has_certificat_scolarite || !!(d['certificat de scolarité'] && d['certificat de scolarité'].length > 0),
        atre_url: c.atre_url || d.atre_url,
        atre_name: c.atre_name || d.atre_name,
        compte_rendu_url: c.compte_rendu_url || d.compte_rendu_url,
        compte_rendu_name: c.compte_rendu_name || d.compte_rendu_name,
        convention_url: c.convention_url || d.convention_url || (d['Convention Apprentissage'] || d['Convention'])?.[0]?.url || "",
        convention_name: c.convention_name || d.convention_name || (d['Convention Apprentissage'] || d['Convention'])?.[0]?.filename || "",
        livret_apprentissage_url: c.livret_apprentissage_url || d.livret_apprentissage_url || (d['livret dapprentissage'] || d['Livret Apprentissage'])?.[0]?.url || "",
        livret_apprentissage_name: c.livret_apprentissage_name || d.livret_apprentissage_name || (d['livret dapprentissage'] || d['Livret Apprentissage'])?.[0]?.filename || "",
        certificat_scolarite_url: c.certificat_scolarite_url || d.certificat_scolarite_url || d['certificat de scolarité']?.[0]?.url || "",
        certificat_scolarite_name: c.certificat_scolarite_name || d.certificat_scolarite_name || d['certificat de scolarité']?.[0]?.filename || "",
        cv_url: c.cv_url || d.cv_url || d['CV']?.[0]?.url || "",
        cv_name: c.cv_name || d.cv_name || d['CV']?.[0]?.filename || "",
        cni_url: c.cni_url || d.cni_url || (d['CIN'] || d['cin'])?.[0]?.url || "",
        cni_name: c.cni_name || d.cni_name || (d['CIN'] || d['cin'])?.[0]?.filename || "",
        diplome_url: c.diplome_url || d.diplome_url || (d['dernier diplome'] || d['diplome'])?.[0]?.url || "",
        diplome_name: c.diplome_name || d.diplome_name || (d['dernier diplome'] || d['diplome'])?.[0]?.filename || "",
        vitale_url: c.vitale_url || d.vitale_url || (d['Photocopie carte vitale'] || d['Carte Vitale'] || d['vitale'])?.[0]?.url || "",
        vitale_name: c.vitale_name || d.vitale_name || (d['Photocopie carte vitale'] || d['Carte Vitale'] || d['vitale'])?.[0]?.filename || "",
        lettre_motivation_url: c.lettre_motivation_url || d.lettre_motivation_url || (d['lettre de motivation'] || d['lettre'])?.[0]?.url || "",
        lettre_motivation_name: c.lettre_motivation_name || d.lettre_motivation_name || (d['lettre de motivation'] || d['lettre'])?.[0]?.filename || "",
        convention: c.convention || d.convention || (d['Convention Apprentissage'] || d['Convention'])?.[0] || null,
        cerfa: c.cerfa || d.cerfa || d['cerfa']?.[0] || null,
        has_interview_tracking: c.has_interview_tracking || false,
        interview_pdf_url: c.interview_pdf_url || "",
        interview_pdf_name: c.interview_pdf_name || "",
        all_interview_pdfs: c.all_interview_pdfs || [],
        has_test_results: c.has_test_results || !!(c.resultat_pdf && c.resultat_pdf.length > 0),
        test_results_url: c.test_results_url || c.resultat_pdf?.[c.resultat_pdf.length - 1]?.fields?.['PDF Résultat']?.[0]?.url || "",
        test_results_name: c.test_results_name || c.resultat_pdf?.[c.resultat_pdf.length - 1]?.fields?.['PDF Résultat']?.[0]?.filename || "",
        all_test_results_pdfs: c.all_test_results_pdfs || (c.resultat_pdf || []).flatMap((s: any) => s.fields?.['PDF Résultat'] || [])
    };
};

export const isPlaced = (c: any) => {
    const data = getC(c);
    if (!data) return false;
    
    const idEnt = data.id_entreprise;
    const ent = data.entreprise;

    const placeholders = [
        'Non', 'OUI', 'Oui', 'Non', 'En recherche', 'En cours', 'null', 'undefined',
        'Aucun', 'N/A', '', 'À définir', 'À confirmer', 'en recherche', 'En Recherche', '[]',
        'En attente', 'A voir', 'Pas d\'entreprise', 'Non renseigné', 'Pas encore', 'A définir (rentrée décalée)',
        'En cours de recherche', 'En recherche d\'entreprise', 'Pas d\'entreprise', 'cherchant', 'Recherche en cours', 'Yes'
    ];

    // Helper to check if a string looks like a real Airtable record ID
    const sId = (data.id || '').toString();
    const isRealAirtableId = (id: any): boolean => {
        if (!id || typeof id !== 'string') return false;
        const trimmed = id.trim();
        // If the ID matches the student's own ID, it's not a valid enterprise link
        if (sId && trimmed === sId) return false;
        // Airtable record IDs always start with 'rec'
        return trimmed.startsWith('rec') && trimmed.length >= 10 && !placeholders.includes(trimmed);
    };

    // 1. Check if we have a real record ID link (the most reliable signal)
    let hasValidId = false;
    if (Array.isArray(idEnt)) {
        hasValidId = idEnt.some(id => isRealAirtableId(id));
    } else {
        hasValidId = isRealAirtableId(idEnt);
    }

    if (hasValidId) return true;

    // 2. Fallback to enterprise name check (only if ID is missing or invalid)
    if (!ent || typeof ent !== 'string' || ent.trim().length === 0) return false;

    const normalizedEnt = ent.trim().toLowerCase();
    
    // 3. Special case: if entreprise name is identical to student name, it's likely a data error
    const sNom = (data.nom || '').trim().toLowerCase();
    const sPrenom = (data.prenom || '').trim().toLowerCase();
    if (sNom && sPrenom) {
        const studentName = `${sNom} ${sPrenom}`;
        const studentNameRev = `${sPrenom} ${sNom}`;
        if (normalizedEnt === studentName || normalizedEnt === studentNameRev) return false;
    }

    return !placeholders.some(p => p.toLowerCase() === normalizedEnt);
};

export const useCandidates = () => {
    const { candidates: cachedCandidates, setCandidates, lastCandidatesFetch } = useAppStore();

    const fetchApi = useCallback(() => Promise.all([
        api.getCandidatsWithDocuments(),
        api.getStudentsList(),
        api.getAllCompanies()
    ]), []);

    const mergedDataCallback = useCallback((rawData: any) => {
        const [candidatesData, fichesData, companiesData] = rawData as [any, any, any[]];
        const fichesList = Array.isArray(fichesData?.etudiants) ? fichesData.etudiants : [];
        const companiesList = Array.isArray(companiesData) ? companiesData : [];

        // Handle candidatesData being wrapped in { data: [...] } or just [...]
        const candidatesList = Array.isArray(candidatesData) ? candidatesData : (candidatesData?.data || []);

        const mergedData = Array.isArray(candidatesList) ? candidatesList.map((c: any) => {
            const d = c.fields || c;
            const candidateId = c.id || d.id || d.record_id || c.record_id;
            const fiche = fichesList.find((f: any) => f.record_id === candidateId || f.id === candidateId);

            // Find company where recordIdetudiant matches this candidate
            const company = companiesList.find((ent: any) => {
                const entFields = ent.fields || ent;
                const entStudentId = entFields.recordIdetudiant || entFields.record_id_etudiant;
                return entStudentId === candidateId || (Array.isArray(entStudentId) && entStudentId.includes(candidateId));
            });

            return {
                ...c,
                // Prioritize fiche info for real-time status, then manual join, then candidate fields
                id_entreprise: fiche?.id_entreprise || company?.id || c.id_entreprise || d.id_entreprise || d.record_id_entreprise,
                record_id_entreprise: fiche?.record_id_entreprise || company?.id || c.record_id_entreprise || d.record_id_entreprise,
                entreprise_raison_sociale: fiche?.entreprise_raison_sociale || (company?.fields || company)?.['Raison sociale'] || c.entreprise_raison_sociale || d.entreprise_raison_sociale || d['Raison sociale (from Entreprise)'],
                has_cerfa: fiche?.has_cerfa || c.has_cerfa || !!(d['cerfa'] && d['cerfa'].length > 0) || false,
                has_fiche_renseignement: fiche?.has_fiche_renseignement || c.has_fiche_renseignement || !!(d['Fiche entreprise'] && d['Fiche entreprise'].length > 0) || false,
                has_cv: fiche?.has_cv || c.has_cv || !!(d['CV'] && d['CV'].length > 0) || false,
                has_cni: !!(d['CIN'] && d['CIN'].length > 0) || !!(d['cin'] && d['cin'].length > 0) || false,
                has_lettre_motivation: !!(d['lettre de motivation'] && d['lettre de motivation'].length > 0) || !!(d['lettre'] && d['lettre'].length > 0) || false,
                has_vitale: !!(d['Photocopie carte vitale'] && d['Photocopie carte vitale'].length > 0) || !!(d['Carte Vitale'] && d['Carte Vitale'].length > 0) || !!(d['vitale'] && d['vitale'].length > 0) || false,
                has_diplome: !!(d['dernier diplome'] && d['dernier diplome'].length > 0) || !!(d['diplome'] && d['diplome'].length > 0) || false,
                has_atre: fiche?.has_atre || c.has_atre || !!(d['Atre'] && d['Atre'].length > 0) || false,
                has_compte_rendu: fiche?.has_compte_rendu || c.has_compte_rendu || !!(d['compte rendu de visite'] && d['compte rendu de visite'].length > 0) || false,
                has_convention: fiche?.has_convention || c.has_convention || !!((d['Convention Apprentissage'] || d['Convention']) && (d['Convention Apprentissage'] || d['Convention']).length > 0) || false,
                has_livret_apprentissage: fiche?.has_livret_apprentissage || c.has_livret_apprentissage || !!((d['livret dapprentissage'] || d['Livret Apprentissage']) && (d['livret dapprentissage'] || d['Livret Apprentissage']).length > 0) || false,
                has_certificat_scolarite: fiche?.has_certificat_scolarite || c.has_certificat_scolarite || !!(d['certificat de scolarité'] && d['certificat de scolarité'].length > 0) || false,
                atre_url: fiche?.atre_url || c.atre_url || d['Atre']?.[0]?.url || "",
                atre_name: fiche?.atre_name || c.atre_name || d['Atre']?.[0]?.filename || "",
                compte_rendu_url: fiche?.compte_rendu_url || c.compte_rendu_url || d['compte rendu de visite']?.[0]?.url || "",
                compte_rendu_name: fiche?.compte_rendu_name || c.compte_rendu_name || d['compte rendu de visite']?.[0]?.filename || "",
                convention_url: fiche?.convention_url || c.convention_url || (d['Convention Apprentissage'] || d['Convention'])?.[0]?.url || "",
                convention_name: fiche?.convention_name || c.convention_name || (d['Convention Apprentissage'] || d['Convention'])?.[0]?.filename || "",
                livret_apprentissage_url: fiche?.livret_apprentissage_url || c.livret_apprentissage_url || (d['livret dapprentissage'] || d['Livret Apprentissage'])?.[0]?.url || "",
                livret_apprentissage_name: fiche?.livret_apprentissage_name || c.livret_apprentissage_name || (d['livret dapprentissage'] || d['Livret Apprentissage'])?.[0]?.filename || "",
                certificat_scolarite_url: fiche?.certificat_scolarite_url || c.certificat_scolarite_url || d['certificat de scolarité']?.[0]?.url || "",
                certificat_scolarite_name: fiche?.certificat_scolarite_name || c.certificat_scolarite_name || d['certificat de scolarité']?.[0]?.filename || "",
                cv_url: c.cv_url || d['CV']?.[0]?.url || "",
                cv_name: c.cv_name || d['CV']?.[0]?.filename || "",
                cni_url: c.cni_url || (d['CIN'] || d['cin'])?.[0]?.url || "",
                cni_name: c.cni_name || (d['CIN'] || d['cin'])?.[0]?.filename || "",
                diplome_url: c.diplome_url || (d['Diplôme'] || d['diplome'])?.[0]?.url || "",
                diplome_name: c.diplome_name || (d['Diplôme'] || d['diplome'])?.[0]?.filename || "",
                vitale_url: c.vitale_url || (d['Photocopie carte vitale'] || d['Carte Vitale'] || d['vitale'])?.[0]?.url || "",
                vitale_name: c.vitale_name || (d['Photocopie carte vitale'] || d['Carte Vitale'] || d['vitale'])?.[0]?.filename || "",
                lettre_motivation_url: c.lettre_motivation_url || (d['Lettre de motivation'] || d['lettre'])?.[0]?.url || "",
                lettre_motivation_name: c.lettre_motivation_name || (d['Lettre de motivation'] || d['lettre'])?.[0]?.filename || "",
                convention: fiche?.convention || c.convention || (d['Convention Apprentissage'] || d['Convention'])?.[0] || null,
                cerfa: fiche?.cerfa || c.cerfa || d['cerfa']?.[0] || null,
                dossier_complet: fiche?.dossier_complet || false,
                // Interview tracking (from candidats-with-documents)
                has_interview_tracking: !!(c.suivie_entretien && c.suivie_entretien.length > 0),
                interview_pdf_url: c.suivie_entretien?.[c.suivie_entretien.length - 1]?.fields?.['Suivie entretien']?.[0]?.url || "",
                interview_pdf_name: c.suivie_entretien?.[c.suivie_entretien.length - 1]?.fields?.['Suivie entretien']?.[0]?.filename || "",
                all_interview_pdfs: (c.suivie_entretien || []).flatMap((s: any) => s.fields?.['Suivie entretien'] || []),
                // Test results tracking (from candidats-with-documents)
                has_test_results: !!(c.resultat_pdf && c.resultat_pdf.length > 0),
                test_results_url: c.resultat_pdf?.[c.resultat_pdf.length - 1]?.fields?.['PDF Résultat']?.[0]?.url || "",
                test_results_name: c.resultat_pdf?.[c.resultat_pdf.length - 1]?.fields?.['PDF Résultat']?.[0]?.filename || "",
                all_test_results_pdfs: (c.resultat_pdf || []).flatMap((s: any) => s.fields?.['PDF Résultat'] || [])
            };
        }) : [];
        setCandidates(mergedData);
    }, [setCandidates]);

    const apiOptions = useMemo(() => ({
        silentLoading: cachedCandidates.length > 0,
        onSuccess: mergedDataCallback
    }), [cachedCandidates.length, mergedDataCallback]);

    const { execute, loading, error } = useApi(fetchApi, apiOptions);

    useEffect(() => {
        // Fetch on mount if empty or if data is "old" (e.g. older than 5 minutes)
        const isStale = !lastCandidatesFetch || (Date.now() - lastCandidatesFetch > 5 * 60 * 1000);
        if (cachedCandidates.length === 0 || isStale) {
            execute();
        }
    }, [execute, cachedCandidates.length, lastCandidatesFetch]);

    return {
        candidates: cachedCandidates,
        loading: loading && cachedCandidates.length === 0, // Only show loading if no cache
        error,
        refresh: execute
    };
};
