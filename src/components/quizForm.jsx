import { useState } from 'react';
import { Loader2, Plus, Trash2, CheckCircle, GripVertical } from 'lucide-react'; 
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";

export function QuizForm({ initialData, onSubmit, onCancel, isSubmitting }) {
    // --- 1. STATE INITIALIZATION (PINTER) ---
    // Cek dulu: Ada data lama ga? Kalau ada, pake itu. Kalau ga, kosongan.

    const [title, setTitle] = useState(initialData?.title || '');
    const [description, setDescription] = useState(initialData?.description || '');

    // Logic khusus buat Questions:
    // Kita harus mapping data dari backend biar strukturnya cocok sama state frontend
    const [questions, setQuestions] = useState(() => {
        if (initialData?.questions && initialData.questions.length > 0) {
            return initialData.questions.map(q => ({
                id: q.id || Math.random(), // Pake ID lama atau generate baru buat key React
                questionText: q.questionText,
                options: q.options.map(opt => ({
                    optionText: opt.optionText,
                    isCorrect: opt.isCorrect
                }))
            }));
        }
        // Default kalau Buat Baru (1 Soal Kosong)
        return [{
            id: Date.now(),
            questionText: '',
            options: [
                { optionText: '', isCorrect: false },
                { optionText: '', isCorrect: false },
                { optionText: '', isCorrect: false },
                { optionText: '', isCorrect: false }
            ]
        }];
    });

    // --- LOGIC HANDLE SOAL ---
    const addQuestion = () => {
        setQuestions([
            ...questions,
            {
                id: Date.now(),
                questionText: '',
                options: [
                    { optionText: '', isCorrect: false },
                    { optionText: '', isCorrect: false },
                    { optionText: '', isCorrect: false },
                    { optionText: '', isCorrect: false }
                ]
            }
        ]);
    };

    const removeQuestion = (index) => {
        if (questions.length === 1) return; 
        const newQ = [...questions];
        newQ.splice(index, 1);
        setQuestions(newQ);
    };

    const handleQuestionChange = (index, val) => {
        const newQ = [...questions];
        newQ[index].questionText = val;
        setQuestions(newQ);
    };

    // --- LOGIC HANDLE JAWABAN ---
    const handleOptionChange = (qIndex, optIndex, val) => {
        const newQ = [...questions];
        newQ[qIndex].options[optIndex].optionText = val;
        setQuestions(newQ);
    };

    const setCorrectAnswer = (qIndex, optIndex) => {
        const newQ = [...questions];
        newQ[qIndex].options.forEach(opt => opt.isCorrect = false);
        newQ[qIndex].options[optIndex].isCorrect = true;
        setQuestions(newQ);
    };

    // --- SUBMIT ---
    const handleSubmit = (e) => {
        e.preventDefault();

        // Validasi
        if (!title.trim()) return alert("Judul kuis wajib diisi!");

        for (let i = 0; i < questions.length; i++) {
            if (!questions[i].questionText) return alert(`Soal nomor ${i + 1} belum diisi!`);
            const hasCorrect = questions[i].options.some(opt => opt.isCorrect);
            if (!hasCorrect) return alert(`Soal nomor ${i + 1} belum ada Kunci Jawabannya!`);
        }

        const payload = {
            title,
            description,
            questions: questions.map(q => ({
                questionText: q.questionText,
                imageUrl: null, 
                options: q.options.map(opt => ({
                    optionText: opt.optionText,
                    isCorrect: opt.isCorrect
                }))
            }))
        };

        onSubmit(payload);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 py-4">

            {/* HEADER KUIS */}
            <div className="space-y-4 p-4 border rounded-lg bg-slate-50">
                <div className="grid gap-2">
                    <Label htmlFor="title">Judul Kuis <span className="text-red-500">*</span></Label>
                    <Input
                        id="title"
                        placeholder="Contoh: Kuis Sistem Pencernaan Level 1"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        required
                        className="font-bold text-lg bg-white"
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="desc">Deskripsi Singkat</Label>
                    <Textarea
                        id="desc"
                        placeholder="Jelaskan kuis ini tentang apa..."
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        className="bg-white"
                    />
                </div>
            </div>

            {/* LIST SOAL */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        Daftar Pertanyaan
                        <Badge variant="secondary">{questions.length} Soal</Badge>
                    </h3>
                </div>

                {questions.map((q, qIndex) => (
                    <Card key={q.id} className="relative border-slate-200 shadow-sm overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-900"></div>
                        <CardContent className="pt-6 pl-6">
                            <div className="flex justify-between items-start mb-4">
                                <Label className="text-base font-semibold">Pertanyaan #{qIndex + 1}</Label>
                                {questions.length > 1 && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeQuestion(qIndex)}
                                        className="text-red-500 hover:bg-red-50 hover:text-red-600"
                                    >
                                        <Trash2 className="h-4 w-4 mr-1" /> Hapus Soal
                                    </Button>
                                )}
                            </div>

                            <Textarea
                                placeholder="Tulis pertanyaan di sini..."
                                value={q.questionText}
                                onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
                                className="mb-6 resize-none min-h-[80px] text-base"
                            />

                            {/* OPSI JAWABAN */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {q.options.map((opt, optIndex) => (
                                    <div
                                        key={optIndex}
                                        className={`flex items-center gap-2 p-2 rounded-md border transition-colors ${opt.isCorrect ? 'border-green-500 bg-green-50 ring-1 ring-green-500' : 'border-slate-200'}`}
                                    >
                                        <div className="flex items-center justify-center h-8 w-8 shrink-0">
                                            <input
                                                type="radio"
                                                name={`correct-${q.id}`}
                                                checked={opt.isCorrect}
                                                onChange={() => setCorrectAnswer(qIndex, optIndex)}
                                                className="w-4 h-4 cursor-pointer accent-green-600"
                                            />
                                        </div>
                                        <Input
                                            placeholder={`Pilihan ${String.fromCharCode(65 + optIndex)}`}
                                            value={opt.optionText}
                                            onChange={(e) => handleOptionChange(qIndex, optIndex, e.target.value)}
                                            className="border-none shadow-none focus-visible:ring-0 bg-transparent px-0 h-auto py-1"
                                        />
                                        {opt.isCorrect && <CheckCircle className="h-4 w-4 text-green-600 mr-2 shrink-0" />}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}

                <Button
                    type="button"
                    variant="outline"
                    onClick={addQuestion}
                    className="w-full border-dashed border-2 py-8 text-slate-500 hover:border-slate-900 hover:text-slate-900"
                >
                    <Plus className="mr-2 h-5 w-5" /> Tambah Pertanyaan Baru
                </Button>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex justify-end gap-3 pt-6 border-t sticky bottom-0 bg-white/90 backdrop-blur-sm py-4 z-10">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Batal
                </Button>
                <Button type="submit" disabled={isSubmitting} className="bg-slate-900 hover:bg-slate-800 text-white min-w-[150px]">
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Menyimpan...
                        </>
                    ) : (
                        // Text Button Berubah sesuai Mode
                        initialData ? 'Simpan Perubahan' : 'Buat Kuis Baru'
                    )}
                </Button>
            </div>
        </form>
    );
}