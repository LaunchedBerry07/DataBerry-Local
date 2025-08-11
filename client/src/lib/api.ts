import { apiRequest } from "./queryClient";

export const api = {
  // Dashboard metrics
  getDashboardMetrics: () => fetch("/api/dashboard/metrics").then(res => res.json()),
  
  // Emails
  getEmails: (params: {
    limit?: number;
    offset?: number;
    search?: string;
    category?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });
    return fetch(`/api/emails?${searchParams}`).then(res => res.json());
  },
  
  getEmailById: (id: string) => fetch(`/api/emails/${id}`).then(res => res.json()),
  
  createEmail: (data: any) => apiRequest("POST", "/api/emails", data),
  
  updateEmail: (id: string, data: any) => apiRequest("PUT", `/api/emails/${id}`, data),
  
  deleteEmail: (id: string) => apiRequest("DELETE", `/api/emails/${id}`),
  
  exportEmailToPdf: (id: string) => apiRequest("POST", `/api/emails/${id}/export`),
  
  // Labels
  getLabels: () => fetch("/api/labels").then(res => res.json()),
  
  createLabel: (data: any) => apiRequest("POST", "/api/labels", data),
  
  updateLabel: (id: number, data: any) => apiRequest("PUT", `/api/labels/${id}`, data),
  
  deleteLabel: (id: number) => apiRequest("DELETE", `/api/labels/${id}`),
  
  // Export
  exportCsv: (params: {
    search?: string;
    category?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });
    return fetch(`/api/export/csv?${searchParams}`);
  },
};
