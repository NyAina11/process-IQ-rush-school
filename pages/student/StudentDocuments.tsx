import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  FileText,
  Download,
  Eye,
  Upload,
  Plus,
  Search,
  Clock,
  CheckCircle,
  AlertCircle,
  Folder,
  FileSignature
} from 'lucide-react';
import StudentNavbar from '../../components/StudentNavbar';
import { api } from '../../services/api';
import { getAuthEmail, getAuthUserId } from '../../services/session';

type DocumentCategory = 'all' | 'administrative' | 'educational' | 'company' | 'certificate';
type DocumentStatus = 'available' | 'pending' | 'signed' | 'in-progress';

interface StudentDoc {
  id: string;
  title: string;
  description: string;
  category: DocumentCategory;
  status: DocumentStatus;
  signableByStudent: boolean;
  date: string;
  size?: string;
}

const mapCategory = (category: string): DocumentCategory => {
  if (['contract', 'id', 'insurance', 'payment', 'parental_consent', 'medical'].includes(category)) return 'administrative';
  if (['internship'].includes(category)) return 'company';
  if (['certificate'].includes(category)) return 'certificate';
  if (['transcript', 'other'].includes(category)) return 'educational';
  return 'all';
};

const mapStatus = (status: string): DocumentStatus => {
  if (status === 'signed') return 'signed';
  if (status === 'to_sign') return 'pending';
  if (status === 'pending') return 'in-progress';
  if (status === 'valid') return 'available';
  return 'available';
};

const normalizeWorkflowText = (value: string): string => {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
};

const STUDENT_SIGNATURE_KEYWORDS = [
  'fiche atre',
  'atre',
  'reglement interieur',
  'reglement',
  'prise de connaissance',
  'charte informatique',
];

const canStudentSignDocument = (title: string): boolean => {
  const normalizedTitle = normalizeWorkflowText(title);
  if (!normalizedTitle) return false;
  return STUDENT_SIGNATURE_KEYWORDS.some((keyword) => normalizedTitle.includes(keyword));
};

