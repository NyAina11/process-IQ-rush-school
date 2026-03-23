export interface SelectOption {
    value: string;
    label: string;
    disabled?: boolean;
}

const toOptions = (arr: string[]): SelectOption[] => arr.map(v => ({ value: v, label: v }));

export const NATIONALITY_OPTIONS: SelectOption[] = [
    { value: 'Française', label: 'Française' },
    { value: 'Union Européenne', label: 'Union Européenne' },
    { value: 'Etranger hors Union Européenne', label: 'Etranger hors Union Européenne' }
];

export const SEXE_OPTIONS: SelectOption[] = [
    { value: 'Féminin', label: 'Féminin' },
    { value: 'Masculin', label: 'Masculin' }
];

export const DEPARTMENT_OPTIONS: SelectOption[] = [
    { value: "976 Mayotte", label: "976 Mayotte" },
    { value: "974 La Réunion", label: "974 La Réunion" },
    { value: "973 Guyane", label: "973 Guyane" },
    { value: "972 Martinique", label: "972 Martinique" },
    { value: "971 Guadeloupe", label: "971 Guadeloupe" },
    { value: "95 Val-d'Oise", label: "95 Val-d'Oise" },
    { value: "94 Val-de-Marne", label: "94 Val-de-Marne" },
    { value: "93 Seine-Saint-Denis", label: "93 Seine-Saint-Denis" },
    { value: "92 Hauts-de-Seine", label: "92 Hauts-de-Seine" },
    { value: "91 Essonne", label: "91 Essonne" },
    { value: "90 Territoire de Belfort", label: "90 Territoire de Belfort" },
    { value: "89 Yonne", label: "89 Yonne" },
    { value: "88 Vosges", label: "88 Vosges" },
    { value: "87 Haute-Vienne", label: "87 Haute-Vienne" },
    { value: "86 Vienne", label: "86 Vienne" },
    { value: "85 Vendée", label: "85 Vendée" },
    { value: "84 Vaucluse", label: "84 Vaucluse" },
    { value: "83 Var", label: "83 Var" },
    { value: "82 Tarn-et-Garonne", label: "82 Tarn-et-Garonne" },
    { value: "81 Tarn", label: "81 Tarn" },
    { value: "80 Somme", label: "80 Somme" },
    { value: "79 Deux-Sèvres", label: "79 Deux-Sèvres" },
    { value: "78 Yvelines", label: "78 Yvelines" },
    { value: "77 Seine-et-Marne", label: "77 Seine-et-Marne" },
    { value: "76 Seine-Maritime", label: "76 Seine-Maritime" },
    { value: "75 Paris", label: "75 Paris" },
    { value: "74 Haute-Savoie", label: "74 Haute-Savoie" },
    { value: "73 Savoie", label: "73 Savoie" },
    { value: "72 Sarthe", label: "72 Sarthe" },
    { value: "71 Saône-et-Loire", label: "71 Saône-et-Loire" },
    { value: "70 Haute-Saône", label: "70 Haute-Saône" },
    { value: "69 Rhône", label: "69 Rhône" },
    { value: "68 Haut-Rhin", label: "68 Haut-Rhin" },
    { value: "67 Bas-Rhin", label: "67 Bas-Rhin" },
    { value: "66 Pyrénées-Orientales", label: "66 Pyrénées-Orientales" },
    { value: "65 Hautes-Pyrénées", label: "65 Hautes-Pyrénées" },
    { value: "64 Pyrénées-Atlantiques", label: "64 Pyrénées-Atlantiques" },
    { value: "63 Puy-de-Dôme", label: "63 Puy-de-Dôme" },
    { value: "62 Pas-de-Calais", label: "62 Pas-de-Calais" },
    { value: "61 Orne", label: "61 Orne" },
    { value: "60 Oise", label: "60 Oise" },
    { value: "59 Nord", label: "59 Nord" },
    { value: "58 Nièvre", label: "58 Nièvre" },
    { value: "57 Moselle", label: "57 Moselle" },
    { value: "56 Morbihan", label: "56 Morbihan" },
    { value: "55 Meuse", label: "55 Meuse" },
    { value: "54 Meurthe-et-Moselle", label: "54 Meurthe-et-Moselle" },
    { value: "53 Mayenne", label: "53 Mayenne" },
    { value: "52 Haute-Marne", label: "52 Haute-Marne" },
    { value: "51 Marne", label: "51 Marne" },
    { value: "50 Manche", label: "50 Manche" },
    { value: "49 Maine-et-Loire", label: "49 Maine-et-Loire" },
    { value: "48 Lozère", label: "48 Lozère" },
    { value: "47 Lot-et-Garonne", label: "47 Lot-et-Garonne" },
    { value: "46 Lot", label: "46 Lot" },
    { value: "45 Loiret", label: "45 Loiret" },
    { value: "44 Loire-Atlantique", label: "44 Loire-Atlantique" },
    { value: "43 Haute-Loire", label: "43 Haute-Loire" },
    { value: "42 Loire", label: "42 Loire" },
    { value: "41 Loir-et-Cher", label: "41 Loir-et-Cher" },
    { value: "40 Landes", label: "40 Landes" },
    { value: "39 Jura", label: "39 Jura" },
    { value: "38 Isère", label: "38 Isère" },
    { value: "37 Indre-et-Loire", label: "37 Indre-et-Loire" },
    { value: "36 Indre", label: "36 Indre" },
    { value: "35 Ille-et-Vilaine", label: "35 Ille-et-Vilaine" },
    { value: "34 Hérault", label: "34 Hérault" },
    { value: "33 Gironde", label: "33 Gironde" },
    { value: "32 Gers", label: "32 Gers" },
    { value: "31 Haute-Garonne", label: "31 Haute-Garonne" },
    { value: "30 Gard", label: "30 Gard" },
    { value: "2B Haute-Corse", label: "2B Haute-Corse" },
    { value: "2A Corse-du-Sud", label: "2A Corse-du-Sud" },
    { value: "29 Finistère", label: "29 Finistère" },
    { value: "28 Eure-et-Loir", label: "28 Eure-et-Loir" },
    { value: "27 Eure", label: "27 Eure" },
    { value: "26 Drôme", label: "26 Drôme" },
    { value: "25 Doubs", label: "25 Doubs" },
    { value: "24 Dordogne", label: "24 Dordogne" },
    { value: "23 Creuse", label: "23 Creuse" },
    { value: "22 Côtes-d'Armor", label: "22 Côtes-d'Armor" },
    { value: "21 Côte-d'Or", label: "21 Côte-d'Or" },
    { value: "19 Corrèze", label: "19 Corrèze" },
    { value: "18 Cher", label: "18 Cher" },
    { value: "17 Charente-Maritime", label: "17 Charente-Maritime" },
    { value: "16 Charente", label: "16 Charente" },
    { value: "15 Cantal", label: "15 Cantal" },
    { value: "14 Calvados", label: "14 Calvados" },
    { value: "13 Bouches-du-Rhône", label: "13 Bouches-du-Rhône" },
    { value: "12 Aveyron", label: "12 Aveyron" },
    { value: "11 Aude", label: "11 Aude" },
    { value: "10 Aube", label: "10 Aube" },
    { value: "09 Ariège", label: "09 Ariège" },
    { value: "08 Ardennes", label: "08 Ardennes" },
    { value: "07 Ardèche", label: "07 Ardèche" },
    { value: "06 Alpes-Maritimes", label: "06 Alpes-Maritimes" },
    { value: "05 Hautes-Alpes", label: "05 Hautes-Alpes" },
    { value: "04 Alpes-de-Haute-Provence", label: "04 Alpes-de-Haute-Provence" },
    { value: "03 Allier", label: "03 Allier" },
    { value: "099 personne née à l'étranger", label: "099 personne née à l'étranger" }
];

