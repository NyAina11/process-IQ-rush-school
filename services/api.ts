import { StudentFormData, CompanyFormData, ApiResponse } from '../types';
import {
  decodeJwtPayload,
  getAuthEmail,
  getAuthStudentId,
  getAuthToken,
  getCurrentStudentId as getStoredStudentId,
  setCurrentStudentId,
} from './session';
import { decimalToTime, timeToDecimal } from '../utils/formatters';

const BASE_API_URL = (import.meta.env.VITE_BASE_API_URL || '/api').replace(/\/+$/, '');
const AUTH_API_URL = `${BASE_API_URL}/auth`;
const BASE_URL = `${BASE_API_URL}/admission`;
const SUPPORT_URL = `${BASE_API_URL}/support`;
const inFlightJsonRequests = new Map<string, Promise<any>>();

const dedupeJsonRequest = <T>(key: string, loader: () => Promise<T>): Promise<T> => {
  const existingRequest = inFlightJsonRequests.get(key);
  if (existingRequest) {
    return existingRequest as Promise<T>;
  }

  const request = loader().finally(() => {
    inFlightJsonRequests.delete(key);
  });

  inFlightJsonRequests.set(key, request);
  return request;
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

// Helper to format string (remove underscores, capitalize)
const formatString = (str: string) => {
  if (!str) return "";
  // Replace underscores with spaces and capitalize first letter
  return str.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase());
};


// Helper to safely access nested fields from Airtable-style response
const getField = (data: any, fieldName: string, defaultValue: any = "") => {
  if (!data || !data.fields) return defaultValue;
  return data.fields[fieldName] ?? defaultValue;
};

const getRecordId = (data: any): string => data?.id || data?.record_id || data?._id || "";

const getRecordFields = (data: any): Record<string, any> => {
  if (!data || typeof data !== 'object') return {};
  if (data.fields && typeof data.fields === 'object') return data.fields;
  if (data.informations_personnelles && typeof data.informations_personnelles === 'object') {
    return data.informations_personnelles;
  }
  return data;
};

const looksLikeBackendRecord = (data: any): boolean => {
  if (!data || typeof data !== 'object') return false;
  return !!(data.fields || data.informations_personnelles || data.id || data.record_id);
};

const normalizeValidationStatus = (value: any): string => {
  const raw = String(value || '').trim().toLowerCase();
  if (raw === 'validé' || raw === 'valide' || raw === 'approved') return 'Validé';
  return 'En attente';
};

// Mapper: Backend (Airtable fields) -> Frontend (StudentFormData)
const mapBackendToStudent = (backendData: any): any => {
  const fields = getRecordFields(backendData);
  const recordId = getRecordId(backendData);

  return {
    // Meta
    id: recordId,
    record_id: recordId,
    fields: fields, // Maintain raw fields for modal view modes

    // Enterprise Link (Critical for Dashboard)
    id_entreprise: Array.isArray(fields["Entreprise"]) ? fields["Entreprise"][0] : (fields["Entreprise"] || fields["ID Entreprise"] || fields["record_id_entreprise"] || ""),
    entreprise_raison_sociale: fields["Entreprise d'accueil"] || fields["Raison sociale (from Entreprise)"] || fields["Nom Entreprise"] || fields["Entreprise"] || "",


    // Identité
    prenom: fields["Prénom"] || fields["prenom"] || "",
    nom_naissance: fields["NOM de naissance"] || fields["nom_naissance"] || fields["nom"] || "",
    nom_usage: fields["Nom d'usage"] || fields["nom_usage"] || "",
    numero_inscription: fields["Numero Inscription"] || fields["numero_inscription"] || "",
    sexe: fields["Sexe"] || fields["sexe"] || "",
    date_naissance: fields["Date de naissance"] || fields["date_naissance"] || "",
    nationalite: fields["Nationalité"] || fields["nationalite"] || "Française",
    commune_naissance: fields["Commune de naissance"] || fields["commune_naissance"] || "",
    departement:
      fields["Département de naissance"] ||
      fields["Département"] ||
      fields["departement"] ||
      "",

    // Coordonnées
    email: fields["E-mail"] || fields["email"] || "",
    telephone: fields["Téléphone"] || fields["telephone"] || "",
    adresse_residence: fields["Adresse de résidence"] || fields["adresse_residence"] || "",
    num_residence: (fields["Adresse de résidence"] || "").includes(", ") ? (fields["Adresse de résidence"] || "").split(", ")[0] : (fields["num_residence"] || ""),
    rue_residence: (fields["Adresse de résidence"] || "").includes(", ") ? (fields["Adresse de résidence"] || "").split(", ")[1] : (fields["rue_residence"] || ""),
    complement_residence: fields["Complément d'adresse"] || fields["complement_residence"] || "",
    code_postal: fields["Code postal"]?.toString() || fields["Code postal "]?.toString() || fields["code_postal"]?.toString() || "",
    ville: fields["Ville de résidence"] || fields["ville"] || "",

    // Social / Admin
    nir: fields["NIR"] || fields["nir"] || "",
    situation: fields["Situation avant le contrat"] || fields["situation"] || "",
    regime_social: fields["Régime social"] || fields["regime_social"] || "",
    declare_inscription_sportif_haut_niveau: fields["Sportif de haut niveau"] || fields["declare_inscription_sportif_haut_niveau"] || false,
    declare_avoir_projet_creation_reprise_entreprise: fields["Projet de création/reprise d'entreprise"] || fields["declare_avoir_projet_creation_reprise_entreprise"] || false,
    declare_travailleur_handicape: fields["Reconnaissance travailleur handicapé"] || fields["declare_travailleur_handicape"] || false,
    alternance: fields["En alternance"] || fields["alternance"] || false,

    // Scolarité
    dernier_diplome_prepare: fields["Dernier diplôme ou titre préparé"] || fields["dernier_diplome_prepare"] || "",
    derniere_classe: fields["Dernière classe suivie"] || fields["Dernière classe / année suivie"] || fields["derniere_classe"] || "",
    bac: fields["Diplôme ou titre le plus élevé obtenu"] || fields["BAC"] || fields["bac"] || "",
    intitulePrecisDernierDiplome: fields["Intitulé précis du dernier diplôme"] || fields["Intitulé précis du dernier diplôme ou titre préparé"] || fields["intitulePrecisDernierDiplome"] || "",
    formation_souhaitee: fields["Formation souhaitée"] || fields["Formation"] || fields["formation_souhaitee"] || "",

    // Autres
    date_de_visite: fields["Date de visite"] || fields["date_de_visite"] || "",
    date_de_reglement: fields["Date de règlement"] || fields["date_de_reglement"] || "",
    entreprise_d_accueil: fields["Entreprise d'accueil"] || fields["entreprise_d_accueil"] || "",
    connaissance_rush_how: fields["Comment avez-vous connu Rush School?"] || fields["connaissance_rush_how"] || "",
    motivation_projet_professionnel: fields["Motivation et projet professionnel"] || fields["motivation_projet_professionnel"] || "",
    validation: normalizeValidationStatus(fields["Validation"] || fields["validation"] || backendData?.Validation || backendData?.validation),

    // Représentant Légal 1
    nom_representant_legal: fields["Nom du représentant légal"] || fields["nom_representant_legal"] || "",
    prenom_representant_legal: fields["Prénom du représentant légal"] || fields["prenom_representant_legal"] || "",
    voie_representant_legal: fields["Voie du représentant légal"] || fields["voie_representant_legal"] || "",
    lien_parente_legal: fields["Lien de parenté"] || fields["lien_parente_legal"] || "",
    numero_legal: fields["Numéro du représentant légal"] || fields["numero_legal"] || "", // Téléphone
    numero_adress_legal: fields["Numéro adresse représentant légal"] || fields["numero_adress_legal"] || "",
    complement_adresse_legal: fields["Complément d'adresse du représentant légal"] || fields["complement_adresse_legal"] || "",
    code_postal_legal: fields["Code postal du représentant légal"]?.toString() || fields["code_postal_legal"]?.toString() || "",
    commune_legal: fields["Commune du représentant légal"] || fields["commune_legal"] || "",
    courriel_legal: fields["Email du représentant légal"] || fields["courriel_legal"] || "",

    // Représentant Légal 2
    nom_representant_legal2: fields["Nom du deuxième représentant légal"] || fields["nom_representant_legal2"] || "",
    prenom_representant_legal2: fields["Prénom du deuxième représentant légal"] || fields["prenom_representant_legal2"] || "",
    voie_representant_legal2: fields["Voie du deuxième représentant légal"] || fields["voie_representant_legal2"] || "",
    lien_parente_legal2: fields["Lien de parenté avec le deuxième représentant légal"] || fields["lien_parente_legal2"] || "",
    numero_legal2: fields["Numéro du deuxième représentant légal"] || fields["numero_legal2"] || "",
    numero_adress_legal2: fields["Numéro adresse représentant légal 2"] || fields["numero_adress_legal2"] || "",
    complement_adresse_legal2: fields["Complément d'adresse du deuxième représentant légal"] || fields["complement_adresse_legal2"] || "",
    code_postal_legal2: fields["Code postal du deuxième représentant légal"]?.toString() || fields["code_postal_legal2"]?.toString() || "",
    commune_legal2: fields["Commune du deuxième représentant légal"] || fields["commune_legal2"] || "",
    courriel_legal2: fields["Email du deuxième représentant légal"] || fields["courriel_legal2"] || "",

    // Documents (PDF generated)
    atre_url: fields["Atre"]?.[0]?.url || "",
    atre_name: fields["Atre"]?.[0]?.filename || "",
    has_atre: !!(fields["Atre"] && fields["Atre"].length > 0),

    compte_rendu_url: fields["compte rendu de visite"]?.[0]?.url || "",
    compte_rendu_name: fields["compte rendu de visite"]?.[0]?.filename || "",
    has_compte_rendu: !!(fields["compte rendu de visite"] && fields["compte rendu de visite"].length > 0),

    convention_url: fields["Convention Apprentissage"]?.[0]?.url || fields["Convention"]?.[0]?.url || "",
    convention_name: fields["Convention Apprentissage"]?.[0]?.filename || fields["Convention"]?.[0]?.filename || "",
    has_convention: !!((fields["Convention Apprentissage"] || fields["Convention"]) && (fields["Convention Apprentissage"] || fields["Convention"]).length > 0),
    convention: (fields["Convention Apprentissage"] || fields["Convention"])?.[0] || null,
    cerfa: fields["cerfa"]?.[0] || null,
    has_cerfa: !!(fields["cerfa"] && fields["cerfa"].length > 0),
    fiche_entreprise: fields["Fiche entreprise"]?.[0] || null,
    has_fiche_renseignement: !!(fields["Fiche entreprise"] && fields["Fiche entreprise"].length > 0),
    livret_apprentissage_url: (fields["livret dapprentissage"] || fields["Livret Apprentissage"])?.[0]?.url || "",
    livret_apprentissage_name: (fields["livret dapprentissage"] || fields["Livret Apprentissage"])?.[0]?.filename || "",
    has_livret_apprentissage: !!((fields["livret dapprentissage"] && fields["livret dapprentissage"].length > 0) || (fields["Livret Apprentissage"] && fields["Livret Apprentissage"].length > 0)),

    certificat_scolarite_url: fields["certificat de scolarité"]?.[0]?.url || "",
    certificat_scolarite_name: fields["certificat de scolarité"]?.[0]?.filename || "",
    has_certificat_scolarite: !!(fields["certificat de scolarité"] && fields["certificat de scolarité"].length > 0),

    cv_url: fields["CV"]?.[0]?.url || "",
    cv_name: fields["CV"]?.[0]?.filename || "",
    has_cv: !!(fields["CV"] && fields["CV"].length > 0),

    cni_url: fields["CIN"]?.[0]?.url || fields["cin"]?.[0]?.url || "",
    cni_name: fields["CIN"]?.[0]?.filename || fields["cin"]?.[0]?.filename || "",
    has_cni: !!((fields["CIN"] && fields["CIN"].length > 0) || (fields["cin"] && fields["cin"].length > 0)),

    diplome_url: fields["dernier diplome"]?.[0]?.url || fields["diplome"]?.[0]?.url || "",
    diplome_name: fields["dernier diplome"]?.[0]?.filename || fields["diplome"]?.[0]?.filename || "",
    has_diplome: !!((fields["dernier diplome"] && fields["dernier diplome"].length > 0) || (fields["diplome"] && fields["diplome"].length > 0)),

    lettre_motivation_url: fields["lettre de motivation"]?.[0]?.url || fields["lettre"]?.[0]?.url || "",
    lettre_motivation_name: fields["lettre de motivation"]?.[0]?.filename || fields["lettre"]?.[0]?.filename || "",
    has_lettre_motivation: !!((fields["lettre de motivation"] && fields["lettre de motivation"].length > 0) || (fields["lettre"] && fields["lettre"].length > 0)),

    vitale_url: fields["Photocopie carte vitale"]?.[0]?.url || fields["Carte Vitale"]?.[0]?.url || fields["vitale"]?.[0]?.url || "",
    vitale_name: fields["Photocopie carte vitale"]?.[0]?.filename || fields["Carte Vitale"]?.[0]?.filename || fields["vitale"]?.[0]?.filename || "",
    has_vitale: !!((fields["Photocopie carte vitale"] && fields["Photocopie carte vitale"].length > 0) || (fields["Carte Vitale"] && fields["Carte Vitale"].length > 0) || (fields["vitale"] && fields["vitale"].length > 0)),
  };
};

