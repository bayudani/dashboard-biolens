import { useState, useEffect } from 'react';
import {
    Plus, Search, Pencil, Trash2, Database, Box, Activity, ImageIcon
} from 'lucide-react';

import { organService } from '../services/organService';
import { OrganForm } from '../components/OrganForm';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Separator } from "../components/ui/separator";

export default function OrganManager() {
    const [organs, setOrgans] = useState([]);
    const [systems, setSystems] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingOrgan, setEditingOrgan] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            // Promise.allSettled lebih aman biar kalau satu gagal, yg lain tetep jalan
            const results = await Promise.allSettled([
                organService.getAll(),
                organService.getSystems()
            ]);
            
            // Cek hasil fetch organs
            if (results[0].status === 'fulfilled') {
                setOrgans(results[0].value);
            } else {
                console.error("Gagal load organs:", results[0].reason);
            }

            // Cek hasil fetch systems
            if (results[1].status === 'fulfilled') {
                setSystems(results[1].value);
            } else {
                console.error("Gagal load systems:", results[1].reason);
                setSystems([]); // Fallback array kosong
            }

        } catch (error) {
            console.error("Critical error loading data:", error);
        } finally {
            setLoading(false);
        }
    };

    // Fungsi khusus buat buka modal Edit
    const handleEdit = (organ) => {
        setEditingOrgan(organ);
        setIsModalOpen(true);
    };

    // Fungsi khusus buat buka modal Create
    const handleCreate = () => {
        setEditingOrgan(null);
        setIsModalOpen(true);
    };

    // Fungsi tutup modal & reset
    const handleCloseModal = () => {
        setIsModalOpen(false);
        // Kasih delay dikit biar animasi modal kelar dulu baru state di-reset (opsional, tp lebih smooth)
        setTimeout(() => setEditingOrgan(null), 300);
    };

    const handleSave = async (formData) => {
        setIsSubmitting(true);
        try {
            if (editingOrgan) {
                const updated = await organService.update(editingOrgan.id, formData);
                setOrgans(prev => prev.map(item => item.id === editingOrgan.id ? updated : item));
            } else {
                const created = await organService.create(formData);
                setOrgans(prev => [...prev, created]);
            }
            handleCloseModal();
        } catch (error) {
            console.error(error);
            alert("Gagal save data: " + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Yakin hapus organ ini?")) return;
        try {
            await organService.delete(id);
            setOrgans(prev => prev.filter(item => item.id !== id));
        } catch (error) {
            alert("Gagal hapus data.");
        }
    };

    const filteredData = organs.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        total: organs.length,
        ready: organs.filter(o => o.model3D_Url).length,
        missing: organs.filter(o => !o.model3D_Url).length
    };

    return (
        <div className="space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Organ</CardTitle>
                        <Database className="h-4 w-4 text-slate-500" />
                    </CardHeader>
                    <CardContent><div className="text-2xl font-bold">{stats.total}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Model Ready</CardTitle>
                        <Box className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent><div className="text-2xl font-bold text-emerald-600">{stats.ready}</div></CardContent>
                </Card>
                {/* <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Missing Model</CardTitle>
                        <Activity className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent><div className="text-2xl font-bold text-orange-600">{stats.missing}</div></CardContent>
                </Card> */}
            </div>

            {/* Table Area */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold">Data Organ</h2>
                    <Button onClick={handleCreate} className="bg-slate-900">
                        <Plus className="mr-2 h-4 w-4" /> Tambah Data
                    </Button>
                </div>
                <Separator />

                <Card>
                    <div className="p-4 border-b flex items-center">
                        <div className="relative flex-1 md:max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                            <Input placeholder="Cari..." className="pl-9" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                        </div>
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Gambar</TableHead>
                                <TableHead>Nama</TableHead>
                                <TableHead className="hidden md:table-cell">Deskripsi</TableHead>
                                <TableHead>Sistem</TableHead>
                                {/* <TableHead>Status</TableHead> */}
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={7} className="text-center h-24">Loading...</TableCell></TableRow>
                            ) : filteredData.length === 0 ? (
                                <TableRow><TableCell colSpan={7} className="text-center h-24 text-muted-foreground">Tidak ada data.</TableCell></TableRow>
                            ) : filteredData.map(organ => (
                                <TableRow key={organ.id}>
                                    <TableCell className="font-mono text-xs">#{organ.id}</TableCell>
                                    <TableCell>
                                        {organ.imageUrl ? (
                                            <div className="w-10 h-10 rounded overflow-hidden border bg-slate-50">
                                                <img src={organ.imageUrl} alt={organ.name} className="w-full h-full object-cover" />
                                            </div>
                                        ) : (
                                            <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center">
                                                <ImageIcon className="h-4 w-4 text-slate-400" />
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="font-medium">{organ.name}</TableCell>
                                    <TableCell className="hidden md:table-cell truncate max-w-xs text-muted-foreground text-xs">
                                        {/* Guard biar gak error kalo description null */}
                                        {(organ.description || '').replace(/<[^>]*>?/gm, '').substring(0, 50)}...
                                    </TableCell>
                                    <TableCell>
                                        {organ.system ? (
                                            <Badge variant="secondary" className="text-xs">{organ.system.name}</Badge>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">-</span>
                                        )}
                                    </TableCell>
                                    {/* <TableCell>
                                        {organ.model3D_Url ? <Badge className="bg-emerald-50 text-emerald-700">Ready</Badge> : <Badge variant="outline">Missing</Badge>}
                                    </TableCell> */}
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            {/* Pake handleEdit yang baru */}
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(organ)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(organ.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            </div>

            <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
                <DialogContent className="max-w-[90vw] w-full max-h-[95vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingOrgan ? 'Edit Data' : 'Tambah Baru'}</DialogTitle>
                        <DialogDescription>Masukkan detail data organ di bawah ini.</DialogDescription>
                    </DialogHeader>
                    
                    {/* Guard systems biar gak error map of undefined */}
                    <OrganForm
                        key={editingOrgan ? editingOrgan.id : 'new'}
                        initialData={editingOrgan}
                        systems={systems || []} 
                        onSubmit={handleSave}
                        onCancel={handleCloseModal}
                        isSubmitting={isSubmitting}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}