export const SITUATION_BEFORE_CONTRACT_OPTIONS: SelectOption[] = [
    { value: '1 Scolaire', label: '1 Scolaire' },
    { value: '2 Prépa apprentissage', label: '2 Prépa apprentissage' },
    { value: '3 Etudiant', label: '3 Etudiant' },
    { value: '4 Contrat dapprentissage', label: '4 Contrat dapprentissage' },
    { value: '5 Contrat de professionnalisation', label: '5 Contrat de professionnalisation' },
    { value: '6 Contrat aidé', label: '6 Contrat aidé' },
    { value: '7 En formation au CFA sous statut de stagiaire de la formation professionnelle, avant conclusion dun contrat dapprentissage (L6222-12-1 du code du travail)', label: '7 En formation au CFA sous statut de stagiaire de la formation professionnelle, avant conclusion d’un contrat d’apprentissage (L6222-12-1 du code du travail)' },
    { value: '8 En formation, au CFA sans contrat sous statut de stagiaire de la formation professionnelle, à la suite dune rupture dun précédent contrat (5° de L6231-2 du code du travail)', label: '8 En formation, au CFA sans contrat sous statut de stagiaire de la formation professionnelle, à la suite d’une rupture d’un précédent contrat (5° de L6231-2 du code du travail)' },
    { value: '9 Autres situations sous statut de stagiaire de la formation professionnelle', label: '9 Autres situations sous statut de stagiaire de la formation professionnelle' },
    { value: '10 Salarié', label: '10 Salarié' },
    { value: '11 Personne à la recherche dun emploi (inscrite ou non à Pôle Emploi)', label: '11 Personne à la recherche d’un emploi (inscrite ou non à Pôle Emploi)' },
    { value: '12 Inactif', label: '12 Inactif' }
];

