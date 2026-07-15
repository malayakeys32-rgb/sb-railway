import axios from "axios";
import { create } from "zustand";
import { persist } from "zustand/middleware";

const BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:4000";
export const api = axios.create({ baseURL: BASE });

api.interceptors.request.use((cfg) => {
  if (typeof window !== "undefined") {
    const token = useAuthStore.getState().token;
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
  }
  return cfg;
});

// ---- Types ----
export type Role = "ADMIN" | "REPORTER" | "VIEWER";
export type Severity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type IncidentStatus = "OPEN" | "INVESTIGATING" | "RESOLVED" | "CLOSED";

export interface User {
  id: string; email: string; name: string; role: Role;
  maskedMode: boolean; createdAt: string;
}

export interface Incident {
  id: string; title: string; description: string;
  severity: Severity; status: IncidentStatus;
  category?: string; location?: string;
  occurredAt: string; resolvedAt?: string;
  isAnonymous: boolean; createdAt: string;
  reporter: { id: string; name: string; email: string };
  _count?: { timeline: number; evidence: number };
}

export interface Evidence {
  id: string; filename: string; originalName: string;
  mimeType: string; fileSize: number; fileHash: string;
  description?: string; takenAt?: string;
  chainOfCustody: any[]; isSealed: boolean; createdAt: string;
  incidentId?: string;
  uploader: { id: string; name: string };
}

export interface TimelineEvent {
  id: string; incidentId: string; eventAt: string;
  description: string; actor?: string;
  isLocked: boolean; forensicHash?: string; createdAt: string;
}

export interface Pattern {
  id: string; title: string; description: string;
  severity: Severity; frequency: number;
  isEscalating: boolean; detectedAt: string;
  incidents: { incident: { id: string; title: string; severity: Severity; occurredAt: string } }[];
}

// ---- Auth Store ----
interface AuthState {
  token: string | null; user: User | null;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null, user: null,
      setAuth: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
    }),
    { name: "sentinel-auth", skipHydration: true }
  )
);

// ---- API helpers ----
export const authApi = {
  login: (email: string, password: string) => api.post<{ token: string; user: User }>("/auth/login", { email, password }),
  register: (email: string, password: string, name: string) => api.post<{ token: string; user: User }>("/auth/register", { email, password, name }),
  me: () => api.get<User>("/auth/me"),
  updateMe: (data: Partial<User>) => api.patch<User>("/auth/me", data),
};

export const evidenceApi = {
  list: (incidentId?: string) => api.get<Evidence[]>("/evidence", { params: incidentId ? { incidentId } : {} }),
  get: (id: string) => api.get<Evidence>(`/evidence/${id}`),
  upload: (formData: FormData) => api.post<Evidence>("/evidence/upload", formData, { headers: { "Content-Type": "multipart/form-data" } }),
  fileUrl: (id: string) => `${BASE}/evidence/${id}/file`,
  delete: (id: string) => api.delete(`/evidence/${id}`),
};

export const incidentsApi = {
  list: (params?: Record<string, string>) => api.get<Incident[]>("/incidents", { params }),
  get: (id: string) => api.get<Incident>(`/incidents/${id}`),
  create: (data: Partial<Incident>) => api.post<Incident>("/incidents", data),
  update: (id: string, data: Partial<Incident>) => api.patch<Incident>(`/incidents/${id}`, data),
  delete: (id: string) => api.delete(`/incidents/${id}`),
};

export const timelineApi = {
  list: (incidentId: string) => api.get<TimelineEvent[]>(`/timeline/${incidentId}`),
  add: (incidentId: string, data: Partial<TimelineEvent>) => api.post<TimelineEvent>(`/timeline/${incidentId}`, data),
  delete: (eventId: string) => api.delete(`/timeline/event/${eventId}`),
};

export const patternsApi = {
  list: () => api.get<Pattern[]>("/patterns"),
  create: (data: { title: string; description: string; severity?: string; incidentIds?: string[] }) => api.post<Pattern>("/patterns", data),
  update: (id: string, data: Partial<Pattern>) => api.patch<Pattern>(`/patterns/${id}`, data),
  delete: (id: string) => api.delete(`/patterns/${id}`),
};
