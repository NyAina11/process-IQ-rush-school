import React, { useEffect } from 'react';
import {
    Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ViewId, AdmissionTab } from '../types';
import { useAppStore } from '../store/useAppStore';

import CandidateDetailsModal from './dashboard/CandidateDetailsModal';
import CommercialOverview from './dashboard/CommercialOverview';
import CommercialToPlace from './dashboard/CommercialToPlace';
import CommercialAlternance from './dashboard/CommercialAlternance';

import { useCandidates, getC, isPlaced } from '../hooks/useCandidates';
import { useCandidateDetails } from '../hooks/useCandidateDetails';
import { usePagination } from '../hooks/usePagination';
import { useFilters } from '../hooks/useFilters';

interface DashboardViewProps {
    activeSubView: ViewId;
    onSelectStudent?: (student: any, tab: AdmissionTab) => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ activeSubView, onSelectStudent }) => {
    const { candidates, loading, refresh } = useCandidates();
    const navigate = useNavigate();
    const { showToast } = useAppStore();

    const {
        searchQuery,
        setSearchQuery,
        filterFormation,
        setFilterFormation,
        viewMode,
        setViewMode
    } = useFilters();

    const {
        currentPage,
        setCurrentPage,
        itemsPerPage
    } = usePagination(candidates); // Note: paginatedItems is handled inside sub-components for now as they do their own filtering

    const {
        selectedCandidate,
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
    } = useCandidateDetails(candidates, refresh);

    // Reset pagination when activeSubView or search/filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [activeSubView, searchQuery, filterFormation, setCurrentPage]);

    const studentsToPlace = candidates.filter(c => !isPlaced(c));
    const studentsPlaced = candidates.filter(c => isPlaced(c));

    const statsToPlace = {
        total: studentsToPlace.length,
        enCours: studentsToPlace.filter(s => getC(s).entreprise === 'En recherche').length,
        cvAActualiser: studentsToPlace.filter(s => !getC(s).has_cv).length
    };

    const statsPlaced = {
        total: studentsPlaced.length,
        contratsSignes: studentsPlaced.filter(s => getC(s).has_cerfa).length,
        missionsValidees: studentsPlaced.filter(s => getC(s).has_fiche_renseignement).length,
        entreprisesPartenaires: new Set(studentsPlaced.map(s => getC(s).entreprise)).size
    };

    const handleRedirectionToForm = (student: any) => {
        if (!onSelectStudent) {
            showToast("Navigation non disponible", "error");
            return;
        }
        onSelectStudent(student, AdmissionTab.ENTREPRISE);
        navigate('/admission');
    };

    const renderMainContent = () => {
        if (loading) {
            return (
                <div className="flex h-full items-center justify-center py-20">
                    <Loader2 className="animate-spin text-blue-500" size={48} />
                </div>
            );
        }

        if (activeSubView === 'commercial-placer') {
            return (
                <CommercialToPlace
                    candidates={candidates}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    filterFormation={filterFormation}
                    setFilterFormation={setFilterFormation}
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    itemsPerPage={itemsPerPage}
                    handleViewDetails={handleViewDetails}
                    getC={getC}
                    isPlaced={isPlaced}
                    statsToPlace={statsToPlace}
                    onPlacer={handleRedirectionToForm}
                />
            );
        }

        if (activeSubView === 'commercial-alternance') {
            return (
                <CommercialAlternance
                    candidates={candidates}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    filterFormation={filterFormation}
                    setFilterFormation={setFilterFormation}
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    itemsPerPage={itemsPerPage}
                    handleViewDetails={handleViewDetails}
                    handleEdit={handleEdit}
                    getC={getC}
                    isPlaced={isPlaced}
                    statsPlaced={statsPlaced}
                />
            );
        }

        return (
            <CommercialOverview
                candidates={candidates}
                studentsToPlace={studentsToPlace}
                studentsPlaced={studentsPlaced}
                getC={getC}
            />
        );
    };

    return (
        <div className="relative">
            {renderMainContent()}
            <CandidateDetailsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                candidate={selectedCandidate}
                loading={detailsLoading}
                isEditing={isEditing}
                setIsEditing={setIsEditing}
                editForm={editForm}
                setEditForm={setEditForm}
                handleSaveEdit={handleSaveEdit}
                handleDelete={handleDelete}
                isSaving={isSaving}
                isDeleting={isDeleting}
            />
        </div>
    );
};

export default DashboardView;