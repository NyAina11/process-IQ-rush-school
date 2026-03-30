import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ValidationStatus = 'pending' | 'approved' | 'rejected';

export interface ValidationRequest {
  id: string;
  action: string;           // e.g. "Régénérer CERFA"
  actionType: string;       // e.g. "regenerate_cerfa"
  studentId?: string;
  studentName?: string;
  details?: string;
  requestedBy: string;      // email
  requestedByName: string;  // display name
  requestedAt: string;      // ISO date
  status: ValidationStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  seen: boolean;            // has the requester seen the response?
  seenByAdmin: boolean;     // has the admin seen the request?
  // Payload to execute the action after approval
  payload?: any;
}

interface ValidationState {
  requests: ValidationRequest[];
  addRequest: (req: Omit<ValidationRequest, 'id' | 'requestedAt' | 'status' | 'seen' | 'seenByAdmin'>) => string;
  approveRequest: (id: string, reviewerName: string) => void;
  rejectRequest: (id: string, reviewerName: string) => void;
  markSeenByUser: (id: string) => void;
  markSeenByAdmin: (id: string) => void;
  markAllSeenByAdmin: () => void;
  markAllSeenByUser: (email: string) => void;
  getRequestsForAdmin: () => ValidationRequest[];
  getRequestsForUser: (email: string) => ValidationRequest[];
  getUnseenCountForAdmin: () => number;
  getUnseenCountForUser: (email: string) => number;
  removeRequest: (id: string) => void;
}

export const useValidationStore = create<ValidationState>()(
  persist(
    (set, get) => ({
      requests: [],

      addRequest: (req) => {
        const id = `val_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        const newReq: ValidationRequest = {
          ...req,
          id,
          requestedAt: new Date().toISOString(),
          status: 'pending',
          seen: false,
          seenByAdmin: false,
        };
        set((state) => ({ requests: [...state.requests, newReq] }));
        return id;
      },

      approveRequest: (id, reviewerName) => {
        set((state) => ({
          requests: state.requests.map((r) =>
            r.id === id
              ? { ...r, status: 'approved' as ValidationStatus, reviewedBy: reviewerName, reviewedAt: new Date().toISOString(), seen: false }
              : r
          ),
        }));
      },

      rejectRequest: (id, reviewerName) => {
        set((state) => ({
          requests: state.requests.map((r) =>
            r.id === id
              ? { ...r, status: 'rejected' as ValidationStatus, reviewedBy: reviewerName, reviewedAt: new Date().toISOString(), seen: false }
              : r
          ),
        }));
      },

      markSeenByUser: (id) => {
        set((state) => ({
          requests: state.requests.map((r) =>
            r.id === id ? { ...r, seen: true } : r
          ),
        }));
      },

      markSeenByAdmin: (id) => {
        set((state) => ({
          requests: state.requests.map((r) =>
            r.id === id ? { ...r, seenByAdmin: true } : r
          ),
        }));
      },

      markAllSeenByAdmin: () => {
        set((state) => ({
          requests: state.requests.map((r) =>
            r.status === 'pending' ? { ...r, seenByAdmin: true } : r
          ),
        }));
      },

      markAllSeenByUser: (email) => {
        set((state) => ({
          requests: state.requests.map((r) =>
            r.requestedBy === email && r.status !== 'pending' ? { ...r, seen: true } : r
          ),
        }));
      },

      getRequestsForAdmin: () => {
        return get().requests.filter((r) => r.status === 'pending');
      },

      getRequestsForUser: (email) => {
        return get().requests.filter((r) => r.requestedBy === email);
      },

      getUnseenCountForAdmin: () => {
        return get().requests.filter((r) => r.status === 'pending' && !r.seenByAdmin).length;
      },

      getUnseenCountForUser: (email) => {
        return get().requests.filter((r) => r.requestedBy === email && r.status !== 'pending' && !r.seen).length;
      },

      removeRequest: (id) => {
        set((state) => ({
          requests: state.requests.filter((r) => r.id !== id),
        }));
      },
    }),
    {
      name: 'validation-storage',
      version: 1,
    }
  )
);