export const REGIME_SOCIAL_OPTIONS: SelectOption[] = [
    { value: 'Sécurité Sociale', label: 'URSSAF / Sécurité Sociale' },
    { value: 'MSA', label: 'MSA (Mutualité Sociale Agricole)' }
];

export const DIPLOMA_PREPARED_OPTIONS: SelectOption[] = toOptions([
    'Baccalauréat Technologique',
    'Baccalauréat général',
    'Baccalauréat pro',
    'Brevet',
    'CAP',
    'BTS',
    'Aucun diplôme'
]);

export const DETAILED_DIPLOMA_OPTIONS: SelectOption[] = [
    { value: "header1", label: "Diplôme ou titre de niveau bac +5 et plus", disabled: true },
    { value: "80 Doctorat", label: "80 Doctorat" },
    { value: "73 Master", label: "73 Master" },
    { value: "75 Diplôme d'ingénieur", label: "75 Diplôme d'ingénieur" },
    { value: "76 Diplôme d'école de commerce", label: "76 Diplôme d'école de commerce" },
    { value: "79 Autre diplôme ou titre de niveau bac+5 ou plus", label: "79 Autre diplôme ou titre de niveau bac+5 ou plus" },
    { value: "header2", label: "Diplôme ou titre de niveau bac +3 et 4", disabled: true },
    { value: "62 Licence professionnelle", label: "62 Licence professionnelle" },
    { value: "63 Licence générale", label: "63 Licence générale" },
    { value: "64 Bachelor universitaire de technologie BUT", label: "64 Bachelor universitaire de technologie BUT" },
    { value: "69 Autre diplôme ou titre de niveau bac +3 ou 4", label: "69 Autre diplôme ou titre de niveau bac +3 ou 4" },
    { value: "header3", label: "Diplôme ou titre de niveau bac +2", disabled: true },
    { value: "54 Brevet de Technicien Supérieur", label: "54 Brevet de Technicien Supérieur" },
    { value: "55 Diplôme Universitaire de technologie", label: "55 Diplôme Universitaire de technologie" },
    { value: "58 Autre diplôme ou titre de niveau bac+2", label: "58 Autre diplôme ou titre de niveau bac+2" },
    { value: "header4", label: "Diplôme ou titre de niveau bac", disabled: true },
    { value: "41 Baccalauréat professionnel", label: "41 Baccalauréat professionnel" },
    { value: "42 Baccalauréat général", label: "42 Baccalauréat général" },
    { value: "43 Baccalauréat technologique", label: "43 Baccalauréat technologique" },
    { value: "44 Diplôme de spécialisation professionnelle", label: "44 Diplôme de spécialisation professionnelle" },
    { value: "49 Autre diplôme ou titre de niveau bac", label: "49 Autre diplôme ou titre de niveau bac" },
    { value: "header5", label: "Diplôme ou titre de niveau CAP/BEP", disabled: true },
    { value: "33 CAP", label: "33 CAP" },
    { value: "34 BEP", label: "34 BEP" },
    { value: "35 Certificat de spécialisation (ex-Mention complémentaire)", label: "35 Certificat de spécialisation (ex-Mention complémentaire)" },
    { value: "38 Autre diplôme ou titre de niveau CAP/BEP", label: "38 Autre diplôme ou titre de niveau CAP/BEP" },
    { value: "header6", label: "Aucun diplôme ni titre", disabled: true },
    { value: "25 Diplôme national du Brevet", label: "25 Diplôme national du Brevet" },
    { value: "26 Certificat de formation générale", label: "26 Certificat de formation générale" },
    { value: "13 Aucun diplôme ni titre professionnel", label: "13 Aucun diplôme ni titre professionnel" }
];

