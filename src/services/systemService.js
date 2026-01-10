import api from "../api/apiService.js";

const USE_MOCK_API = false;
const API_BASE_URL = api; 

const mockDelay = (data) => new Promise(resolve => setTimeout(() => resolve(data), 800));

export const systemService = {
  getAll: async () => {
    if (USE_MOCK_API) return mockDelay([]);
    const res = await fetch(`${API_BASE_URL}`);
    if (!res.ok) throw new Error("Gagal fetch data sistem");
    const json = await res.json();
    return json.data; 
  },

  getById: async (id) => {
    const res = await fetch(`${API_BASE_URL}/${id}`);
    if (!res.ok) throw new Error("Gagal fetch detail sistem");
    const json = await res.json();
    return json.data;
  },
  
  create: async (formData) => {
    if (USE_MOCK_API) return mockDelay({ id: Date.now() });
    
    const res = await fetch(`${API_BASE_URL}`, {
      method: 'POST',
      body: formData 
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Gagal create data");
    }
    const json = await res.json();
    return json.data;
  },

  update: async (id, formData) => {
    if (USE_MOCK_API) return mockDelay({ id });
    
    const res = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      body: formData
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Gagal update data");
    }
    const json = await res.json();
    return json.data;
  },

  delete: async (id) => {
    if (USE_MOCK_API) return mockDelay(true);
    const res = await fetch(`${API_BASE_URL}/${id}`, { method: 'DELETE' });
    if (!res.ok) {
        const err = await res.json();
        // Handle error foreign key (masih ada organ di dalamnya)
        throw new Error(err.message || "Gagal delete data");
    }
    return true;
  }
};