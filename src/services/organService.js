const USE_MOCK_API = false; // Set true untuk mock API
const API_BASE_URL = "http://localhost:3001/api/organs";

// Helper simulasi loading (bisa dihapus nanti)
const mockDelay = (data) => new Promise(resolve => setTimeout(() => resolve(data), 800));

export const organService = {
  getAll: async () => {
    if (USE_MOCK_API) {
      return mockDelay([
        { id: 1, name: "Jantung", description: "Pompa darah.", funFact: "Detak 100k/hari.", model3D_Url: "[https://example.com](https://example.com)" },
        { id: 2, name: "Paru-Paru", description: "Bernapas.", funFact: "Sepasang.", model3D_Url: "" },
      ]);
    }
    const res = await fetch(`${API_BASE_URL}`);
    if (!res.ok) throw new Error("Gagal fetch data");
    const json = await res.json();
    return json.data; // Sesuaikan dengan response API kamu
  },
  
  create: async (data) => {
    if (USE_MOCK_API) return mockDelay({ ...data, id: Date.now() });
    const res = await fetch(`${API_BASE_URL}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Gagal create data");
    const json = await res.json();
    return json.data;
  },

  update: async (id, data) => {
    if (USE_MOCK_API) return mockDelay({ ...data, id });
    const res = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Gagal update data");
    const json = await res.json();
    return json.data;
  },

  delete: async (id) => {
    if (USE_MOCK_API) return mockDelay(true);
    const res = await fetch(`${API_BASE_URL}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error("Gagal delete data");
    return true;
  }
};