export const LAST_CLASS_OPTIONS: SelectOption[] = [
    { value: 'Diplôme obtenu', label: '01 l’apprenti a suivi la dernière année du cycle de formation et a obtenu le diplôme ou titre' },
    { value: '1ère année suivie et validée', label: '11 l’apprenti a suivi la 1ère année du cycle et l’a validée (examens réussis mais année non diplômante)' },
    { value: '1ère année suivie non validée', label: '12 l’apprenti a suivi la 1ère année du cycle mais ne l’a pas validée (échec aux examens, interruption ou abandon de formation)' },
    { value: '2ème année suivie et validée', label: '21 l’apprenti a suivi la 2è année du cycle et l’a validée (examens réussis mais année non diplômante)' },
    { value: '2ème année suivie non validée', label: '22 l’apprenti a suivi la 2è année du cycle mais ne l’a pas validée (échec aux examens, interruption ou abandon de formation)' },
    { value: '3ème année suivie et validée', label: '31 l’apprenti a suivi la 3è année du cycle et l’a validée (examens réussis mais année non diplômante, cycle adaptés)' },
    { value: '3ème année suivie non validée', label: '32 l’apprenti a suivi la 3è année du cycle mais ne l’a pas validée (échec aux examens, interruption ou abandon de formation)' },
    { value: 'Fin du collège', label: '40 l’apprenti a achevé le 1er cycle de l’enseignement secondaire (collège)' },
    { value: 'Études interrompues en 3ème', label: '41 l’apprenti a interrompu ses études en classe de 3è' },
    { value: 'Études interrompues en 4ème', label: '42 l’apprenti a interrompu ses études en classe de 4è' }
];