const StudentDocuments: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<DocumentCategory>('all');
  const [showRequestModal, setShowRequestModal] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [remoteDocuments, setRemoteDocuments] = useState<StudentDoc[]>([]);
  const [requestTitle, setRequestTitle] = useState<string>('New requested document');
  const [requestDescription, setRequestDescription] = useState<string>('Requested from student portal');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const fetchDocuments = async (): Promise<void> => {
    try {
      const studentId = await api.getCurrentStudentId();
      const documents = await api.getDocuments(studentId);
      const mapped: StudentDoc[] = (Array.isArray(documents) ? documents : []).map((d: any) => ({
        id: String(d._id || d.id),
        title: d.title || 'Document',
        description: d.description || '',
        category: mapCategory(String(d.category || '')),
        status: mapStatus(String(d.status || '')),
        signableByStudent: canStudentSignDocument(String(d.title || '')),
        date: d.createdAt ? new Date(d.createdAt).toLocaleDateString('fr-FR') : '-',
        size: d.size ? `${Math.round(Number(d.size) / 1024)} KB` : undefined
      }));
      setRemoteDocuments(mapped);
    } catch (err) {
      console.error('Failed to fetch documents', err);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const categories = useMemo(
    () => [
      { id: 'all' as DocumentCategory, label: 'All', count: remoteDocuments.length },
      { id: 'administrative' as DocumentCategory, label: 'Administrative', count: remoteDocuments.filter((d) => d.category === 'administrative').length },
      { id: 'educational' as DocumentCategory, label: 'Educational', count: remoteDocuments.filter((d) => d.category === 'educational').length },
      { id: 'company' as DocumentCategory, label: 'Company', count: remoteDocuments.filter((d) => d.category === 'company').length },
      { id: 'certificate' as DocumentCategory, label: 'Certificates', count: remoteDocuments.filter((d) => d.category === 'certificate').length }
    ],
    [remoteDocuments]
  );

  const filteredDocuments = useMemo(() => {
    return remoteDocuments.filter((doc) => {
      const matchesCategory = activeCategory === 'all' || doc.category === activeCategory;
      const q = searchQuery.toLowerCase();
      const matchesSearch = doc.title.toLowerCase().includes(q) || doc.description.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [remoteDocuments, activeCategory, searchQuery]);

  const getStatusBadge = (status: DocumentStatus) => {
    if (status === 'available') return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">Available</span>;
    if (status === 'signed') return <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">Signed</span>;
    if (status === 'pending') return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">Pending Signature</span>;
    return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">In Progress</span>;
  };

  const cardColor = (category: DocumentCategory): string => {
    if (category === 'certificate') return 'bg-green-500';
    if (category === 'administrative') return 'bg-blue-500';
    if (category === 'educational') return 'bg-purple-500';
    if (category === 'company') return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  const previewDoc = async (doc: StudentDoc): Promise<void> => {
    try {
      const response = await api.downloadStudentDocument(doc.id);
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const payload = await response.json();
        if (payload?.url) {
          window.open(payload.url, '_blank', 'noopener,noreferrer');
          return;
        }
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener,noreferrer');
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch (error: any) {
      alert(error.message || 'Preview failed');
    }
  };

  const downloadDoc = async (doc: StudentDoc): Promise<void> => {
    try {
      const response = await api.downloadStudentDocument(doc.id);
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const payload = await response.json();
        if (payload?.url) {
          window.open(payload.url, '_blank', 'noopener,noreferrer');
          return;
        }
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${doc.title.replace(/\s+/g, '_')}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error: any) {
      alert(error.message || 'Download failed');
    }
  };

  const createRequestedDocument = async (): Promise<void> => {
    try {
      const studentId = await api.getCurrentStudentId();
      const authUserId = getAuthUserId();
      if (!studentId || !authUserId) {
        alert('Session invalide, reconnecte-toi.');
        return;
      }
      await api.createDocument({
        studentId,
        title: requestTitle,
        description: requestDescription,
        category: 'other',
        status: 'pending',
        size: 0,
        mimeType: 'text/plain',
        storageRef: `docs/${studentId}/request-${Date.now()}.txt`,
        createdBy: authUserId
      });
      setShowRequestModal(false);
      await fetchDocuments();
    } catch (error: any) {
      alert(error.message || 'Unable to request document');
    }
  };

  const onFileSelected = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;
      const studentId = await api.getCurrentStudentId();
      if (!studentId) {
        alert('Session invalide, reconnecte-toi.');
        return;
      }
      await api.uploadStudentDocument({
        studentId,
        file,
        title: file.name,
        description: 'Uploaded from student portal',
        category: 'other',
        status: 'pending'
      });
      await fetchDocuments();
      if (fileInputRef.current) fileInputRef.current.value = '';
      alert('Document uploaded successfully.');
    } catch (error: any) {
      alert(error.message || 'Upload failed');
    }
  };

  const signDoc = async (doc: StudentDoc): Promise<void> => {
    if (!doc.signableByStudent) {
      alert('Ce document doit etre signe par un autre role (RH/CFA/commercial).');
      return;
    }

    try {
      const signerEmail = (getAuthEmail() || '').trim();
      const signerName = 'Etudiant';
      let signingLink: { signingUrl: string; envelopeId?: string };

      try {
        signingLink = await api.getDocumentSigningLink(doc.id, {
          signerRole: 'student',
          signerEmail: signerEmail || undefined,
          signerName
        });
      } catch {
        await api.requestDocumentSignature(doc.id, {
          participants: signerEmail
            ? {
                student: {
                  email: signerEmail,
                  name: signerName
                }
              }
            : undefined
        });
        signingLink = await api.getDocumentSigningLink(doc.id, {
          signerRole: 'student',
          signerEmail: signerEmail || undefined,
          signerName
        });
      }

      if (!signingLink.signingUrl) {
        throw new Error('Lien de signature indisponible.');
      }
      window.open(signingLink.signingUrl, '_blank', 'noopener,noreferrer');
    } catch (error: any) {
      alert(error.message || 'Impossible de lancer la signature');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <StudentNavbar />

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">My documents</h2>
          <p className="text-gray-600">Connected to MongoDB documents</p>
        </div>
        <button
          onClick={() => setShowRequestModal(true)}
          className="px-5 py-3 bg-blue-500 text-white rounded-xl font-medium flex items-center gap-3 hover:bg-blue-600 transition-colors"
        >
          <Plus size={20} />
          Request a document
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="text-sm text-gray-600 flex items-center gap-2">
          <Folder size={16} />
          <span>{filteredDocuments.length} documents</span>
        </div>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`px-4 py-3 rounded-xl font-medium whitespace-nowrap transition-all duration-200 ${
              activeCategory === category.id ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category.label}
            <span className="ml-2 px-2 py-1 bg-white rounded-full text-xs">{category.count}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {filteredDocuments.map((doc) => (
          <div key={doc.id} className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md transition-all duration-200">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-4 bg-blue-100 rounded-xl">
                {doc.category === 'administrative' ? <FileSignature size={28} className="text-blue-600" /> : <FileText size={28} className="text-blue-600" />}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-lg mb-1 truncate">{doc.title}</h4>
                <p className="text-sm text-gray-600 mb-2">{doc.description}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Clock size={12} />
                  <span>{doc.date}</span>
                  {doc.size ? <span>- {doc.size}</span> : null}
                </div>
              </div>
              {getStatusBadge(doc.status)}
            </div>

            <div className="flex gap-3">
              <button onClick={() => previewDoc(doc)} className="flex-1 py-2.5 bg-gray-50 border border-gray-300 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
                <Eye size={16} />
                Preview
              </button>
              {doc.status === 'pending' && doc.signableByStudent && (
                <button
                  onClick={() => signDoc(doc)}
                  className="flex-1 py-2.5 bg-rose-500 text-white rounded-lg font-medium hover:bg-rose-600 transition-colors flex items-center justify-center gap-2"
                >
                  <FileSignature size={16} />
                  Sign
                </button>
              )}
              <button onClick={() => downloadDoc(doc)} className={`flex-1 py-2.5 text-white rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 ${cardColor(doc.category)}`}>
                <Download size={16} />
                Download
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center">
        <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Upload size={32} className="text-gray-400" />
        </div>
        <h4 className="text-xl font-semibold mb-2">Upload your documents here</h4>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">Drag and drop or click to browse your files</p>
        <button onClick={() => fileInputRef.current?.click()} className="px-6 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors mb-3">Select a file</button>
        <input ref={fileInputRef} type="file" className="hidden" onChange={onFileSelected} />
      </div>

      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Request a document</h3>
              <button onClick={() => setShowRequestModal(false)} className="text-gray-400 hover:text-gray-600">X</button>
            </div>
            <div className="space-y-3 mb-4">
              <input value={requestTitle} onChange={(e) => setRequestTitle(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Document title" />
              <textarea value={requestDescription} onChange={(e) => setRequestDescription(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 h-24" placeholder="Description" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowRequestModal(false)} className="w-full py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50">Cancel</button>
              <button onClick={createRequestedDocument} className="w-full py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600">Request</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-5">
          <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
            <CheckCircle size={20} />
            Documents synced
          </h4>
          <p className="text-blue-700 text-sm">{remoteDocuments.length} documents loaded from MongoDB.</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl p-5">
          <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
            <AlertCircle size={20} />
            Signature status
          </h4>
          <p className="text-green-700 text-sm">Pending signature: {remoteDocuments.filter((d) => d.status === 'pending').length}</p>
        </div>
      </div>
    </div>
  );
};

export default StudentDocuments;
