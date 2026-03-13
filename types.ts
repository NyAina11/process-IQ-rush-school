import React from 'react';

export enum AppModule {
  COMMERCIAL = 'Commercial',
  ADMISSION = 'Admissions',
  RH = 'RH',
  STUDENT = 'Étudiant',
  PARAMETRES = 'Paramètres'
}

export type ViewId =
  // Commercial
  | 'commercial-dashboard'
  | 'commercial-placer'
  | 'commercial-alternance'
  // Admission
  | 'admission-main'
  | 'classe-ntc'
  // RH
  | 'rh-dashboard' // Main RH view
  | 'rh-fiche'
  | 'rh-cerfa'
  | 'rh-pec'
  | 'rh-ruptures'
  // Others
  | 'etudiant'
  | 'parametres';

export enum AdmissionTab {
  TESTS = 'tests',
  QUESTIONNAIRE = 'questionnaire', // Fiche Étudiant
  DOCUMENTS = 'documents-etudiant',
  ENTREPRISE = 'questionnaire-entreprise', // Fiche Entreprise
  ADMINISTRATIF = 'documents-generes', // Documents générés
  ENTRETIEN = 'entretien',
  PROJET_PROFESSIONNEL = 'projet-professionnel'
}

export interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  colorClass: 'blue' | 'orange' | 'green' | 'purple' | 'cyan';
  footerText?: string;
  footerIcon?: React.ReactNode;
  progress?: number;
}

// --- API & DATA TYPES ---

export interface StudentFormData {
  prenom: string;
  nom_naissance: string;
  nom_usage?: string;
  numero_inscription?: string | number;
  sexe: string;
  date_naissance: string;
  nationalite: string;
  commune_naissance: string;
  departement: string;
  adresse_residence: string;
  num_residence?: string;
  rue_residence?: string;
  complement_residence?: string;
  code_postal: string;
  ville: string;
  email: string;
  telephone: string;
  nir?: string;
  situation: string;
  regime_social?: string;
  declare_inscription_sportif_haut_niveau: boolean;
  declare_avoir_projet_creation_reprise_entreprise: boolean;
  declare_travailleur_handicape: boolean;
  alternance: boolean;
  dernier_diplome_prepare?: string;
  derniere_classe?: string;
  intitulePrecisDernierDiplome?: string;
  bac: string;
  formation_souhaitee: string;
  date_de_visite?: string;
  date_de_reglement?: string;
  entreprise_d_accueil?: string;
  connaissance_rush_how?: string;
  motivation_projet_professionnel?: string;
  agreement?: boolean;

  // Représentant légal (Champs à plat)
  nom_representant_legal?: string;
  prenom_representant_legal?: string;
  lien_parente_legal?: string;
  numero_legal?: string; // Téléphone dans votre api.ts
  numero_adress_legal?: string; // Numéro de rue
  voie_representant_legal?: string;
  complement_adresse_legal?: string;
  code_postal_legal?: string | number;
  commune_legal?: string;
  courriel_legal?: string;

  // Représentant légal 2 (Champs à plat)
  nom_representant_legal2?: string;
  prenom_representant_legal2?: string;
  lien_parente_legal2?: string;
  numero_legal2?: string;
  numero_adress_legal2?: string;
  voie_representant_legal2?: string;
  complement_adresse_legal2?: string;
  code_postal_legal2?: string | number;
  commune_legal2?: string;
  courriel_legal2?: string;

  // Structure imbriquée utilisée par le formulaire
  representant_legal_1?: {
    nom?: string;
    prenom?: string;
    lien_parente?: string;
    telephone?: string;
    numero?: string;
    voie?: string;
    complement?: string;
    code_postal?: string;
    ville?: string;
    email?: string;
  };
  representant_legal_2?: {
    nom?: string;
    prenom?: string;
    lien_parente?: string;
    telephone?: string;
    numero?: string;
    voie?: string;
    complement?: string;
    code_postal?: string;
    ville?: string;
    email?: string;
  };
}

export interface CompanyFormData {
  identification: {
    raison_sociale: string;
    siret: string;
    code_ape_naf: string;
    type_employeur: string;
    employeur_specifique: string;
    effectif: string | number;
    convention: string;
  };
  adresse: {
    num: string;
    voie: string;
    complement?: string;
    code_postal: string;
    ville: string;
    telephone: string;
    email: string;
  };
  maitre_apprentissage: {
    nom: string;
    prenom: string;
    date_naissance: string;
    fonction?: string;
    diplome?: string;
    experience?: string | number;
    telephone?: string;
    email: string;
  };
  opco: {
    nom: string;
  };

  contrat: {
    type_contrat: string;
    type_derogation?: string;
    date_debut?: string;
    date_fin?: string;
    duree_hebdomadaire?: string;
    poste_occupe?: string;
    lieu_execution?: string;

    pourcentage_smic1?: number;
    smic1?: string;
    montant_salaire_brut1?: number;

    pourcentage_smic2?: number;
    smic2?: string;
    montant_salaire_brut2?: number;

    pourcentage_smic3?: number;
    smic3?: string;
    montant_salaire_brut3?: number;

    pourcentage_smic4?: number;
    smic4?: string;
    montant_salaire_brut4?: number;

    date_conclusion?: string;
    date_debut_execution?: string;
    numero_deca_ancien_contrat?: string;

    machines_dangereuses: string;
    caisse_retraite?: string;
    date_avenant?: string;

    // Dates pour les périodes de rémunération (Frontend model)
    date_debut_2periode_1er_annee?: string;
    date_fin_2periode_1er_annee?: string;
    date_debut_1periode_2eme_annee?: string;
    date_fin_1periode_2eme_annee?: string;
    date_debut_2periode_2eme_annee?: string;
    date_fin_2periode_2eme_annee?: string;
    date_debut_1periode_3eme_annee?: string;
    date_fin_1periode_3eme_annee?: string;
    date_debut_2periode_3eme_annee?: string;
    date_fin_2periode_3eme_annee?: string;
    date_debut_1periode_4eme_annee?: string;
    date_fin_1periode_4eme_annee?: string;
    date_debut_2periode_4eme_annee?: string;
    date_fin_2periode_4eme_annee?: string;
  };
  formation: {
    choisie: string;
    date_debut: string;
    date_fin: string;
    code_rncp?: string;
    code_diplome?: string;
    nb_heures?: string | number;
    jours_cours?: string;
  };
  cfa: {
    rush_school: string;
    entreprise: string;
    denomination: string;
    diplome_vise?: string;
    intitule_formation?: string;
    uai: string;
    siret: string;
    adresse: string;
    complement?: string;
    code_postal: string;
    commune: string;
  };
  salaire: {
    salaire_age: string;
    salaire_annee: string;
    salaire_pourcentage: number;
    salaire_brut: number;
  };
  missions: {
    formation_alternant?: string;
    selectionnees: string[];
  };

