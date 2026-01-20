import API_BASE_URL, { USE_MOCK_API } from '../config/apiConfig';

// Helper simulasi loading
const mockDelay = (data) => new Promise(resolve => setTimeout(() => resolve(data), 800));

export const quizService = {
    // --- QUIZZES ---
    getAllQuizzes: async () => {
        if (USE_MOCK_API) return mockDelay([]);
        const res = await fetch(`${API_BASE_URL}/quizzes`); 
        if (!res.ok) throw new Error("Gagal fetch data kuis");
        const json = await res.json();
        return json.data;
    },

    getQuizById: async (id) => {
        if (USE_MOCK_API) return mockDelay({});
        const res = await fetch(`${API_BASE_URL}/quizzes/${id}`);
        if (!res.ok) throw new Error("Gagal fetch detail kuis");
        const json = await res.json();
        return json.data;
    },

    // Create Kuis + Soal + Jawaban (Nested)
    createQuiz: async (quizData) => {
        if (USE_MOCK_API) return mockDelay({ id: Date.now() });

        const res = await fetch(`${API_BASE_URL}/quizzes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json', 
            },
            body: JSON.stringify(quizData)
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message || "Gagal create kuis");
        }
        const json = await res.json();
        return json.data;
    },

    deleteQuiz: async (id) => {
        const res = await fetch(`${API_BASE_URL}/quizzes/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error("Gagal delete kuis");
        return true;
    },

    // --- STUDENTS / SCORES ---
    getAllStudents: async () => {
        if (USE_MOCK_API) return mockDelay([
            { id: 1, fullName: "Budi", grade: "XII IPA 1", points: 100, deviceId: "xyz" }
        ]);

        const res = await fetch(`${API_BASE_URL}/users`);
        if (!res.ok) throw new Error("Gagal fetch data siswa");
        const json = await res.json();
        return json.data;
    },
    updateQuiz: async (id, quizData) => {
        if (USE_MOCK_API) return mockDelay({ id, ...quizData });

        const res = await fetch(`${API_BASE_URL}/quizzes/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(quizData)
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message || "Gagal update kuis");
        }
        const json = await res.json();
        return json.data;
    },
};