export const HIGHEST_DIPLOMA_OPTIONS: SelectOption[] = [
    { value: "header1", label: "Diplôme ou titre de niveau bac +5 et plus", disabled: true },
    { value: "Doctorat", label: "80 Doctorat" },
    { value: "Master", label: "73 Master" },
    { value: "Diplôme ingénieur", label: "75 Diplôme d'ingénieur" },
    { value: "Diplôme école de commerce", label: "76 Diplôme d'école de commerce" },
    { value: "Autre diplôme ou titre bac +5 ou plus", label: "79 Autre diplôme ou titre de niveau bac+5 ou plus" },
    
    { value: "header2", label: "Diplôme ou titre de niveau bac +3 et 4", disabled: true },
    { value: "Licence professionnelle", label: "62 Licence professionnelle" },
    { value: "Licence générale", label: "63 Licence générale" },
    { value: "Bachelor universitaire de technologie (BUT)", label: "64 Bachelor universitaire de technologie BUT" },
    { value: "Bachelor RDC", label: "64 Bachelor universitaire de technologie BUT" },
    { value: "Autre diplôme ou titre bac +3 ou 4", label: "69 Autre diplôme ou titre de niveau bac +3 ou 4" },
    
    { value: "header3", label: "Diplôme ou titre de niveau bac +2", disabled: true },
    { value: "Brevet de Technicien Supérieur (BTS)", label: "54 Brevet de Technicien Supérieur" },
    { value: "BTS", label: "54 Brevet de Technicien Supérieur" },
    { value: "BTS MCO", label: "54 Brevet de Technicien Supérieur" },
    { value: "BTS NDRC", label: "54 Brevet de Technicien Supérieur" },
    { value: "BTS COM", label: "54 Brevet de Technicien Supérieur" },
    { value: "TP NTC", label: "54 Brevet de Technicien Supérieur" },
    { value: "Diplôme Universitaire de Technologie (DUT)", label: "55 Diplôme Universitaire de technologie" },
    { value: "DUT", label: "55 Diplôme Universitaire de technologie" },
    { value: "Autre diplôme ou titre bac +2", label: "58 Autre diplôme ou titre de niveau bac+2" },
    
    { value: "header4", label: "Diplôme ou titre de niveau bac", disabled: true },
    { value: "Baccalauréat professionnel", label: "41 Baccalauréat professionnel" },
    { value: "Bac Pro", label: "41 Baccalauréat professionnel" },
    { value: "Baccalauréat général", label: "42 Baccalauréat général" },
    { value: "Bac général", label: "42 Baccalauréat général" },
    { value: "Baccalauréat technologique", label: "43 Baccalauréat technologique" },
    { value: "Bac techno", label: "43 Baccalauréat technologique" },
    { value: "Diplôme de spécialisation professionnelle", label: "44 Diplôme de spécialisation professionnelle" },
    { value: "Autre diplôme ou titre niveau bac", label: "49 Autre diplôme ou titre de niveau bac" },
    
    { value: "header5", label: "Diplôme ou titre de niveau CAP/BEP", disabled: true },
    { value: "CAP", label: "33 CAP" },
    { value: "BEP", label: "34 BEP" },
    { value: "Certificat de spécialisation", label: "35 Certificat de spécialisation (ex-Mention complémentaire)" },
    { value: "Autre diplôme ou titre CAP/BEP", label: "38 Autre diplôme ou titre de niveau CAP/BEP" },
    
    { value: "header6", label: "Aucun diplôme ni titre", disabled: true },
    { value: "Diplôme National du Brevet", label: "25 Diplôme national du Brevet" },
    { value: "Brevet", label: "25 Diplôme national du Brevet" },
    { value: "Certificat de Formation Générale", label: "26 Certificat de formation générale" },
    { value: "Aucun diplôme ni titre professionnel", label: "13 Aucun diplôme ni titre" },
    { value: "Aucun", label: "13 Aucun diplôme ni titre" }
];

export const FORMATION_SOUHAITEE_OPTIONS: SelectOption[] = [
    { value: 'BTS MCO A', label: 'BTS MCO A' },
    { value: 'BTS MCO 2', label: 'BTS MCO 2' },
    { value: 'BTS NDRC 1', label: 'BTS NDRC 1' },
    { value: 'BTS COM', label: 'BTS COM' },
    { value: 'Titre Pro NTC', label: 'Titre Pro NTC' },
    { value: 'Titre Pro NTC B', label: 'Titre Pro NTC B' },
    { value: 'Bachelor RDC', label: 'Bachelor RDC' }
];

