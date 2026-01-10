
import API_BASE_URL, { USE_MOCK_API } from '../config/apiConfig';

// Helper simulasi loading
const mockDelay = (data) => new Promise(resolve => setTimeout(() => resolve(data), 800));

export const organService = {
  // --- ORGANS ---
  getAll: async () => {
    if (USE_MOCK_API) return mockDelay([]);
    const res = await fetch(`${API_BASE_URL}/organs`);
    if (!res.ok) throw new Error("Gagal fetch data organ");
    const json = await res.json();
    return json.data; 
  },

  // Fungsi Baru: Ambil list sistem organ buat dropdown
  getSystems: async () => {
    if (USE_MOCK_API) return mockDelay([{id: 1, name: "Pencernaan"}, {id: 2, name: "Pernapasan"}]);
    const res = await fetch(`${API_BASE_URL}/systems`);
    if (!res.ok) throw new Error("Gagal fetch data sistem");
    const json = await res.json();
    return json.data; 
  },
  
  create: async (formData) => {
    if (USE_MOCK_API) return mockDelay({ id: Date.now() });
    
    // Kirim ke /organs
    const res = await fetch(`${API_BASE_URL}/organs`, {
      method: 'POST',
      body: formData // Browser set Content-Type automatically
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
    
    const res = await fetch(`${API_BASE_URL}/organs/${id}`, {
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
    const res = await fetch(`${API_BASE_URL}/organs/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error("Gagal delete data");
    return true;
  }
};