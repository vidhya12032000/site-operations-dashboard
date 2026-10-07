import axios from "axios";
import type { Site, Installation, Summary, ApiResponse } from "../types";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Sites
export const getSites = async (): Promise<ApiResponse<Site[]>> => {
  const response = await api.get("/sites");
  return response.data;
};

export const createSite = async (site: {
  name: string;
  location: string;
  status: string;
  created_by: number | null;
}): Promise<ApiResponse<Site>> => {
  const response = await api.post("/sites", site);
  return response.data;
};

export const updateSite = async (
  id: number,
  site: {
    name: string;
    location: string;
    status: string;
    created_by: number | null;
  }
): Promise<ApiResponse<Site>> => {
  const response = await api.put(`/sites/${id}`, site);
  return response.data;
};

export const deleteSite = async (
  id: number
): Promise<ApiResponse<Site>> => {
  const response = await api.delete(`/sites/${id}`);
  return response.data;
};

// Installations
export const getInstallations = async (): Promise<
  ApiResponse<Installation[]>
> => {
  const response = await api.get("/installations");
  return response.data;
};

export const createInstallation = async (
  installation: Omit<Installation, "id" | "site_name" | "assigned_to_name" | "created_at">
): Promise<ApiResponse<Installation>> => {
  const response = await api.post("/installations", installation);
  return response.data;
};

// Summary
export const getSummary = async (): Promise<ApiResponse<Summary>> => {
  const response = await api.get("/summary");
  return response.data;
};

export const updateInstallation = async (
  id: number,
  installation: Omit<
    Installation,
    "id" | "site_name" | "assigned_to_name" | "created_at"
  >
): Promise<ApiResponse<Installation>> => {
  const response = await api.put(`/installations/${id}`, installation);
  return response.data;
};

export const deleteInstallation = async (
  id: number
): Promise<ApiResponse<Installation>> => {
  const response = await api.delete(`/installations/${id}`);
  return response.data;
};

export default api;