export const ENTREPRISE_ACCUEIL_OPTIONS: SelectOption[] = [
    { value: 'Oui', label: 'Oui' },
    { value: 'En recherche', label: 'En recherche' },
    { value: 'Non', label: 'Non' }
];

export const EVALUATION_FORMATION_OPTIONS: SelectOption[] = [
    { value: 'TP NTC', label: 'TP NTC' },
    { value: 'BTS CI', label: 'BTS CI' },
    { value: 'BTS COM', label: 'BTS COM' },
    { value: 'BTS MCO', label: 'BTS MCO' },
    { value: 'BTS NDRC', label: 'BTS NDRC' },
    { value: 'BACHELOR RDC', label: 'BACHELOR RDC' }
];

export const KNOW_RUSH_SCHOOL_OPTIONS: SelectOption[] = [
    { value: 'reseaux_sociaux', label: 'Réseaux sociaux' },
    { value: 'google', label: 'Recherche Google' },
    { value: 'parcoursup', label: 'Parcoursup' },
    { value: 'salon', label: 'Salon / Forum' },
    { value: 'bouche_oreille', label: 'Bouche à oreille' },
    { value: 'autre', label: 'Autre' }
];

// Entreprise Form Specific
export const EMPLOYER_TYPE_OPTIONS: SelectOption[] = [
    { value: "11 Entreprise inscrite au répertoire des métiers ou au registre des entreprises pour l Alsace-Moselle", label: "11 - Entreprise inscrite au répertoire des métiers ou au registre des entreprises pour l'Alsace-Moselle" },
    { value: "12 Entreprise inscrite uniquement au registre du commerce et des sociétés", label: "12 - Entreprise inscrite uniquement au registre du commerce et des sociétés" },
    { value: "13 Entreprises dont les salariés relèvent de la mutualité sociale agricole", label: "13 - Entreprises dont les salariés relèvent de la mutualité sociale agricole" },
    { value: "14 Profession libérale", label: "14 - Profession libérale" },
    { value: "15 Association", label: "15 - Association" },
    { value: "16 Autre employeur privé", label: "16 - Autre employeur privé" },
    { value: "21 Service de l État (administrations centrales et leurs services déconcentrés)", label: "21 - Service de l'État (administrations centrales et leurs services déconcentrés)" },
    { value: "22 Commune", label: "22 - Commune" },
    { value: "23 Département", label: "23 - Département" },
    { value: "24 Région", label: "24 - Région" },
    { value: "25 Etablissement public hospitalier", label: "25 - Etablissement public hospitalier" },
    { value: "26 Etablissement public local d enseignement", label: "26 - Etablissement public local d'enseignement" },
    { value: "27 Etablissement public administratif de l Etat", label: "27 - Etablissement public administratif de l'État" },
    { value: "28 Etablissement public administratif local (y compris établissement public de coopération intercommunale EPCI)", label: "28 - Etablissement public administratif local (y compris EPCI)" },
    { value: "29 Autre employeur public", label: "29 - Autre employeur public" },
    { value: "30 Etablissement public industriel et commercial", label: "30 - Etablissement public industriel et commercial" }
];

export const EMPLOYER_SPECIFIC_OPTIONS: SelectOption[] = [
    { value: "Entreprise de travail temporaire", label: "1 Entreprise de travail temporaire" },
    { value: "Groupement demployeurs", label: "2 Groupement d’employeurs" },
    { value: "Employeur saisonnier", label: "3 Employeur saisonnier" },
    { value: "Apprentissage familial", label: "4 Apprentissage familial : l’employeur est un ascendant de l’apprenti" },
    { value: "Aucun de ces cas", label: "0 Aucun de ces cas" }
];

