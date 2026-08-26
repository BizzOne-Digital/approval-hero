import axios from 'axios';
import type { ApiResponse } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      if (window.location.pathname.startsWith('/admin') && !window.location.pathname.includes('/login')) {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

export async function fetchApi<T>(url: string, options?: { preview?: boolean }, headers?: Record<string, string>): Promise<T> {
  const params = options?.preview ? { preview: 'true' } : undefined;
  const { data } = await api.get<ApiResponse<T>>(url, { params, headers });
  if (!data.success) throw new Error(data.error || 'API error');
  return data.data as T;
}

export async function postApi<T>(url: string, body: unknown, headers?: Record<string, string>): Promise<T> {
  const { data } = await api.post<ApiResponse<T>>(url, body, { headers });
  if (!data.success) throw new Error(data.error || 'API error');
  return data.data as T;
}

export async function patchApi<T>(url: string, body: unknown, headers?: Record<string, string>): Promise<T> {
  const { data } = await api.patch<ApiResponse<T>>(url, body, { headers });
  if (!data.success) throw new Error(data.error || 'API error');
  return data.data as T;
}

export async function putApi<T>(url: string, body: unknown): Promise<T> {
  const { data } = await api.put<ApiResponse<T>>(url, body);
  if (!data.success) throw new Error(data.error || 'API error');
  return data.data as T;
}

export async function deleteApi(url: string): Promise<void> {
  const { data } = await api.delete<ApiResponse<null>>(url);
  if (!data.success) throw new Error(data.error || 'API error');
}

// Public API
export const publicApi = {
  getSettings: () => fetchApi<import('./types').SiteSettings>('/public/settings'),
  getNavigation: () => fetchApi<{ navigation: { headerItems: import('./types').NavItem[]; footerColumns: unknown[] }; services: import('./types').Service[] }>('/public/navigation'),
  getPage: (slug: string, preview?: boolean) => fetchApi<import('./types').Page>(`/public/pages/${slug}`, { preview }),
  getServices: () => fetchApi<import('./types').Service[]>('/public/services'),
  getService: (slug: string) => fetchApi<import('./types').Service>(`/public/services/${slug}`),
  getGallery: () => fetchApi<{ categories: unknown[]; images: import('./types').GalleryImage[] }>('/public/gallery'),
  getTestimonials: () => fetchApi<import('./types').Testimonial[]>('/public/testimonials'),
  getFaqs: () => fetchApi<{ categories: unknown[]; faqs: import('./types').FAQ[] }>('/public/faqs'),
  getBlogs: () => fetchApi<{ posts: import('./types').BlogPost[]; categories: unknown[]; featured: import('./types').BlogPost | null }>('/public/blogs'),
  getBlog: (slug: string) => fetchApi<{ post: import('./types').BlogPost; related: import('./types').BlogPost[] }>(`/public/blogs/${slug}`),
  submitContact: (data: unknown) => postApi<{ id: string }>('/public/contact', data),
  submitApplication: (data: unknown) => postApi<{ id: string }>('/public/applications', data),
};

const appHeaders = (token: string) => ({ 'X-Application-Token': token });

export const applicationApi = {
  start: (meta: Record<string, unknown>) => postApi<{ token: string; currentStep: string; status: string }>('/public/applications/start', meta),
  getSession: (token: string) => fetchApi<Record<string, unknown>>('/public/applications/session', undefined, appHeaders(token)),
  saveStep: (token: string, stepId: string, data: Record<string, unknown>) =>
    patchApi<Record<string, unknown>>('/public/applications/session/step', { stepId, data }, appHeaders(token)),
  sendOtp: (token: string) => postApi<{ sent: boolean; cooldownSeconds?: number; mockCode?: string }>('/public/applications/session/send-otp', { token }, appHeaders(token)),
  verifyOtp: (token: string, code: string) => postApi<Record<string, unknown>>('/public/applications/session/verify-otp', { code }, appHeaders(token)),
  submit: (token: string, consents: Record<string, boolean>) =>
    postApi<{ referenceNumber: string; successMessage: { heading: string; body: string; expectedResponseTime: string } }>(
      '/public/applications/session/submit',
      { consents },
      appHeaders(token),
    ),
};

// Admin API
export const adminApi = {
  login: (email: string, password: string) => postApi('/admin/auth/login', { email, password }),
  logout: () => postApi('/admin/auth/logout', {}),
  me: () => fetchApi('/admin/auth/me'),
  changePassword: (currentPassword: string, newPassword: string) => putApi('/admin/auth/password', { currentPassword, newPassword }),
  getDashboard: () => fetchApi('/admin/dashboard'),
  getPages: () => fetchApi('/admin/pages'),
  getPage: (id: string) => fetchApi(`/admin/pages/${id}`),
  updatePage: (id: string, data: unknown) => putApi(`/admin/pages/${id}`, data),
  getServices: () => fetchApi('/admin/services'),
  getService: (id: string) => fetchApi(`/admin/services/${id}`),
  createService: (data: unknown) => postApi('/admin/services', data),
  updateService: (id: string, data: unknown) => putApi(`/admin/services/${id}`, data),
  deleteService: (id: string) => deleteApi(`/admin/services/${id}`),
  getLeads: () => fetchApi('/admin/leads'),
  updateLead: (id: string, data: unknown) => putApi(`/admin/leads/${id}`, data),
  deleteLead: (id: string) => deleteApi(`/admin/leads/${id}`),
  getSettings: () => fetchApi('/admin/settings'),
  updateSettings: (data: unknown) => putApi('/admin/settings', data),
  getNavigation: () => fetchApi('/admin/navigation'),
  updateNavigation: (data: unknown) => putApi('/admin/navigation', data),
  getTestimonials: () => fetchApi('/admin/testimonials'),
  createTestimonial: (data: unknown) => postApi('/admin/testimonials', data),
  updateTestimonial: (id: string, data: unknown) => putApi(`/admin/testimonials/${id}`, data),
  deleteTestimonial: (id: string) => deleteApi(`/admin/testimonials/${id}`),
  getFaqs: () => fetchApi('/admin/faqs'),
  createFaq: (data: unknown) => postApi('/admin/faqs', data),
  updateFaq: (id: string, data: unknown) => putApi(`/admin/faqs/${id}`, data),
  deleteFaq: (id: string) => deleteApi(`/admin/faqs/${id}`),
  getFaqCategories: () => fetchApi('/admin/faqs/categories'),
  getBlogs: () => fetchApi('/admin/blogs'),
  getBlog: (id: string) => fetchApi(`/admin/blogs/${id}`),
  createBlog: (data: unknown) => postApi('/admin/blogs', data),
  updateBlog: (id: string, data: unknown) => putApi(`/admin/blogs/${id}`, data),
  deleteBlog: (id: string) => deleteApi(`/admin/blogs/${id}`),
  getOffers: () => fetchApi('/admin/offers'),
  createOffer: (data: unknown) => postApi('/admin/offers', data),
  updateOffer: (id: string, data: unknown) => putApi(`/admin/offers/${id}`, data),
  deleteOffer: (id: string) => deleteApi(`/admin/offers/${id}`),
  getGalleryCategories: () => fetchApi('/admin/gallery/categories'),
  getGalleryImages: () => fetchApi('/admin/gallery/images'),
  getMedia: () => fetchApi('/admin/media'),
  uploadMedia: (formData: FormData) => api.post('/admin/uploads', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteMedia: (id: string) => deleteApi(`/admin/uploads/${id}`),
  getApplications: (params?: Record<string, string>) => fetchApi<{ items: unknown[]; total: number; page: number; limit: number }>(`/admin/applications?${new URLSearchParams(params || {}).toString()}`),
  getApplication: (id: string) => fetchApi(`/admin/applications/${id}`),
  updateApplicationStatus: (id: string, status: string, note?: string) => patchApi(`/admin/applications/${id}/status`, { status, note }),
  assignApplication: (id: string, assignedTo: string) => patchApi(`/admin/applications/${id}/assign`, { assignedTo }),
  addApplicationNote: (id: string, text: string) => postApi(`/admin/applications/${id}/notes`, { text }),
  getApplicationActivity: (id: string) => fetchApi(`/admin/applications/${id}/activity`),
  deleteApplication: (id: string) => deleteApi(`/admin/applications/${id}`),
  getApplicationSettings: () => fetchApi('/admin/application-settings'),
  updateApplicationSettings: (data: unknown) => putApi('/admin/application-settings', data),
};