// Mapper: Backend (Airtable fields) -> Frontend (CompanyFormData)
const mapBackendToCompany = (backendData: any): any => {
  const fields = backendData.fields || {};
  return {
    id: backendData.id,
    record_id: backendData.id,
    fields: fields, // Maintain raw fields for modal view modes
    identification: {
      raison_sociale: fields["Raison sociale"] || "",
      siret: fields["Numéro SIRET"] || "",
      code_ape_naf: fields["Code APE/NAF"] || "",
      type_employeur: fields["Type demployeur"] || "",
      employeur_specifique: fields["Employeur spécifique"] || "",
      effectif: fields["Effectif salarié de l'entreprise"] || "",
      convention: fields["Convention collective"] || ""
    },
    adresse: {
      num: fields["Numéro entreprise"] || "",
      voie: fields["Voie entreprise"] || "",
      complement: fields["Complément dadresse entreprise"] || "",
      code_postal: fields["Code postal entreprise"] || "",
      ville: fields["Ville entreprise"] || "",
      telephone: fields["Téléphone entreprise"] || "",
      email: fields["Email entreprise"] || ""
    },
    maitre_apprentissage: {
      nom: fields["Nom Maître apprentissage"] || "",
      prenom: fields["Prénom Maître apprentissage"] || "",
      date_naissance: fields["Date de naissance Maître apprentissage"] || "",
      fonction: fields["Fonction Maître apprentissage"] || "",
      diplome_plus_eleve: fields["Diplôme Maître apprentissage intitulé"] || fields["Diplôme Maître apprentissage"] || "",
      diplome: fields["Diplôme Maître apprentissage"] || "",
      experience: fields["Année experience pro Maître apprentissage"] || "",
      telephone: fields["Téléphone Maître apprentissage"] || "",
      email: fields["Email Maître apprentissage"] || ""
    },
    opco: {
      nom: fields["Nom OPCO"] || ""
    },
    contrat: {
      type_contrat: fields["Type de contrat"] || "",
      type_derogation: fields["Type de dérogation"] || "",
      date_debut: fields["Date de début exécution"] || "",
      date_fin: fields["Fin du contrat apprentissage"] || "",
      duree_hebdomadaire: decimalToTime(fields["Durée hebdomadaire"] || "35"),
      poste_occupe: fields["Poste occupé"] || "",
      lieu_execution: fields["Lieu dexécution du contrat (si différent du siège)"] || "",

      pourcentage_smic1: fields["Pourcentage du SMIC 1"] || 0,
      pourcentage_smic1_2: fields["Pourcentage smic 1_2"] || null,
      smic1: fields["SMIC 1"] || "",
      montant_salaire_brut1: fields["Salaire brut mensuel 1"] || 0,

      pourcentage_smic2: fields["Pourcentage smic 2"] || 0,
      smic2: fields["smic 2"] || "",
      montant_salaire_brut2: fields["Salaire brut mensuel 2"] || 0,

      pourcentage_smic3: fields["Pourcentage smic 3"] || 0,
      smic3: fields["smic 3"] || "",
      montant_salaire_brut3: fields["Salaire brut mensuel 3"] || 0,

      pourcentage_smic4: fields["Pourcentage smic 4"] || 0,
      smic4: fields["smic 4"] || "",
      montant_salaire_brut4: fields["Salaire brut mensuel 4"] || 0,

      date_conclusion: fields["Date de conclusion"] || "",
      date_debut_execution: fields["Date de début exécution"] || "",
      numero_deca_ancien_contrat: fields["Numéro DECA de ancien contrat"] || "",
      machines_dangereuses: fields["Travail sur machines dangereuses ou exposition à des risques particuliers"] || "",
      caisse_retraite: fields["Caisse de retraite"] || "",
      date_avenant: fields["date Si avenant"] || "",

      // Périodes
      date_debut_1periode_1er_annee: fields["date_debut_1periode_1er_annee"] || "",
      date_fin_1periode_1er_annee: fields["date_fin_1periode_1er_annee"] || "",
      date_debut_2periode_1er_annee: fields["date_debut_2periode_1er_annee"] || "",
      date_fin_2periode_1er_annee: fields["date_fin_2periode_1er_annee"] || "",
      date_debut_1periode_2eme_annee: fields["date_debut_1periode_2eme_annee"] || "",
      date_fin_1periode_2eme_annee: fields["date_fin_1periode_2eme_annee"] || "",
      date_debut_2periode_2eme_annee: fields["date_debut_2periode_2eme_annee"] || "",
      date_fin_2periode_2eme_annee: fields["date_fin_2periode_2eme_annee"] || "",
      date_debut_1periode_3eme_annee: fields["date_debut_1periode_3eme_annee"] || "",
      date_fin_1periode_3eme_annee: fields["date_fin_1periode_3eme_annee"] || "",
      date_debut_2periode_3eme_annee: fields["date_debut_2periode_3eme_annee"] || "",
      date_fin_2periode_3eme_annee: fields["date_fin_2periode_3eme_annee"] || "",
      date_debut_1periode_4eme_annee: fields["date_debut_1periode_4eme_annee"] || "",
      date_fin_1periode_4eme_annee: fields["date_fin_1periode_4eme_annee"] || "",
      date_debut_2periode_4eme_annee: fields["date_debut_2periode_4eme_annee"] || "",
      date_fin_2periode_4eme_annee: fields["date_fin_2periode_4eme_annee"] || ""
    },
    formation: {
      choisie: fields["Formation"] || "",
      date_debut: fields["Date de début formation"] || "",
      date_fin: fields["Date de fin formation"] || "",
      code_rncp: fields["Code Rncp"] || "",
      code_diplome: fields["Code  diplome"] || "",
      nb_heures: fields["nombre heure formation"] || "",
      jours_cours: fields["jour de cours"] || ""
    },
    cfa: {
      rush_school: "",
      entreprise: fields["cfaEnterprise"] ? "oui" : "non",
      denomination: fields["DenominationCFA"] || "",
      diplome_vise: fields["diplomeVise"] || "",
      intitule_formation: fields["intituleDiplome"] || "",
      uai: fields["NumeroUAI"] || "",
      siret: fields["NumeroSiretCFA"] || "",
      adresse: fields["AdresseCFA"] || "",
      complement: fields["complementAdresseCFA"] || "",
      code_postal: fields["codePostalCFA"] || "",
      commune: fields["communeCFA"] || ""
    },
    missions: {
      formation_alternant: fields["Formation de lalternant(e) (pour les missions)"] || "",
      selectionnees: fields["Missions principales"] ? fields["Missions principales"].split(', ') : []
    },
    record_id_etudiant: fields["recordIdetudiant"] || ""
  };
};