export const MAITRE_DIPLOMA_OPTIONS: SelectOption[] = [
    { value: "Aucun diplôme", label: "Aucun diplôme" },
    { value: "CAP, BEP", label: "CAP, BEP" },
    { value: "Baccalauréat", label: "Baccalauréat" },
    { value: "DEUG, BTS, DUT, DEUST", label: "DEUG, BTS, DUT, DEUST" },
    { value: "Licence, Licence professionnelle, BUT, Maîtrise", label: "Licence, Licence professionnelle, BUT, Maîtrise" },
    { value: "Master, Diplôme d études approfondies, Diplôme d études spécialisées, Diplôme d ingénieur", label: "Master, DEA, DESS, Diplôme d'ingénieur" },
    { value: "Doctorat, Habilitation à diriger des recherches", label: "Doctorat, HDR" }
];

export const OPCO_OPTIONS: SelectOption[] = [
    { value: "AFDAS - Culture, médias, loisirs", label: "AFDAS (Culture, médias, loisirs, sport)" },
    { value: "AKTO - Services a forte intensité de main-d œuvre", label: "AKTO (Services à forte intensité de main-d'œuvre)" },
    { value: "ATLAS - Services financiers et conseil", label: "ATLAS (Services financiers et conseil)" },
    { value: "CONSTRUCTYS - Construction", label: "CONSTRUCTYS (Construction)" },
    { value: "OCAPIAT - Agriculture, pêche, agroalimentaire", label: "OCAPIAT (Agricole, pêche, agroalimentaire)" },
    { value: "OPCO 2i - Interindustriel", label: "OPCO 2i (Interindustriel)" },
    { value: "OPCO EP - Entreprises de proximité", label: "OPCO EP (Entreprises de proximité)" },
    { value: "OPCO Mobilités - Transports", label: "OPCO Mobilités (Transports)" },
    { value: "OPCO Santé - Santé", label: "OPCO Santé (Santé)" },
    { value: "OPCOMMERCE - Commerce", label: "OPCOMMERCE (Commerce)" },
    { value: "UNIFORMATION - Cohésion sociale", label: "UNIFORMATION (Cohésion sociale)" }
];

export const CONTRAT_TYPE_OPTIONS: SelectOption[] = [
    { value: "11 Premier contrat d apprentissage de l apprenti", label: "11 Premier contrat'apprentissage de l'apprenti" },
    { value: "21 Nouveau contrat avec un apprenti qui a terminé son précédent contrat auprès d un même employeur", label: "21 Nouveau contrat avec un apprenti qui a terminé son précédent contrat auprès d'un même employeur" },
    { value: "22 Nouveau contrat avec un apprenti qui a terminé son précédent contrat auprès d un autre employeur", label: "22 Nouveau contrat avec un apprenti qui a terminé son précédent contrat auprès d'un autre employeur" },
    { value: "23 Nouveau contrat avec un apprenti dont le précédent contrat a été rompu", label: "23 Nouveau contrat avec un apprenti dont le précédent contrat a été rompu" },
    { value: "31 Modification de la situation juridique de l employeur", label: "31	Modification de la situation juridique de l'employeur" },
    { value: "32 Changement d employeur dans le cadre d un contrat saisonnier", label: "32 Changement d'employeur dans le cadre d'un contrat saisonnier" },
    { value: "33 Prolongation du contrat suite à un échec à l examen de l apprenti", label: "33	Prolongation du contrat suite à un échec à l'examen de l'apprenti" },
    { value: "34 Prolongation du contrat suite à la reconnaissance de l apprenti comme travailleur handicapé", label: "34 Prolongation du contrat suite à la reconnaissance de l'apprenti comme travailleur handicapé" },
    { value: "35 Diplôme supplémentaire préparé par l apprenti dans le cadre de l article L. 6222-22-1 du code du travail", label: "35 Diplôme supplémentaire préparé par l'apprenti dans le cadre de l'article L. 6222-22-1 du code du travail" },
    { value: "36 Autres changements : changement de maître d apprentissage, de durée de travail hebdomadaire, réduction de durée, etc.", label: "36	Autres changements : changement de maître d'apprentissage, de durée de travail hebdomadaire, réduction de durée, etc." },
    { value: "37 Modifications de lieu d exécution du contrat", label: "37 Modifications de lieu d'exécution du contrat" },
    { value: "38 Modification du lieu principale de réalisation de la formation théorique", label: "38 Modification du lieu principal de réalisation de la formation théorique" }
];