  record_id_etudiant?: string;
}

export interface CompanyBackendPayload {
  identification: {
    raison_sociale: string;
    nom_entreprise: string;
    siret: string;
    code_ape_naf: string;
    type_employeur: string;
    employeur_specifique: string;
    nombre_salaries: number | null;
    code_idcc: string;
    convention_collective: string;
  };
  adresse: {
    numero: string;
    voie: string;
    nom_rue: string;
    complement: string;
    code_postal: string;
    ville: string;
    telephone: string;
    email: string;
  };
  representant_legal: {
    nom: string;
    titre: string;
    telephone_direct: string;
    email: string;
  } | null;
  maitre_apprentissage: {
    nom: string;
    prenom: string;
    date_naissance: string; // date as string
    numero_securite_sociale: string;
    fonction?: string;
    diplome_plus_eleve: string;
    niveau_diplome: string;
    annees_experience: number | null;
    telephone?: string;
    email: string;
    deja_maitre_apprentissage: string;
  };
  opco: {
    nom_opco: string;
    adresse: string;
    code_postal: string;
    ville: string;
  };
  facturation: {
    code_postal_facturation: string;
    ville_facturation: string;
    numero_bon_commande: string;
  } | null;
  contrat: {
    nature_contrat: string;
    type_contrat: string;
    type_derogation: string;
    date_debut: string; // date as string
    date_fin: string; // date as string
    nombre_mois: number | null;
    duree_hebdomadaire: string;
    poste_occupe?: string;
    lieu_execution: string;
    base_calcul_salaire: string;

    pourcentage_smic1: number | null;
    smic1: string;
    montant_salaire_brut1: number | null;

    pourcentage_smic2: number | null;
    smic2: string;
    montant_salaire_brut2: number | null;

    pourcentage_smic3: number | null;
    smic3: string;
    montant_salaire_brut3: number | null;

    pourcentage_smic4: number | null;
    smic4: string;
    montant_salaire_brut4: number | null;

    date_conclusion: string; // date as string

    date_debut_execution: string; // date as string
    numero_deca_ancien_contrat: string;
    travail_machine_dangereuse: string;
    caisse_retraite: string;
    date_avenant: string; // date as string

    // Dates pour les périodes de rémunération (Backend model)
    date_debut_2periode_1er_annee: string;
    date_fin_2periode_1er_annee: string;
    date_debut_1periode_2eme_annee: string;
    date_fin_1periode_2eme_annee: string;
    date_debut_2periode_2eme_annee: string;
    date_fin_2periode_2eme_annee: string;
    date_debut_1periode_3eme_annee: string;
    date_fin_1periode_3eme_annee: string;
    date_debut_2periode_3eme_annee: string;
    date_fin_2periode_3eme_annee: string;
    date_debut_1periode_4eme_annee: string;
    date_fin_1periode_4eme_annee: string;
    date_debut_2periode_4eme_annee: string;
    date_fin_2periode_4eme_annee: string;
  };
  formation_missions: {
    formation_alternant: string;
    mission_suggere: string;
    formation_choisie: string;
    date_debut_formation: string; // date as string
    date_fin_formation: string; // date as string
    code_rncp: string;
    code_diplome: string;
    nombre_heures_formation: number | null;
    jours_de_cours: number | null;
    cfaEnterprise: boolean | null;
    DenominationCFA: string;
    diplomeVise: string;
    intituleDiplome: string;
    NumeroUAI: string;
    NumeroSiretCFA: string;
    AdresseCFA: string;
    complementAdresseCFA: string;
    codePostalCFA: string;
    communeCFA: string;
  };
  record_id_etudiant: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  record_id?: string;
  data?: T;
  id?: string;
  detail?: any;
  entreprise_info?: {
    id: string;
    raison_sociale: string;
  };
}

// Evaluation types
export interface EvaluationData {
  studentId: string;
  studentName: string;
  formation: string;
  dateEntretien: string;
  heureEntretien: string;
  chargeAdmission: string;
  critere1: number;
  critere2: number;
  critere3: number;
  critere4: number;
  commentaires?: string;
}

export interface HistoryEntry {
  id: string;
  action: string;
  details?: string;
  date: string;
  utilisateur?: string;
  studentId?: string;
}

export interface EvaluationResponse {
  _id: string;
  studentId: string;
  studentName: string;
  formation: string;
  dateEntretien: string;
  heureEntretien: string;
  chargeAdmission: string;
  scores: {
    critere1: number;
    critere2: number;
    critere3: number;
    critere4: number;
  };
  totalScore: number;
  appreciation: string;
  commentaires: string;
  createdAt: string;
  updatedAt: string;
}