// Helper to map student data to backend format (STRICT)
const mapStudentToBackend = (data: any, role?: string) => {
  const cleanPhone = (p: any) => {
    if (!p) return "";
    let phone = p.toString().replace(/\D/g, '');
    if (phone.length === 11 && phone.startsWith('33')) return '0' + phone.substring(2);
    if (phone.length === 9) return '0' + phone;
    return phone;
  };

  const mapSexe = (v: string) => {
    if (v === 'feminin' || v === 'Féminin' || v === 'Femme') return 'Féminin';
    if (v === 'masculin' || v === 'Masculin' || v === 'Homme') return 'Masculin';
    return v;
  };

  const mapNationalite = (v: string) => {
    if (v === 'francaise') return 'Française';
    if (v === 'ue') return 'Union Européenne';
    if (v === 'hors_ue') return 'Hors Union Européenne';
    return formatString(v);
  };

  const mapSituation = (v: string) => {
    const map: Record<string, string> = {
      'scolaire': '1 Scolaire', 'apprenti': '2 Apprenti', 'etudiant': '3 Etudiant', 'recherche_emploi': '4 Recherche emploi', 'autre': '5 Autre'
    };
    return map[v] || v || "1 Scolaire";
  };

  const mapDiplome = (v: string) => {
    const map: Record<string, string> = {
      'brevet': 'Brevet', 'cap': 'CAP', 'bts': 'BTS', 'aucun': 'Aucun diplôme'
    };
    return map[v] || v || formatString(v);
  };

  const mapNiveau = (v: string) => {
    const map: Record<string, string> = {
      'aucun': 'Aucun', 'cap_bep': 'CAP / BEP', 'bac': 'BAC', 'bac2': 'BAC +2', 'bac3_4': 'BAC +3/4', 'bac5': 'BAC +5', 'bac5+': 'BAC +5+'
    };
    return map[v] || v;
  };

  const mapFormation = (v: string) => {
    const map: Record<string, string> = {
      'bts_mco': 'BTS MCO', 'bts_ndrc': 'BTS NDRC', 'bachelor': 'BACHELOR RDC', 'bachelor_rdc': 'BACHELOR RDC', 'tp_ntc': 'TP NTC'
    };
    return map[v] || formatString(v);
  };

  return {
    prenom: data.prenom,
    nom_naissance: data.nom_naissance,
    nom_usage: data.nom_usage || "",
    sexe: mapSexe(data.sexe),
    date_naissance: data.date_naissance,
    nationalite: mapNationalite(data.nationalite),
    commune_naissance: data.commune_naissance,
    departement: data.departement,
    nom_representant_legal: data.nom_representant_legal || data.representant_legal_1?.nom || "",
    prenom_representant_legal: data.prenom_representant_legal || data.representant_legal_1?.prenom || "",
    voie_representant_legal: data.voie_representant_legal || data.representant_legal_1?.voie || "",
    lien_parente_legal: data.lien_parente_legal || data.representant_legal_1?.lien_parente || "",
    numero_legal: data.numero_legal || data.representant_legal_1?.telephone || "",
    numero_adress_legal: data.numero_adress_legal || data.representant_legal_1?.numero || "",
    complement_adresse_legal: data.complement_adresse_legal || data.representant_legal_1?.complement || "",
    code_postal_legal: parseInt(data.code_postal_legal?.toString() || data.representant_legal_1?.code_postal || "0", 10),
    commune_legal: data.commune_legal || data.representant_legal_1?.ville || "",
    courriel_legal: data.courriel_legal || data.representant_legal_1?.email || "",
    nom_representant_legal2: data.nom_representant_legal2 || data.representant_legal_2?.nom || "",
    prenom_representant_legal2: data.prenom_representant_legal2 || data.representant_legal_2?.prenom || "",
    voie_representant_legal2: data.voie_representant_legal2 || data.representant_legal_2?.voie || "",
    lien_parente_legal2: data.lien_parente_legal2 || data.representant_legal_2?.lien_parente || "",
    numero_legal2: data.numero_legal2 || data.representant_legal_2?.telephone || "",
    numero_adress_legal2: data.numero_adress_legal2 || data.representant_legal_2?.numero || "",
    complement_adresse_legal2: data.complement_adresse_legal2 || data.representant_legal_2?.complement || "",
    code_postal_legal2: parseInt(data.code_postal_legal2?.toString() || data.representant_legal_2?.code_postal || "0", 10),
    commune_legal2: data.commune_legal2 || data.representant_legal_2?.ville || "",
    courriel_legal2: data.courriel_legal2 || data.representant_legal_2?.email || "",
    adresse_residence: data.adresse_residence || [data.num_residence, data.rue_residence, data.complement_residence].filter(Boolean).join(', '),
    code_postal: parseInt(data.code_postal?.toString() || "0", 10),
    ville: data.ville,
    email: data.email,
    telephone: cleanPhone(data.telephone),
    nir: data.nir ? data.nir.replace(/\s/g, '') : "",
    situation: mapSituation(data.situation),
    regime_social: (data.regime_social === 'urssaf') ? "Sécurité Sociale" : (data.regime_social === 'msa' ? "MSA" : "Sécurité Sociale"),
    declare_inscription_sportif_haut_niveau: data.declare_inscription_sportif_haut_niveau || false,
    declare_avoir_projet_creation_reprise_entreprise: data.declare_avoir_projet_creation_reprise_entreprise || false,
    declare_travailleur_handicape: data.declare_travailleur_handicape || false,
    alternance: data.alternance || false,
    dernier_diplome_prepare: mapDiplome(data.dernier_diplome_prepare || ""),
    derniere_classe: data.derniere_classe || "",
    bac: mapNiveau(data.bac) || "",
    intitulePrecisDernierDiplome: data.intitulePrecisDernierDiplome || "",
    formation_souhaitee: mapFormation(data.formation_souhaitee),
    date_de_visite: data.date_de_visite || new Date().toISOString().split('T')[0],
    date_de_reglement: data.date_de_reglement || new Date().toISOString().split('T')[0],
    entreprise_d_accueil: data.entreprise_d_accueil || "Non",
    connaissance_rush_how: formatString(data.connaissance_rush_how || "") || "Autre",
    motivation_projet_professionnel: data.motivation_projet_professionnel || "Non renseigné",
    utilisateur: role || "admission",
    validation: data.validation || "En attente"
  };
};
const mapCompanyToBackend = (data: any, role?: string) => {
  console.log('🚀 mapCompanyToBackend input:', data, 'role:', role);
  const ensureString = (val: any) => (val === undefined || val === null) ? "" : String(val);

  // Si les données sont déjà au format backend (cas de l'update avec fields)
  if (data.identification || data.adresse || data.maitre_apprentissage) {
    return {
      identification: {
        raison_sociale: ensureString(data.identification?.raison_sociale),
        siret: ensureString(data.identification?.siret),
        code_ape_naf: ensureString(data.identification?.code_ape_naf),
        type_employeur: ensureString(data.identification?.type_employeur),
        employeur_specifique: ensureString(data.identification?.employeur_specifique),
        nombre_salaries: data.identification?.effectif ? parseInt(data.identification.effectif.toString()) : (data.identification?.nombre_salaries || 0),
        convention_collective: ensureString(data.identification?.convention || data.identification?.convention_collective)
      },
      adresse: {
        numero: ensureString(data.adresse?.num || data.adresse?.numero),
        voie: ensureString(data.adresse?.voie),
        complement: ensureString(data.adresse?.complement),
        code_postal: ensureString(data.adresse?.code_postal),
        ville: ensureString(data.adresse?.ville),
        telephone: ensureString(data.adresse?.telephone),
        email: ensureString(data.adresse?.email)
      },
      maitre_apprentissage: {
        nom: ensureString(data.maitre_apprentissage?.nom),
        prenom: ensureString(data.maitre_apprentissage?.prenom),
        date_naissance: ensureString(data.maitre_apprentissage?.date_naissance),
        fonction: ensureString(data.maitre_apprentissage?.fonction),
        diplome_plus_eleve: ensureString(data.maitre_apprentissage?.diplome_plus_eleve || data.maitre_apprentissage?.diplome),
        niveau_diplome: ensureString(data.maitre_apprentissage?.niveau_diplome || data.maitre_apprentissage?.diplome),
        annees_experience: ensureString(data.maitre_apprentissage?.experience || data.maitre_apprentissage?.annees_experience),
        telephone: ensureString(data.maitre_apprentissage?.telephone),
        email: ensureString(data.maitre_apprentissage?.email)
      },
      opco: { nom_opco: ensureString(data.opco?.nom || data.opco?.nom_opco) },
      contrat: {
        type_contrat: ensureString(data.contrat?.type_contrat),
        type_derogation: ensureString(data.contrat?.type_derogation),
        date_debut: ensureString(data.contrat?.date_debut_execution || data.formation?.date_debut),
        date_fin: ensureString(data.contrat?.date_fin),
        duree_hebdomadaire: ensureString(data.contrat?.duree_hebdomadaire),
        poste_occupe: ensureString(data.contrat?.poste_occupe),
        lieu_execution: ensureString(data.contrat?.lieu_execution),
        pourcentage_smic1: data.contrat?.pourcentage_smic1 || 0,
        pourcentage_smic1_2: data.contrat?.pourcentage_smic1_2 || "",
        smic1: "smic",
        montant_salaire_brut1: data.contrat?.montant_salaire_brut1 ? parseFloat(data.contrat.montant_salaire_brut1.toString()) : "",
        pourcentage_smic2: data.contrat?.pourcentage_smic2 || "",
        pourcentage_smic2_2: data.contrat?.pourcentage_smic2_2 || "",
        smic2: data.contrat?.pourcentage_smic2 ? "smic" : "",
        montant_salaire_brut2: data.contrat?.montant_salaire_brut2 ? parseFloat(data.contrat.montant_salaire_brut2.toString()) : "",
        pourcentage_smic3: data.contrat?.pourcentage_smic3 || "",
        pourcentage_smic3_2: data.contrat?.pourcentage_smic3_2 || "",
        smic3: data.contrat?.pourcentage_smic3 ? "smic" : "",
        montant_salaire_brut3: data.contrat?.montant_salaire_brut3 ? parseFloat(data.contrat.montant_salaire_brut3.toString()) : "",
        pourcentage_smic4: data.contrat?.pourcentage_smic4 || "",
        pourcentage_smic4_2: data.contrat?.pourcentage_smic4_2 || "",
        smic4: data.contrat?.pourcentage_smic4 ? "smic" : "",
        montant_salaire_brut4: data.contrat?.montant_salaire_brut4 ? parseFloat(data.contrat.montant_salaire_brut4.toString()) : "",
        date_conclusion: ensureString(data.contrat?.date_conclusion),
        date_debut_execution: ensureString(data.contrat?.date_debut_execution),
        // 1ère année : date_debut (above) = début p1. Seuls fin p1, début/fin p2 sont envoyés.
        date_fin_1periode_1ere_annee: ensureString(data.contrat?.date_fin_1periode_1er_annee),
        date_debut_2periode_1er_annee: ensureString(data.contrat?.date_debut_2periode_1er_annee),
        date_fin_2periode_1er_annee: ensureString(data.contrat?.date_fin_2periode_1er_annee),
        date_debut_1periode_2eme_annee: ensureString(data.contrat?.date_debut_1periode_2eme_annee),
        date_fin_1periode_2eme_annee: ensureString(data.contrat?.date_fin_1periode_2eme_annee),
        date_debut_2periode_2eme_annee: ensureString(data.contrat?.date_debut_2periode_2eme_annee),
        date_fin_2periode_2eme_annee: ensureString(data.contrat?.date_fin_2periode_2eme_annee),
        date_debut_1periode_3eme_annee: ensureString(data.contrat?.date_debut_1periode_3eme_annee),
        date_fin_1periode_3eme_annee: ensureString(data.contrat?.date_fin_1periode_3eme_annee),
        date_debut_2periode_3eme_annee: ensureString(data.contrat?.date_debut_2periode_3eme_annee),
        date_fin_2periode_3eme_annee: ensureString(data.contrat?.date_fin_2periode_3eme_annee),
        date_debut_1periode_4eme_annee: ensureString(data.contrat?.date_debut_1periode_4eme_annee),
        date_fin_1periode_4eme_annee: ensureString(data.contrat?.date_fin_1periode_4eme_annee),
        date_debut_2periode_4eme_annee: ensureString(data.contrat?.date_debut_2periode_4eme_annee),
        date_fin_2periode_4eme_annee: ensureString(data.contrat?.date_fin_2periode_4eme_annee),
        numero_deca_ancien_contrat: ensureString(data.contrat?.numero_deca_ancien_contrat),
        travail_machine_dangereuse: ensureString(data.contrat?.machines_dangereuses || data.contrat?.travail_machine_dangereuse),
        caisse_retraite: ensureString(data.contrat?.caisse_retraite),
        date_avenant: ensureString(data.contrat?.date_avenant)
      },
      formation_missions: {
        formation_alternant: data.missions?.selectionnees?.length > 0 ? data.missions.selectionnees.join(', ') : (data.formation_missions?.formation_alternant || ""),
        formation_choisie: ensureString(data.formation?.choisie || data.formation_missions?.formation_choisie),
        code_rncp: ensureString(data.formation?.code_rncp || data.formation_missions?.code_rncp),
        code_diplome: ensureString(data.formation?.code_diplome || data.formation_missions?.code_diplome),
        nombre_heures_formation: data.formation?.nb_heures ? parseFloat(data.formation.nb_heures.toString()) : (data.formation_missions?.nombre_heures_formation || 0),
        jours_de_cours: data.formation_missions?.jours_de_cours || 0,
        missions: ensureString(data.missions?.description || data.formation_missions?.missions),
        formation_interne: ensureString(data.formation?.interne || data.formation_missions?.formation_interne),
        cfaEnterprise: !!(data.cfa?.entreprise === 'oui' || data.formation_missions?.cfaEnterprise),
        DenominationCFA: ensureString(data.cfa?.denomination || data.formation_missions?.DenominationCFA),
        NumeroUAI: ensureString(data.cfa?.uai || data.formation_missions?.NumeroUAI),
        NumeroSiretCFA: ensureString(data.cfa?.siret || data.formation_missions?.NumeroSiretCFA),
        AdresseCFA: ensureString(data.cfa?.adresse || data.formation_missions?.AdresseCFA),
        complementAdresseCFA: ensureString(data.cfa?.complement || data.formation_missions?.complementAdresseCFA),
        codePostalCFA: data.cfa?.code_postal ? parseInt(data.cfa.code_postal.toString()) : (data.formation_missions?.codePostalCFA || null),
        communeCFA: ensureString(data.cfa?.commune || data.formation_missions?.communeCFA)
      },
      record_id_etudiant: ensureString(data.record_id_etudiant || data.recordIdetudiant),
      utilisateur: role || "admission",
      validation: data.validation || "En attente"
    };
  }

  console.log('🚀 record_id_etudiant being mapped (flat case):', data["recordIdetudiant"]);
  // Cas des données plates provenant directement des "fields" d'Airtable
  return {
    identification: {
      raison_sociale: ensureString(data["Raison sociale"] || data["raison sociale"]),
      siret: ensureString(data["Numéro SIRET"] || data["siret"]),
      code_ape_naf: ensureString(data["Code APE/NAF"] || data["Code NAF"]),
      type_employeur: ensureString(data["Type demployeur"]),
      employeur_specifique: ensureString(data["Employeur spécifique"]),
      nombre_salaries: parseInt(ensureString(data["Effectif salarié de l'entreprise"])) || 0,
      convention_collective: ensureString(data["Convention collective"])
    },
    adresse: {
      numero: ensureString(data["Numéro entreprise"]),
      voie: ensureString(data["Voie entreprise"]),
      complement: ensureString(data["Complément dadresse entreprise"]),
      code_postal: ensureString(data["Code postal entreprise"]),
      ville: ensureString(data["Ville entreprise"]),
      telephone: ensureString(data["Téléphone entreprise"]),
      email: ensureString(data["Email entreprise"])
    },
    maitre_apprentissage: {
      nom: ensureString(data["Nom Maître apprentissage"]),
      prenom: ensureString(data["Prénom Maître apprentissage"]),
      date_naissance: ensureString(data["Date de naissance Maître apprentissage"]),
      fonction: ensureString(data["Fonction Maître apprentissage"]),
      diplome_plus_eleve: ensureString(data["Diplôme Maître apprentissage intitulé"] || data["Diplôme Maître apprentissage"]),
      niveau_diplome: ensureString(data["Diplôme Maître apprentissage"]),
      annees_experience: ensureString(data["Année experience pro Maître apprentissage"]),
      telephone: ensureString(data["Téléphone Maître apprentissage"]),
      email: ensureString(data["Email Maître apprentissage"])
    },
    opco: { nom_opco: ensureString(data["Nom OPCO"]) },
    contrat: {
      type_contrat: ensureString(data["Type de contrat"]),
      type_derogation: ensureString(data["Type de dérogation"]),
      date_debut: ensureString(data["Date de début exécution"]),
      date_fin: ensureString(data["Fin du contrat apprentissage"]),
      duree_hebdomadaire: ensureString(data["Durée hebdomadaire"]),
      poste_occupe: ensureString(data["Poste occupé"]),
      lieu_execution: ensureString(data["Lieu dexécution du contrat (si différent du siège)"]),
      pourcentage_smic1: data["Pourcentage du SMIC 1"] || data["Pourcentage smic 1"] || 0,
      pourcentage_smic1_2: data["pourcentage_smic1_2"] || "",
      smic1: "smic",
      montant_salaire_brut1: parseFloat(ensureString(data["Salaire brut mensuel 1"])) || "",
      pourcentage_smic2: data["Pourcentage smic 2"] || "",
      pourcentage_smic2_2: data["pourcentage_smic2_2"] || "",
      smic2: data["Pourcentage smic 2"] ? "smic" : "",
      montant_salaire_brut2: parseFloat(ensureString(data["Salaire brut mensuel 2"])) || "",
      pourcentage_smic3: data["Pourcentage smic 3"] || "",
      pourcentage_smic3_2: data["pourcentage_smic3_2"] || "",
      smic3: data["Pourcentage smic 3"] ? "smic" : "",
      montant_salaire_brut3: parseFloat(ensureString(data["Salaire brut mensuel 3"])) || "",
      pourcentage_smic4: data["Pourcentage smic 4"] || "",
      pourcentage_smic4_2: data["pourcentage_smic4_2"] || "",
      smic4: data["Pourcentage smic 4"] ? "smic" : "",
      montant_salaire_brut4: parseFloat(ensureString(data["Salaire brut mensuel 4"])) || "",
      date_conclusion: ensureString(data["Date de conclusion"]),
      date_debut_execution: ensureString(data["Date de début exécution"]),
      numero_deca_ancien_contrat: ensureString(data["Numéro DECA de ancien contrat"]),
      travail_machine_dangereuse: ensureString(data["Travail sur machines dangereuses ou exposition à des risques particuliers"]),
      caisse_retraite: ensureString(data["Caisse de retraite"]),
      date_avenant: ensureString(data["date Si avenant"]),
      date_debut_1periode_1er_annee: ensureString(data["date_debut_1periode_1er_annee"]),
      date_fin_1periode_1er_annee: ensureString(data["date_fin_1periode_1er_annee"]),
      date_debut_2periode_1er_annee: ensureString(data["date_debut_2periode_1er_annee"]),
      date_fin_2periode_1er_annee: ensureString(data["date_fin_2periode_1er_annee"]),
      date_debut_1periode_2eme_annee: ensureString(data["date_debut_1periode_2eme_annee"]),
      date_fin_1periode_2eme_annee: ensureString(data["date_fin_1periode_2eme_annee"]),
      date_debut_2periode_2eme_annee: ensureString(data["date_debut_2periode_2eme_annee"]),
      date_fin_2periode_2eme_annee: ensureString(data["date_fin_2periode_2eme_annee"]),
      date_debut_1periode_3eme_annee: ensureString(data["date_debut_1periode_3eme_annee"]),
      date_fin_1periode_3eme_annee: ensureString(data["date_fin_1periode_3eme_annee"]),
      date_debut_2periode_3eme_annee: ensureString(data["date_debut_2periode_3eme_annee"]),
      date_fin_2periode_3eme_annee: ensureString(data["date_fin_2periode_3eme_annee"]),
      date_debut_1periode_4eme_annee: ensureString(data["date_debut_1periode_4eme_annee"]),
      date_fin_1periode_4eme_annee: ensureString(data["date_fin_1periode_4eme_annee"]),
      date_debut_2periode_4eme_annee: ensureString(data["date_debut_2periode_4eme_annee"]),
      date_fin_2periode_4eme_annee: ensureString(data["date_fin_2periode_4eme_annee"])
    },
    formation_missions: {
      formation_alternant: ensureString(data["Formation de lalternant(e) (pour les missions)"]),
      formation_choisie: ensureString(data["Formation"]),
      code_rncp: ensureString(data["Code Rncp"]),
      code_diplome: ensureString(data["Code  diplome"]),
      nombre_heures_formation: parseFloat(ensureString(data["nombre heure formation"])) || 0,
      jours_de_cours: parseInt(ensureString(data["jour de cours"])) || 0,
      cfaEnterprise: !!(data["cfaEnterprise"]),
      DenominationCFA: "", NumeroUAI: "", NumeroSiretCFA: "", AdresseCFA: "", complementAdresseCFA: "", codePostalCFA: "", communeCFA: ""
    },
    record_id_etudiant: ensureString(data["recordIdetudiant"] || data.record_id_etudiant),
    utilisateur: role || "admission",
    validation: data.validation || "En attente"
  };
};