export const DEROGATION_TYPE_OPTIONS: SelectOption[] = [
    { value: "0 - Aucune dérogation", label: "0 - Aucune dérogation" },
    { value: "11 - Âge de l apprenti inférieur à 16 ans", label: "11 - Âge de l'apprenti inférieur à 16 ans" },
    { value: "12 - Âge supérieur à 29 ans : cas spécifiques prévus dans le code du travail", label: "12 - Âge supérieur à 29 ans : cas spécifiques prévus dans le code du travail" },
    { value: "21 - Réduction de la durée du contrat ou de la période d apprentissage", label: "21 - Réduction de la durée du contrat ou de la période d'apprentissage" },
    { value: "22 - Allongement de la durée du contrat ou de la période d apprentissage", label: "22 - Allongement de la durée du contrat ou de la période d'apprentissage" },
    { value: "50 - Cumul de dérogations", label: "50 - Cumul de dérogations" },
    { value: "60 - Autre dérogation", label: "60 - Autre dérogation" }
];

export const AGE_TRANCHE_OPTIONS: SelectOption[] = [
    { value: "16-17", label: "De 16 à 17 ans" },
    { value: "18-20", label: "De 18 à 20 ans" },
    { value: "21-25", label: "De 21 à 25 ans" },
    { value: "26+", label: "26 ans et plus" }
];

export const APPRENTISSAGE_YEAR_OPTIONS: SelectOption[] = [
    { value: "1", label: "1ère année" },
    { value: "2", label: "2ème année" },
    { value: "3", label: "3ème année" },
    { value: "4", label: "4ème année" }
];

export const YES_NO_OPTIONS: SelectOption[] = [
    { value: "Oui", label: "Oui" },
    { value: "Non", label: "Non" }
];

export const FORMATION_DETAILS: Record<string, { debut: string; fin: string; rncp: string; diplome: string; heures: string; jours: string }> = {
    "BTS MCO A": { debut: "2025-09-04", fin: "2027-06-30", rncp: "RNCP38362", diplome: "32031213", heures: "1680", jours: "Lundi & Mardi" },
    "BTS MCO 2": { debut: "2025-09-02", fin: "2026-06-30", rncp: "RNCP38362", diplome: "32031213", heures: "840", jours: "Jeudi & Vendredi" },
    "BTS NDRC 1": { debut: "2025-09-09", fin: "2027-06-30", rncp: "RNCP38368", diplome: "32031212", heures: "1740", jours: "Lundi & Mardi" },
    "BTS COM": { debut: "2025-09-03", fin: "2027-06-30", rncp: "RNCP37198", diplome: "32032002", heures: "1665", jours: "Lundi & Mardi" },
    "Titre Pro NTC": { debut: "2025-10-01", fin: "2026-07-11", rncp: "RNCP39063", diplome: "36T31203", heures: "450", jours: "Mercredi" },
    "Titre Pro NTC B (rentrée decalée)": { debut: "2026-01-07", fin: "2026-09-11", rncp: "RNCP39063", diplome: "36T31203", heures: "450", jours: "Mercredi" },
    "Bachelor RDC": { debut: "2025-09-17", fin: "2026-07-17", rncp: "RNCP37849", diplome: "26X31015", heures: "500", jours: "Mercredi" }
};

export const FORMATION_FILTER_OPTIONS: SelectOption[] = [
    { value: "mco", label: "BTS MCO" },
    { value: "ndrc", label: "BTS NDRC" },
    { value: "bachelor", label: "Bachelor RDC" },
    { value: "ntc", label: "TP NTC" }
];


