// client/vite-project/src/services/itineraryService.ts
import axios from 'axios';
import { backendURL } from '@/utils/env';
import type { Itinerary, ItinerariesResponse } from '@/shared/schema';

const API_URL = `${backendURL}/api/auth/itineraries`;

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'Content-Type': 'application/json',
      'x-auth-token': token || '',
    },
  };
};

export const itineraryService = {
  // Get all itineraries with pagination
  getAll: async (page = 1, limit = 10): Promise<ItinerariesResponse> => {
    const response = await axios.get(
      `${API_URL}?page=${page}&limit=${limit}`,
      getAuthHeader()
    );
    return response.data;
  },

  // Get single itinerary
  getById: async (id: string): Promise<Itinerary> => {
    const response = await axios.get(`${API_URL}/${id}`, getAuthHeader());
    return response.data;
  },

  // Create new itinerary
  create: async (itineraryData: Partial<Itinerary>): Promise<Itinerary> => {
    const response = await axios.post(API_URL, itineraryData, getAuthHeader());
    return response.data.itinerary;
  },

  // ✨ UPDATE: Change PUT to PATCH for partial updates
  update: async (id: string, itineraryData: Partial<Itinerary>): Promise<Itinerary> => {
    const response = await axios.patch(  // ← Changed from PUT to PATCH
      `${API_URL}/${id}`,
      itineraryData,
      getAuthHeader()
    );
    return response.data.itinerary;
  },

  // Delete itinerary
  delete: async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/${id}`, getAuthHeader());
  },

  // ✨ FIX: Use PATCH instead of PUT (matches backend route we added)
  toggleFavorite: async (id: string, isFavorite: boolean): Promise<Itinerary> => {
    const response = await axios.patch(  // ← Changed from PUT to PATCH
      `${API_URL}/${id}`,
      { isFavorite },
      getAuthHeader()
    );
    return response.data.itinerary;
  },
};