// Helper to get only modified fields for PATCH request
const diffObjects = (original: any, modified: any): any => {
  const diff: any = {};
  for (const key in modified) {
    const valOrig = original[key];
    const valMod = modified[key];

    if (valMod && typeof valMod === 'object' && !Array.isArray(valMod)) {
      const nestedDiff = diffObjects(valOrig || {}, valMod);
      if (Object.keys(nestedDiff).length > 0) {
        diff[key] = nestedDiff;
      }
    } else if (valOrig !== valMod) {
      diff[key] = valMod;
    }
  }
  return diff;
};

export const api = {
  // --- AUTH ---
  async login(email: string, pass: string): Promise<{ access_token: string, role: string, email: string, name: string }> {
    console.log('Login attempt:', email);

    const response = await fetch(`${AUTH_API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        email,
        password: pass
      })
    });

    const json = await readJsonSafely(response);
    if (!response.ok) {
      throw new Error(getApiErrorMessage(json, `Identifiants invalides (${response.status})`));
    }

    const accessToken = String(json?.access_token || '');
    if (!accessToken) {
      throw new Error('Token de connexion manquant');
    }

    const payload = decodeJwtPayload(accessToken);
    const rawRole = String(json?.role || payload?.role || '').trim().toLowerCase();
    const role = rawRole === 'student' ? 'eleve' : (rawRole || 'admission');

    let profileEmail = email;
    let profileName = '';

    try {
      const meResponse = await fetch(`${AUTH_API_URL}/profile`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      });

      const meJson = await readJsonSafely(meResponse);
      if (meResponse.ok) {
        const user = meJson?.user || {};
        profileEmail = user.email || profileEmail;
        profileName = user.name || profileName;
      }
    } catch {
      // Le login reste valide meme si le profil n'est pas recuperable.
    }

    const loginData = {
      access_token: accessToken,
      role,
      email: profileEmail,
      name: profileName
    };

    console.log('Login success:', loginData);
    return loginData;
  },
  async register(userData: any): Promise<{ access_token: string }> {
    console.log('📦 Mock Register Attempt:', userData.email);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const mockData = {
      access_token: 'mock-jwt-token-reg-' + Date.now()
    };

    console.log('📤 Mock Register Success:', mockData);
    return mockData;
  },
  async updateProfile(updateData: any): Promise<any> {
    const response = await fetch(`${AUTH_API_URL}/profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(updateData)
    });
    if (!response.ok) throw new Error('Erreur lors de la mise à jour du profil');
    return response.json();
  },
  async changePassword(oldPassword: string, newPassword: string): Promise<any> {
    const response = await fetch(`${AUTH_API_URL}/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({ oldPassword, newPassword })
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'Erreur lors du changement de mot de passe');
    }
    return response.json();
  },

  // --- USER MANAGEMENT (Admin Only) ---
  async getAllUsers(): Promise<any[]> {
    const response = await fetch(`${BASE_API_URL}/settings/users`, {
      headers: { 'Authorization': `Bearer ${getAuthToken()}` }
    });
    if (!response.ok) throw new Error('Erreur lors de la récupération des utilisateurs');
    const json = await response.json();
    return json.data || [];
  },
  async updateUserInfo(email: string, updateData: any): Promise<any> {
    const response = await fetch(`${BASE_API_URL}/users/${email}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(updateData)
    });
    if (!response.ok) throw new Error('Erreur lors de la mise à jour de l\'utilisateur');
    return response.json();
  },
  async deleteUser(email: string): Promise<any> {
    const response = await fetch(`${BASE_API_URL}/users/${email}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${getAuthToken()}` }
    });
    if (!response.ok) throw new Error('Erreur lors de la suppression de l\'utilisateur');
    return response.json();
  },

  // --- HEALTH ---
  async checkHealth(): Promise<boolean> {
    try {
      console.log('🚀 Checking API Health at:', `${BASE_API_URL}/health`);
      const response = await fetch(`${BASE_API_URL}/health`, { method: 'GET' });
      console.log('📊 Health Check Result:', response.ok ? '✅ OK' : `❌ Failed (${response.status})`);
      return response.ok;
    } catch (error) {
      console.error('❌ Health Check Error:', error);
      return false;
    }
  },

  // Get students list with documents
  async getStudentsList(params?: {
    avecFicheUniquement?: boolean;
    avecCerfaUniquement?: boolean;
    dossierCompletUniquement?: boolean;
  }): Promise<any> {
    try {
      const queryParams = new URLSearchParams({
        avec_fiche_uniquement: params?.avecFicheUniquement ? 'true' : 'false',
        avec_cerfa_uniquement: params?.avecCerfaUniquement ? 'true' : 'false',
        dossier_complet_uniquement: params?.dossierCompletUniquement ? 'true' : 'false'
      });
      // New backend uses /candidates for everything
      const response = await fetch(`${BASE_URL}/candidats`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      const data = await readJsonSafely(response);
      if (!response.ok) {
        const message = getApiErrorMessage(data, `Failed to fetch candidates (${response.status})`);
        throw new Error(message);
      }
      console.log('API getStudentsList RAW:', data);

      // Adaptation Local Backend: structure data { success: true, data: [...], count: ... }
      let students: any[] = [];
      if (Array.isArray(data)) {
        students = data;
      } else if (data.data && Array.isArray(data.data)) {
        students = data.data;
      } else if (data.etudiants && Array.isArray(data.etudiants)) {
        students = data.etudiants;
      }

      // Map backend fields to frontend format
      const formattedStudents = students.map(s => {
        if (looksLikeBackendRecord(s)) {
          return mapBackendToStudent(s);
        }
        // Fallback for objects that might already be flat or different format
        return s;
      });

      return {
        ...data,
        etudiants: formattedStudents
      };
    } catch (error) {
      console.error('❌ API Error (Get Students List):', error);
      throw error;
    }
  },

  // Get RH Stats
  async getRHStats(): Promise<any> {
    try {
      console.log('📦 Fetching RH Stats');
      const response = await fetch(`${BASE_API_URL}/rh/statistiques`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to fetch RH stats');
      const data = await response.json();
      console.log('📤 RH Stats Received:', data);
      return data;
    } catch (error) {
      console.error('❌ API Error (Get RH Stats):', error);
      throw error;
    }
  },

  // --- CANDIDATES (CRUD) ---
  async submitStudent(data: StudentFormData, role?: string): Promise<ApiResponse> {
    try {
      const payload = mapStudentToBackend(data, role);
      console.log('📦 Submit Student Payload:', payload);
      const response = await fetch(`${BASE_URL}/candidates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Submit Student Failed:', errorData);
        throw new Error(errorData.detail || `Error ${response.status}`);
      }
      const json = await response.json();
      console.log('📤 Submit Student Success:', json);
      return { success: true, record_id: json.record_id || json.id, data: json };
    } catch (error: any) {
      console.error('❌ API Error (Submit Student):', error);
      throw error;
    }
  },

  async getAllCandidates(): Promise<any[]> {
    try {
      const response = await fetch(`${BASE_URL}/candidats`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to fetch candidates');
      const json = await response.json();
      console.log('API getAllCandidates RAW:', json);
      return Array.isArray(json) ? json : (json.data || []);
    } catch (error) { return []; }
  },

  async getCandidatsWithDocuments(): Promise<any[]> {
    try {
      const response = await fetch(`${BASE_URL}/candidats-with-documents`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      const json = await readJsonSafely(response);
      if (!response.ok) {
        const message = getApiErrorMessage(json, `Failed to fetch candidates with documents (${response.status})`);
        throw new Error(message);
      }
      console.log('API getCandidatsWithDocuments RAW:', json);
      return Array.isArray(json) ? json : (json.data || []);
    } catch (error) {
      console.error('❌ API Error (getCandidatsWithDocuments):', error);
      return [];
    }
  },

  async getCandidateById(id: string): Promise<any> {
    try {
      console.log('📦 Fetching Candidate:', id);
      const response = await fetch(`${BASE_URL}/candidates/${id}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      if (!response.ok) throw new Error('Candidate not found');
      const json = await response.json();
      console.log('📤 Candidate Received:', json);

      // Adapt response for local backend (usually returns { success: true, data: { ... } })
      const candidateData = json.data || json;

      if (looksLikeBackendRecord(candidateData)) {
        return mapBackendToStudent(candidateData);
      }
      return candidateData;
    } catch (error) { throw error; }
  },

  async updateCandidate(id: string, data: Partial<StudentFormData>, role?: string): Promise<any> {
    try {
      const payload = mapStudentToBackend(data, role);
      console.log('📦 Update Candidate Payload:', payload);
      const response = await fetch(`${BASE_URL}/candidates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        console.error('❌ Update Candidate Failed');
        throw new Error('Update failed');
      }
      const json = await response.json();
      console.log('📤 Update Candidate Success:', json);
      return json;
    } catch (error) { throw error; }
  },

  async validateCandidate(id: string): Promise<any> {
    try {
      const payload = {
        validation: 'Validé'
      };
      const response = await fetch(`${BASE_URL}/candidats/${id}`, {
        method: 'PATCH',
        headers: withAuthHeaders({
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }),
        body: JSON.stringify(payload),
      });
      const json = await readJsonSafely(response);
      if (!response.ok) {
        throw new Error(getApiErrorMessage(json, `Échec de la validation (${response.status})`));
      }
      return json;
    } catch (error) {
      throw error;
    }
  },

  async deleteCandidate(id: string): Promise<boolean> {
    try {
      console.log('📦 Deleting Candidate:', id);
      const response = await fetch(`${BASE_URL}/candidates/${id}`, {
        method: 'DELETE',
        headers: { 'Accept': 'application/json' }
      });
      console.log('📤 Delete Candidate Status:', response.status);
      return response.ok;
    } catch (error) { return false; }
  },

  // --- DOCUMENTS ---
  async uploadDocument(recordId: string, docType: string, file: File): Promise<any> {
    try {
      console.log(`📦 Uploading Document (${docType}) for ${recordId}:`, file.name);
      const formData = new FormData();
      formData.append('file', file);
      const endpointMap: Record<string, string> = { 'cv': 'cv', 'cni': 'cin', 'lettre': 'lettre-motivation', 'vitale': 'carte-vitale', 'diplome': 'dernier-diplome' };
      const url = `${BASE_URL}/candidates/${recordId}/documents/${endpointMap[docType] || docType}`;
      const response = await fetch(url, { method: 'POST', headers: { 'Accept': 'application/json' }, body: formData });
      if (!response.ok) throw new Error(`Upload failed: ${response.statusText}`);
      const json = await response.json();
      console.log('📤 Upload Success:', json);
      return json;
    } catch (error) { throw error; }
  },

  // --- GENERATION ---
  async generateFicheRenseignement(recordId: string): Promise<any> {
    try {
      console.log('📦 Generating Fiche Renseignement:', recordId);
      const response = await fetch(`${BASE_URL}/candidats/${recordId}/fiche-renseignement`, {
        method: 'POST',
        headers: { 'Accept': 'application/json' }
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Fiche Renseignement Generation Failed:', errorData);
        throw new Error(errorData.detail || errorData.message || 'Generation failed');
      }
      const text = await response.text();
      try {
        const json = JSON.parse(text);
        console.log('📤 Generation Success:', json);
        return json;
      } catch (e) {
        console.log('📤 Generation Success (Non-JSON):', text);
        return { success: true, message: text };
      }
    } catch (error) { throw error; }
  },

  async generateCerfa(recordId: string): Promise<any> {
    try {
      console.log('📦 Generating CERFA:', recordId);
      const url = `${BASE_URL}/candidats/${recordId}/cerfa`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Accept': 'application/json' }
      });
      if (!response.ok) {
        let errorDetail = 'Generation failed';
        try {
          const errorData = await response.json();
          errorDetail = errorData.detail || errorData.message || errorDetail;
          console.error('❌ CERFA Generation Failed (JSON):', errorData);
        } catch (e) {
          const errorText = await response.text().catch(() => '');
          errorDetail = errorText || errorDetail;
          console.error('❌ CERFA Generation Failed (Text):', errorText);
        }
        throw new Error(errorDetail);
      }
      const text = await response.text();
      try {
        const json = JSON.parse(text);
        console.log('📤 CERFA Generation Success:', json);
        return json;
      } catch (e) {
        console.log('📤 CERFA Generation Success (Non-JSON):', text);
        return { success: true, message: text };
      }
    } catch (error) { throw error; }
  },

  async generateAtre(recordId: string): Promise<any> {
    try {
      console.log('📦 Generating ATRE:', recordId);
      const response = await fetch(`${BASE_URL}/candidats/${recordId}/atre`, {
        method: 'POST',
        headers: { 'Accept': 'application/json' }
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ ATRE Generation Failed:', errorData);
        throw new Error(errorData.detail || errorData.message || 'Generation failed');
      }
      const text = await response.text();
      try {
        const json = JSON.parse(text);
        console.log('📤 ATRE Generation Success:', json);
        return json;
      } catch (e) {
        console.log('📤 ATRE Generation Success (Non-JSON):', text);
        return { success: true, message: text };
      }
    } catch (error) { throw error; }
  },

  async generateCompteRendu(recordId: string): Promise<any> {
    try {
      console.log('📦 Generating Compte Rendu:', recordId);
      const response = await fetch(`${BASE_URL}/candidats/${recordId}/compte-rendu`, {
        method: 'POST',
        headers: { 'Accept': 'application/json' }
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Compte Rendu Generation Failed:', errorData);
        throw new Error(errorData.detail || errorData.message || 'Generation failed');
      }
      const text = await response.text();
      try {
        const json = JSON.parse(text);
        console.log('📤 Compte Rendu Generation Success:', json);
        return json;
      } catch (e) {
        console.log('📤 Compte Rendu Generation Success (Non-JSON):', text);
        return { success: true, message: text };
      }
    } catch (error) { throw error; }
  },

  async generateConventionApprentissage(recordId: string): Promise<any> {
    try {
      console.log('📦 Generating Convention Apprentissage:', recordId);
      const response = await fetch(`${BASE_URL}/candidats/${recordId}/convention-apprentissage`, {
        method: 'POST',
        headers: { 'Accept': 'application/json' }
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Convention Apprentissage Generation Failed:', errorData);
        throw new Error(errorData.detail || errorData.message || 'Generation failed');
      }
      const text = await response.text();
      try {
        const json = JSON.parse(text);
        console.log('📤 Convention Apprentissage Generation Success:', json);
        return json;
      } catch (e) {
        console.log('📤 Convention Apprentissage Generation Success (Non-JSON):', text);
        return { success: true, message: text };
      }
    } catch (error) { throw error; }
  },

  async generateLivretApprentissage(recordId: string): Promise<any> {
    try {
      console.log('📦 Generating Livret Apprentissage:', recordId);
      const response = await fetch(`${BASE_URL}/candidats/${recordId}/livret-apprentissage`, {
        method: 'POST',
        headers: { 'Accept': 'application/json' }
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Livret Apprentissage Generation Failed:', errorData);
        throw new Error(errorData.detail || errorData.message || 'Generation failed');
      }
      const text = await response.text();
      try {
        const json = JSON.parse(text);
        console.log('📤 Livret Apprentissage Generation Success:', json);
        return json;
      } catch (e) {
        console.log('📤 Livret Apprentissage Generation Success (Non-JSON):', text);
        return { success: true, message: text };
      }
    } catch (error) { throw error; }
  },

  async generateCertificatScolarite(recordId: string): Promise<any> {
    try {
      console.log('📦 Generating Certificat de Scolarité:', recordId);
      const response = await fetch(`${BASE_URL}/candidats/${recordId}/certificat-scolarite`, {
        method: 'POST',
        headers: { 'Accept': 'application/json' }
      });
      if (!response.ok) {
        let errorDetail = 'Generation failed';
        try {
          const errorData = await response.json();
          errorDetail = errorData.detail || errorData.message || errorDetail;
          console.error('❌ Certificat Scolarité Generation Failed:', errorData);
        } catch (e) {
          const errorText = await response.text().catch(() => '');
          errorDetail = errorText || errorDetail;
          console.error('❌ Certificat Scolarité Generation Failed (Text):', errorText);
        }
        throw new Error(errorDetail);
      }
      const text = await response.text();
      try {
        const json = JSON.parse(text);
        console.log('📤 Certificat Scolarité Generation Success:', json);
        return json;
      } catch (e) {
        console.log('📤 Certificat Scolarité Generation Success (Non-JSON):', text);
        return { success: true, message: text };
      }
    } catch (error) { throw error; }
  },

  async generateSigningLink(documentId: string): Promise<any> {
    try {
      const url = `${BASE_API_URL}/documents/${documentId}/signature/signing-link`;
      console.log('🚀 [API] Requesting Signing Link:', {
        url: url,
        method: 'POST',
        documentId: documentId
      });

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ [API] Signing Link Generation Failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        throw new Error(errorData.detail || errorData.message || 'Generation failed');
      }

      const json = await response.json();
      console.log('✅ [API] Signing Link Received:', json);
      return json;
    } catch (error) {
      console.error('💥 [API] Signing Link Error:', error);
      throw error;
    }
  },

  // --- STUDENT SPACE ---
  async getCurrentStudent(): Promise<any | null> {
    try {
      // First try to get student ID from token or localStorage
      const storedStudentId = getStoredStudentId() || getAuthStudentId();
      if (storedStudentId) {
        const response = await fetch(`${BASE_URL}/candidates/${storedStudentId}`, {
          method: 'GET',
          headers: withAuthHeaders({ Accept: 'application/json' }),
        });
        const json = await readJsonSafely(response);
        if (response.ok) {
          const record = json?.data || json;
          if (record) {
            const recordId = getRecordId(record);
            if (recordId) setCurrentStudentId(recordId);
            return looksLikeBackendRecord(record) ? mapBackendToStudent(record) : record;
          }
        }
      }

      // If no stored ID, try to get from JWT email (but avoid expensive full list fetch)
      const email = (getAuthEmail() || '').trim().toLowerCase();
      if (!email) {
        console.warn('No student ID in token/localStorage and no email available');
        return null;
      }

      // Instead of fetching all candidates (expensive), try to get by email if endpoint exists
      try {
        const response = await fetch(`${BASE_URL}/candidats/by-email/${encodeURIComponent(email)}`, {
          method: 'GET',
          headers: withAuthHeaders({ Accept: 'application/json' }),
        });
        const json = await readJsonSafely(response);
        if (response.ok && json?.data) {
          const record = json.data;
          const recordId = getRecordId(record);
          if (recordId) setCurrentStudentId(recordId);
          return looksLikeBackendRecord(record) ? mapBackendToStudent(record) : record;
        }
      } catch (emailFetchError) {
        console.warn('Email lookup endpoint not available, falling back to full list (expensive)');
      }

      // Last resort: fetch all candidates (expensive but necessary if no email endpoint)
      console.warn('Performing expensive full candidate list fetch - consider optimizing');
      const response = await fetch(`${BASE_URL}/candidats`, {
        method: 'GET',
        headers: withAuthHeaders({ Accept: 'application/json' }),
      });
      const json = await readJsonSafely(response);
      if (!response.ok) return null;
      const list = Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : [];
      const match = list.find((item: any) => {
        const fields = getRecordFields(item);
        const candidateEmail = String(fields['E-mail'] || fields.email || item.email || '').trim().toLowerCase();
        return candidateEmail === email;
      });
      if (!match) return null;
      const recordId = getRecordId(match);
      if (recordId) setCurrentStudentId(recordId);
      return looksLikeBackendRecord(match) ? mapBackendToStudent(match) : match;
    } catch (error) {
      console.error('API Error (getCurrentStudent):', error);
      return null;
    }
  },

  async getCurrentStudentId(): Promise<string | undefined> {
    const stored = getStoredStudentId() || getAuthStudentId();
    if (stored) return String(stored);
    const student = await this.getCurrentStudent();
    const studentId = student?.id || student?.record_id || student?._id;
    return studentId ? String(studentId) : undefined;
  },

  async getAttendances(studentId?: string): Promise<any[]> {
    try {
      const resolvedStudentId = studentId || await this.getCurrentStudentId();
      if (!resolvedStudentId) return [];
      const response = await fetch(`${BASE_API_URL}/attendances?studentId=${encodeURIComponent(String(resolvedStudentId))}`, {
        method: 'GET',
        headers: withAuthHeaders({ Accept: 'application/json' }),
      });
      const json = await readJsonSafely(response);
      return response.ok ? (Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : []) : [];
    } catch (error) {
      console.error('API Error (getAttendances):', error);
      return [];
    }
  },

  async getGrades(studentId?: string): Promise<any[]> {
    try {
      const resolvedStudentId = studentId || await this.getCurrentStudentId();
      if (!resolvedStudentId) return [];
      const response = await fetch(`${BASE_API_URL}/grades?studentId=${encodeURIComponent(String(resolvedStudentId))}`, {
        method: 'GET',
        headers: withAuthHeaders({ Accept: 'application/json' }),
      });
      const json = await readJsonSafely(response);
      return response.ok ? (Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : []) : [];
    } catch (error) {
      console.error('API Error (getGrades):', error);
      return [];
    }
  },

  async getEvents(studentId?: string): Promise<any[]> {
    try {
      const resolvedStudentId = studentId || await this.getCurrentStudentId();
      if (!resolvedStudentId) return [];
      const response = await fetch(`${BASE_API_URL}/events?studentId=${encodeURIComponent(String(resolvedStudentId))}`, {
        method: 'GET',
        headers: withAuthHeaders({ Accept: 'application/json' }),
      });
      const json = await readJsonSafely(response);
      return response.ok ? (Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : []) : [];
    } catch (error) {
      console.error('API Error (getEvents):', error);
      return [];
    }
  },

  async getAppointments(studentId?: string): Promise<any[]> {
    try {
      const resolvedStudentId = studentId || await this.getCurrentStudentId();
      if (!resolvedStudentId) return [];
      const response = await fetch(`${BASE_API_URL}/appointments?studentId=${encodeURIComponent(String(resolvedStudentId))}`, {
        method: 'GET',
        headers: withAuthHeaders({ Accept: 'application/json' }),
      });
      const json = await readJsonSafely(response);
      return response.ok ? (Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : []) : [];
    } catch (error) {
      console.error('API Error (getAppointments):', error);
      return [];
    }
  },

  async getDocuments(studentId?: string): Promise<any[]> {
    try {
      const resolvedStudentId = studentId || await this.getCurrentStudentId();
      if (!resolvedStudentId) return [];
      const response = await fetch(`${BASE_API_URL}/documents?studentId=${encodeURIComponent(String(resolvedStudentId))}`, {
        method: 'GET',
        headers: withAuthHeaders({ Accept: 'application/json' }),
      });
      const json = await readJsonSafely(response);
      return response.ok ? (Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : []) : [];
    } catch (error) {
      console.error('API Error (getDocuments):', error);
      return [];
    }
  },

  async getQuestionnaires(studentId?: string): Promise<any[]> {
    try {
      const resolvedStudentId = studentId || await this.getCurrentStudentId();
      if (!resolvedStudentId) return [];
      const response = await fetch(`${BASE_API_URL}/questionnaires?studentId=${encodeURIComponent(String(resolvedStudentId))}`, {
        method: 'GET',
        headers: withAuthHeaders({ Accept: 'application/json' }),
      });
      const json = await readJsonSafely(response);
      return response.ok ? (Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : []) : [];
    } catch (error) {
      console.error('API Error (getQuestionnaires):', error);
      return [];
    }
  },

  async createEvent(payload: any): Promise<any> {
    const response = await fetch(`${BASE_API_URL}/events`, {
      method: 'POST',
      headers: withAuthHeaders({ 'Content-Type': 'application/json', Accept: 'application/json' }),
      body: JSON.stringify(payload),
    });
    const json = await readJsonSafely(response);
    if (!response.ok) throw new Error(getApiErrorMessage(json, 'Failed to create event'));
    return json?.data || json;
  },

  async createAppointment(payload: any): Promise<any> {
    const response = await fetch(`${BASE_API_URL}/appointments`, {
      method: 'POST',
      headers: withAuthHeaders({ 'Content-Type': 'application/json', Accept: 'application/json' }),
      body: JSON.stringify(payload),
    });
    const json = await readJsonSafely(response);
    if (!response.ok) throw new Error(getApiErrorMessage(json, 'Failed to create appointment'));
    return json?.data || json;
  },

  async createDocument(payload: any): Promise<any> {
    const response = await fetch(`${BASE_API_URL}/documents`, {
      method: 'POST',
      headers: withAuthHeaders({ 'Content-Type': 'application/json', Accept: 'application/json' }),
      body: JSON.stringify(payload),
    });
    const json = await readJsonSafely(response);
    if (!response.ok) throw new Error(getApiErrorMessage(json, 'Failed to create document'));
    return json?.data || json;
  },

  async uploadStudentDocument(payload: { studentId: string; file: File; title?: string; description?: string; category?: string; status?: string }): Promise<any> {
    const formData = new FormData();
    formData.append('file', payload.file);
    if (payload.studentId) formData.append('studentId', payload.studentId);
    if (payload.title) formData.append('title', payload.title);
    if (payload.description) formData.append('description', payload.description);
    if (payload.category) formData.append('category', payload.category);
    if (payload.status) formData.append('status', payload.status);

    const response = await fetch(`${BASE_API_URL}/documents/upload`, {
      method: 'POST',
      headers: withAuthHeaders({ Accept: 'application/json' }),
      body: formData,
    });
    const json = await readJsonSafely(response);
    if (!response.ok) throw new Error(getApiErrorMessage(json, 'Failed to upload document'));
    return json?.data || json;
  },

  async downloadStudentDocument(documentId: string): Promise<Response> {
    const response = await fetch(`${BASE_API_URL}/documents/${documentId}/download`, {
      method: 'GET',
      headers: withAuthHeaders({ Accept: '*/*' }),
    });
    if (!response.ok) {
      const json = await readJsonSafely(response);
      throw new Error(getApiErrorMessage(json, 'Failed to download document'));
    }
    return response;
  },

  async requestDocumentSignature(documentId: string, payload?: { participants?: Record<string, { email: string; name: string }> }): Promise<any> {
    const response = await fetch(`${BASE_API_URL}/documents/${documentId}/signature/request`, {
      method: 'POST',
      headers: withAuthHeaders({ 'Content-Type': 'application/json', Accept: 'application/json' }),
      body: JSON.stringify(payload || {}),
    });
    const json = await readJsonSafely(response);
    if (!response.ok) throw new Error(getApiErrorMessage(json, 'Failed to request signature'));
    return json?.data || json;
  },

  async getDocumentSigningLink(documentId: string, payload?: { signerRole?: 'student' | 'cfa' | 'maitre_apprentissage' | 'charge_admission' | 'charge_rh' | 'commercial'; signerEmail?: string; signerName?: string; returnUrl?: string }): Promise<{ signingUrl: string; envelopeId?: string }> {
    const response = await fetch(`${BASE_API_URL}/documents/${documentId}/signature/signing-link`, {
      method: 'POST',
      headers: withAuthHeaders({ 'Content-Type': 'application/json', Accept: 'application/json' }),
      body: JSON.stringify(payload || {}),
    });
    const json = await readJsonSafely(response);
    if (!response.ok) throw new Error(getApiErrorMessage(json, 'Failed to generate signing link'));
    const data = json?.data || json;
    return {
      signingUrl: data?.signingUrl,
      envelopeId: data?.envelopeId,
    };
  },

  async updateAttendance(id: string, payload: any): Promise<any> {
    const response = await fetch(`${BASE_API_URL}/attendances/${id}`, {
      method: 'PUT',
      headers: withAuthHeaders({ 'Content-Type': 'application/json', Accept: 'application/json' }),
      body: JSON.stringify(payload),
    });
    const json = await readJsonSafely(response);
    if (!response.ok) throw new Error(getApiErrorMessage(json, 'Failed to update attendance'));
    return json?.data || json;
  },

  async updateAppointment(id: string, payload: any): Promise<any> {
    const response = await fetch(`${BASE_API_URL}/appointments/${id}`, {
      method: 'PUT',
      headers: withAuthHeaders({ 'Content-Type': 'application/json', Accept: 'application/json' }),
      body: JSON.stringify(payload),
    });
    const json = await readJsonSafely(response);
    if (!response.ok) throw new Error(getApiErrorMessage(json, 'Failed to update appointment'));
    return json?.data || json;
  },

  async updateQuestionnaire(id: string, payload: any): Promise<any> {
    const response = await fetch(`${BASE_API_URL}/questionnaires/${id}`, {
      method: 'PUT',
      headers: withAuthHeaders({ 'Content-Type': 'application/json', Accept: 'application/json' }),
      body: JSON.stringify(payload),
    });
    const json = await readJsonSafely(response);
    if (!response.ok) throw new Error(getApiErrorMessage(json, 'Failed to update questionnaire'));
    return json?.data || json;
  },

  async updateQuestionnaireStatus(id: string, statut: 'pending' | 'in_progress' | 'completed' | 'expired'): Promise<any> {
    const response = await fetch(`${BASE_API_URL}/questionnaires/${id}/status`, {
      method: 'PATCH',
      headers: withAuthHeaders({ 'Content-Type': 'application/json', Accept: 'application/json' }),
      body: JSON.stringify({ statut }),
    });
    const json = await readJsonSafely(response);
    if (!response.ok) throw new Error(getApiErrorMessage(json, 'Failed to update questionnaire status'));
    return json?.data || json;
  },

  // --- OPCO ---
  async getOpcoConfig(): Promise<any> {
    const response = await fetch(`${BASE_API_URL}/opco/config`, {
      method: 'GET',
      headers: withAuthHeaders({ Accept: 'application/json' }),
    });
    const json = await readJsonSafely(response);
    if (!response.ok) throw new Error(getApiErrorMessage(json, 'Impossible de charger la configuration OPCO'));
    return json?.data || json;
  },

  async getOpcoDossiers(params?: { candidateId?: string; studentId?: string; companyId?: string; status?: string }): Promise<any[]> {
    const query = new URLSearchParams();
    if (params?.candidateId) query.set('candidateId', params.candidateId);
    if (params?.studentId) query.set('studentId', params.studentId);
    if (params?.companyId) query.set('companyId', params.companyId);
    if (params?.status) query.set('status', params.status);
    const suffix = query.toString() ? `?${query.toString()}` : '';
    const response = await fetch(`${BASE_API_URL}/opco/dossiers${suffix}`, {
      method: 'GET',
      headers: withAuthHeaders({ Accept: 'application/json' }),
    });
    const json = await readJsonSafely(response);
    if (!response.ok) throw new Error(getApiErrorMessage(json, 'Impossible de charger les dossiers OPCO'));
    return Array.isArray(json?.data) ? json.data : [];
  },

  async getOpcoDossier(id: string): Promise<any> {
    const response = await fetch(`${BASE_API_URL}/opco/dossiers/${id}`, {
      method: 'GET',
      headers: withAuthHeaders({ Accept: 'application/json' }),
    });
    const json = await readJsonSafely(response);
    if (!response.ok) throw new Error(getApiErrorMessage(json, 'Impossible de charger le dossier OPCO'));
    return json?.data || json;
  },

  async createOpcoDossier(payload: { opcoName?: string; candidateId?: string; studentId?: string; companyId?: string; codeNaf?: string; payload: any; metadata?: any; documents?: any[]; autoSubmit?: boolean }): Promise<any> {
    const response = await fetch(`${BASE_API_URL}/opco/dossiers`, {
      method: 'POST',
      headers: withAuthHeaders({ 'Content-Type': 'application/json', Accept: 'application/json' }),
      body: JSON.stringify(payload),
    });
    const json = await readJsonSafely(response);
    if (!response.ok) throw new Error(getApiErrorMessage(json, 'Impossible de creer le dossier OPCO'));
    return json?.data || json;
  },

  async resubmitOpcoDossier(id: string): Promise<any> {
    const response = await fetch(`${BASE_API_URL}/opco/dossiers/${id}/resubmit`, {
      method: 'POST',
      headers: withAuthHeaders({ Accept: 'application/json' }),
    });
    const json = await readJsonSafely(response);
    if (!response.ok) throw new Error(getApiErrorMessage(json, 'Impossible de renvoyer le dossier OPCO'));
    return json?.data || json;
  },

  async syncOpcoDossier(id: string): Promise<any> {
    const response = await fetch(`${BASE_API_URL}/opco/dossiers/${id}/sync`, {
      method: 'POST',
      headers: withAuthHeaders({ Accept: 'application/json' }),
    });
    const json = await readJsonSafely(response);
    if (!response.ok) throw new Error(getApiErrorMessage(json, 'Impossible de synchroniser le dossier OPCO'));
    return json?.data || json;
  },

  // --- ENTREPRISE (CRUD) ---
  async submitCompany(data: CompanyFormData, role?: string): Promise<ApiResponse> {
    try {
      const payload = mapCompanyToBackend(data, role);
      console.log('📦 Submitting Company. Validation:', payload.validation, '| User:', payload.utilisateur);
      console.log('📦 Full Payload:', payload);
      const response = await fetch(`${BASE_URL}/entreprise`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        console.error(`❌ Company Submission Failed (${response.status}):`, response.statusText);
        throw new Error(`Submission failed: ${response.status}`);
      }
      const json = await response.json();
      console.log('✅ Company Submission Success. Full Response:', json);
      return {
        success: true,
        data: json,
        // Helper fields for the frontend to update local state immediately if needed
        entreprise_info: {
          id: json.id || json.record_id,
          raison_sociale: payload.identification?.raison_sociale
        }
      };
    } catch (error: any) {
      console.error('❌ Company Submission Error:', error);
      throw error;
    }
  },

  async getAllCompanies(): Promise<any[]> {
    try {
      console.log('Fetching All Companies');
      const response = await fetch(`${BASE_URL}/entreprises`, { method: 'GET', headers: { 'Accept': 'application/json' } });
      const json = await readJsonSafely(response);
      if (!response.ok) {
        const message = getApiErrorMessage(json, `Failed to fetch companies (${response.status})`);
        throw new Error(message);
      }
      const data = json.data || json;
      const companies = Array.isArray(data) ? data.map(c => looksLikeBackendRecord(c) ? mapBackendToCompany(c) : c) : [];
      console.log('All Companies Received, count:', companies.length);
      return companies;
    } catch (error) {
      console.error('API Error (getAllCompanies):', error);
      return [];
    }
  },

  async getCompanyById(id: string): Promise<any> {
    try {
      console.log('📦 Fetching Company:', id);
      const response = await fetch(`${BASE_URL}/candidats/${id}/entreprise`, { method: 'GET', headers: { 'Accept': 'application/json' } });
      if (!response.ok) throw new Error('Company not found');
      const json = await response.json();
      console.log('📤 Company Received:', json);

      // Return raw record (id, fields) directly for modal view compatibility
      return json.data || json;
    } catch (error) { throw error; }
  },

  async getCompanyByStudentId(studentId: string): Promise<any> {
    try {
      console.log('📦 Fetching Company for Student:', studentId);
      const response = await fetch(`${BASE_URL}/candidats/${studentId}/entreprise`, { method: 'GET', headers: { 'Accept': 'application/json' } });
      if (!response.ok) throw new Error('Company not found for this student');
      const json = await response.json();
      console.log('📤 Company for Student Received:', json);

      // Return raw record (id, fields) directly for modal view compatibility
      return json.data || json;
    } catch (error) { throw error; }
  },

  async updateCompany(studentId: string, data: any, originalData?: any, role?: string): Promise<any> {
    try {
      const payload = mapCompanyToBackend(data, role);
      let finalPayload = payload;

      if (originalData) {
        const originalPayload = mapCompanyToBackend(originalData, role);
        finalPayload = diffObjects(originalPayload, payload);
        // Always include utilisateur and validation status for history tracking
        finalPayload.utilisateur = payload.utilisateur;
        finalPayload.validation = payload.validation;
        console.log('🔄 Diff result with audit fields:', finalPayload);

        if (Object.keys(finalPayload).length === 0) {
          console.log('⏭️  No changes detected, skipping update.');
          return { success: true, message: "No changes detected" };
        }
      }

      console.log('📦 Updating Company for Student ID:', studentId);
      console.log('📦 Validation:', payload.validation, '| User:', payload.utilisateur);
      console.log('📦 Updating Company Payload (Partial/Diff):', finalPayload);
      const response = await fetch(`${BASE_URL}/entreprises/${studentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(finalPayload),
      });
      if (!response.ok) {
        console.error(`❌ Company Update Failed (${response.status}):`, response.statusText);
        throw new Error('Update company failed');
      }
      return await response.json();
    } catch (error) {
      console.error('❌ Company Update Error:', error);
      throw error;
    }
  },

  
  async deleteCompany(studentId: string): Promise<boolean> {
    try {
      console.log('📤 Deleting Company for Student:', studentId);
      const response = await fetch(`${BASE_URL}/entreprises/${studentId}`, {
        method: 'DELETE',
        headers: { 'Accept': 'application/json' }
      });
      console.log('📥 Delete Company Status:', response.status);
      return response.ok;
    } catch (error) {
      console.error('❌ Delete Company Error:', error);
      return false;
    }
  },

  // --- HISTORY ---
  async getGlobalHistory(): Promise<any[]> {
    try {
      console.log('📦 Fetching Global History');
      const response = await fetch(`${BASE_URL}/historique-utilisateurs`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      if (!response.ok) throw new Error('Global history not found');
      const json = await response.json();
      
      const rawData = json.data || [];
      const flattenedHistory: any[] = [];

      rawData.forEach((group: any) => {
        const user = group.utilisateur || "Utilisateur inconnu";
        
        // Map Students
        if (Array.isArray(group.eleves)) {
          group.eleves.forEach((e: any, idx: number) => {
            flattenedHistory.push({
              id: `e-${group.utilisateur}-${e.record_id}-${idx}`,
              action: 'Modification Étudiant',
              details: `Mise à jour du dossier de ${e.prenom || ''} ${e.nom || ''} (${e.email || 'Pas d\'email'})`,
              date: e.date_action || new Date().toISOString(),
              utilisateur: user,
              studentId: e.record_id
            });
          });
        }
        
        // Map Entreprises
        if (Array.isArray(group.entreprises)) {
          group.entreprises.forEach((ent: any, idx: number) => {
            flattenedHistory.push({
              id: `ent-${group.utilisateur}-${ent.record_id}-${idx}`,
              action: 'Modification Entreprise',
              details: `Mise à jour de la fiche de ${ent.raison_sociale || 'Entreprise inconnue'} (SIRET: ${ent.siret || 'N/A'})`,
              date: ent.date_action || new Date().toISOString(),
              utilisateur: user,
              studentId: ent.record_id_etudiant
            });
          });
        }
      });

      // Sort by date desc
      return flattenedHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
      console.warn('⚠️ Global History API error:', error);
      return [];
    }
  },

  async getHistory(studentId: string): Promise<any[]> {
    try {
      const allHistory = await this.getGlobalHistory();
      // Filter for specific student if ID is provided
      return allHistory.filter(item => item.studentId === studentId);
    } catch (error) {
      console.warn('⚠️ Student History filter error:', error);
      return [];
    }
  },

  async addHistory(entry: Partial<{ studentId: string, action: string, details: string, utilisateur: string }>): Promise<any> {
    try {
      const response = await fetch(`${BASE_URL}/historique`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(entry)
      });
      if (!response.ok) throw new Error('Failed to add history');
      return await response.json();
    } catch (e) {
      console.error('Add History failed:', e);
      return { success: true, ...entry, date: new Date().toISOString(), id: 'local-' + Date.now() };
    }
  },

  // --- EVALUATIONS ---
  async saveInterviewEvaluation(data: any): Promise<any> {
    try {
      console.log('📦 Saving Interview Evaluation:', data);
      const response = await fetch(`${BASE_URL}/entretiens/evaluation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to save evaluation');
      return await response.json();
    } catch (error) {
      console.error('❌ Error saving evaluation:', error);
      throw error;
    }
  },

  async submitAdmissionResult(email: string, file: Blob): Promise<any> {
    try {
      console.log('📦 Submitting Admission Result PDF for:', email);
      const formData = new FormData();
      formData.append('email', email);
      formData.append('file', file, `Admission_Result_${email.replace(/@/g, '_at_')}.pdf`);

      const response = await fetch(`${BASE_API_URL}/admission/resultats-pdf`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || `Upload failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Error submitting admission result:', error);
      throw error;
    }
  },

  async submitInterviewResult(email: string, file: Blob): Promise<any> {
    try {
      console.log('📦 Submitting Interview Result PDF for:', email);
      const formData = new FormData();
      formData.append('email', email);
      formData.append('file', file, `Entretien_${email.replace(/@/g, '_at_')}.pdf`);

      const response = await fetch(`${BASE_API_URL}/admission/suivie-entretien`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || `Upload failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Error submitting interview result:', error);
      throw error;
    }
  },

  async submitProjetPro(email: string, file: Blob): Promise<any> {
    try {
      console.log('📦 Submitting Projet Pro PDF for:', email);
      const formData = new FormData();
      formData.append('email', email);
      formData.append('file', file, `Projet_Pro_${email.replace(/@/g, '_at_')}.pdf`);

      const response = await fetch(`${BASE_API_URL}/admission/projet-pro`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || `Upload failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Error submitting projet pro:', error);
      throw error;
    }
    },

  async uploadBugScreenshot(file: File): Promise<string> {
    const uploadPaths = [
      `${SUPPORT_URL}/bugs/upload-screenshot`,
      `${SUPPORT_URL}/upload-screenshot`,
    ];

    let lastError: string | null = null;

    for (const url of uploadPaths) {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(url, {
        method: 'POST',
        headers: withAuthHeaders({
          Accept: 'application/json',
        }),
        body: formData,
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        lastError = data?.error || data?.message || `Upload screenshot impossible (${response.status})`;
        if (response.status === 404) {
          continue;
        }
        throw new Error(lastError ?? 'Erreur inconnue lors de la génération de la capture d\'écran');
      }

      const screenshotUrl = data?.data?.screenshotUrl;
      if (!screenshotUrl || typeof screenshotUrl !== 'string') {
        throw new Error('URL de capture invalide retournee par le serveur');
      }

      return screenshotUrl;
    }

    throw new Error(lastError || 'Route upload screenshot introuvable sur le backend');
  },

  async createBugReport(payload: {
    title: string;
    description: string;
    module?: 'admission' | 'rh' | 'commercial' | 'other';
    priority?: 'low' | 'medium' | 'high' | 'critical';
    reporterRole?: string;
    reporterName?: string;
    reporterEmail?: string;
    pagePath?: string;
    screenshotUrl?: string;
    assignee?: string;
    deadline?: string;
  }): Promise<any> {
    const response = await fetch(`${SUPPORT_URL}/bugs`, {
      method: 'POST',
      headers: withAuthHeaders({
        'Content-Type': 'application/json',
        Accept: 'application/json',
      }),
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const msg = data?.error || data?.message || `Impossible de signaler le bug (${response.status})`;
      console.error('Support API error (createBugReport):', {
        status: response.status,
        body: data,
        payload,
      });
      throw new Error(msg);
    }
    return data;
  },

  async getBugReports(params?: {
    status?: 'new' | 'in_progress' | 'resolved';
    module?: 'admission' | 'rh' | 'commercial' | 'other';
    priority?: 'low' | 'medium' | 'high' | 'critical';
    search?: string;
    scope?: 'all' | 'mine';
    requesterRole?: string;
    reporterRole?: string;
    reporterEmail?: string;
  }): Promise<{ data: any[]; pagination?: any }> {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.module) query.set('module', params.module);
    if (params?.priority) query.set('priority', params.priority);
    if (params?.search) query.set('search', params.search);
    if (params?.scope) query.set('scope', params.scope);
    if (params?.requesterRole) query.set('requesterRole', params.requesterRole);
    if (params?.reporterRole) query.set('reporterRole', params.reporterRole);
    if (params?.reporterEmail) query.set('reporterEmail', params.reporterEmail);

    const response = await fetch(`${SUPPORT_URL}/bugs?${query.toString()}`, {
      method: 'GET',
      headers: withAuthHeaders({ Accept: 'application/json' }),
    });

    const json = await response.json().catch(() => ({}));
    if (!response.ok) {
      const safeEmpty = { data: [], pagination: { page: 1, limit: 50, total: 0, pages: 0 } };
      if (response.status === 404) {
        console.warn('Support endpoint not available on this backend:', SUPPORT_URL + '/bugs');
        return safeEmpty;
      }
      console.error('Support API error (getBugReports):', {
        status: response.status,
        body: json
      });
      if (response.status >= 500) {
        return safeEmpty;
      }
      throw new Error(json?.error || `Impossible de charger les tickets (${response.status})`);
    }

    return {
      data: Array.isArray(json?.data) ? json.data : [],
      pagination: json?.pagination,
    };
  },

  async updateBugStatus(id: string, status: 'new' | 'in_progress' | 'resolved', requesterRole: string): Promise<any> {
    const response = await fetch(`${SUPPORT_URL}/bugs/${id}/status`, {
      method: 'PATCH',
      headers: withAuthHeaders({
        'Content-Type': 'application/json',
        Accept: 'application/json',
      }),
      body: JSON.stringify({ status, requesterRole }),
    });

    const json = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(json?.error || 'Impossible de mettre à jour le statut');
    }
    return json;
  },

  async updateBugReport(id: string, payload: {
    title?: string;
    description?: string;
    module?: 'admission' | 'rh' | 'commercial' | 'other';
    priority?: 'low' | 'medium' | 'high' | 'critical';
    screenshotUrl?: string;
    assignee?: string;
    deadline?: string;
    requesterRole?: string;
  }): Promise<any> {
    const response = await fetch(`${SUPPORT_URL}/bugs/${id}`, {
      method: 'PATCH',
      headers: withAuthHeaders({
        'Content-Type': 'application/json',
        Accept: 'application/json',
      }),
      body: JSON.stringify(payload),
    });

    const json = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(json?.error || 'Impossible de mettre à jour le ticket');
    }
    return json;
  },

  async deleteBugReport(id: string, requesterRole?: string): Promise<any> {
    const query = requesterRole ? `?requesterRole=${encodeURIComponent(requesterRole)}` : '';
    const response = await fetch(`${SUPPORT_URL}/bugs/${id}${query}`, {
      method: 'DELETE',
      headers: withAuthHeaders({
        Accept: 'application/json',
      }),
    });

    const json = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(json?.error || 'Impossible de supprimer le ticket');
    }
    return json;
  }
};
