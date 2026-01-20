import { useState, useEffect } from 'react';
import { Plus, FileQuestion, Trash2, Pencil } from 'lucide-react'; 
import { quizService } from '../services/quizService';
import { QuizForm } from './quizForm';
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";

export default function QuizManager() {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // State buat nyimpen data kuis yang lagi diedit (null kalau mode create)
    const [editingQuiz, setEditingQuiz] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await quizService.getAllQuizzes();
            setQuizzes(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // --- HANDLERS ---

    const handleCreate = () => {
        setEditingQuiz(null); // Reset ke null biar jadi mode "Create"
        setIsModalOpen(true);
    };

    const handleEdit = async (id) => {
        // Ambil detail lengkap dulu dari API (soalnya di tabel biasanya cuma summary)
        try {
            const fullData = await quizService.getQuizById(id);
            setEditingQuiz(fullData); // Isi state dengan data lama
            setIsModalOpen(true);
        } catch (error) {
            alert("Gagal load detail kuis: " + error.message);
        }
    };

    const handleSave = async (payload) => {
        setIsSubmitting(true);
        try {
            if (editingQuiz) {
                // Mode Update
                await quizService.updateQuiz(editingQuiz.id, payload);
            } else {
                // Mode Create
                await quizService.createQuiz(payload);
            }
            await loadData(); // Refresh tabel
            setIsModalOpen(false);
        } catch (error) {
            alert("Gagal simpan kuis: " + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Yakin hapus kuis ini? Semua soal di dalamnya akan hilang permanen.")) return;
        try {
            await quizService.deleteQuiz(id);
            setQuizzes(prev => prev.filter(q => q.id !== id));
        } catch (error) {
            alert("Gagal hapus kuis.");
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Management Kuis</h2>
                    <p className="text-muted-foreground">Buat dan atur soal latihan untuk siswa.</p>
                </div>
                <Button onClick={handleCreate} className="bg-slate-900 hover:bg-slate-800">
                    <Plus className="mr-2 h-4 w-4" /> Buat Kuis Baru
                </Button>
            </div>

            <Card className="border-slate-200 shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50 hover:bg-slate-50">
                            <TableHead className="w-[50px]">ID</TableHead>
                            <TableHead>Judul Kuis</TableHead>
                            <TableHead>Deskripsi</TableHead>
                            <TableHead>Jumlah Soal</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={5} className="text-center h-24 text-slate-500">Loading data...</TableCell></TableRow>
                        ) : quizzes.length === 0 ? (
                            <TableRow><TableCell colSpan={5} className="text-center h-24 text-slate-500">Belum ada kuis yang dibuat.</TableCell></TableRow>
                        ) : quizzes.map((quiz) => (
                            <TableRow key={quiz.id} className="hover:bg-slate-50/50 transition-colors">
                                <TableCell className="font-mono text-xs text-slate-500">#{quiz.id}</TableCell>
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-blue-50 text-blue-600 rounded">
                                            <FileQuestion className="h-4 w-4" />
                                        </div>
                                        {quiz.title}
                                    </div>
                                </TableCell>
                                <TableCell className="text-muted-foreground text-sm max-w-xs truncate">
                                    {quiz.description || "-"}
                                </TableCell>
                                <TableCell>
                                    <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                                        {quiz._count?.questions || 0} Soal
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-1">
                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(quiz.id)} className="text-slate-500 hover:text-slate-900 hover:bg-slate-100">
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(quiz.id)} className="text-red-400 hover:text-red-600 hover:bg-red-50">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>

            {/* MODAL / DIALOG */}
            <Dialog open={isModalOpen} onOpenChange={(open) => !isSubmitting && setIsModalOpen(open)}>
                <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingQuiz ? 'Edit Kuis' : 'Buat Kuis Baru'}</DialogTitle>
                        <DialogDescription>
                            {editingQuiz ? 'Ubah pertanyaan atau kunci jawaban yang sudah ada.' : 'Tambahkan judul, deskripsi, dan daftar pertanyaan.'}
                        </DialogDescription>
                    </DialogHeader>
                    
                    {/* Form Component dipanggil disini */}
                    <QuizForm 
                        initialData={editingQuiz}
                        onSubmit={handleSave} 
                        onCancel={() => setIsModalOpen(false)} 
                        isSubmitting={isSubmitting}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}