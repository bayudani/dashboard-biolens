import { useState, useEffect } from 'react';
import {
    Plus, Search, Pencil, Trash2, Network, FolderTree, Layers, ImageIcon
} from 'lucide-react';

import { systemService } from '../services/systemService';
import { SystemForm } from './SystemForm';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Separator } from "../components/ui/separator";

export default function SystemManager() {
    const [systems, setSystems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSystem, setEditingSystem] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await systemService.getAll();
            setSystems(data);
        } catch (error) {
            console.error("Gagal load systems:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (system) => {
        setEditingSystem(system);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setEditingSystem(null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setTimeout(() => setEditingSystem(null), 300);
    };

    const handleSave = async (formData) => {
        setIsSubmitting(true);
        try {
            if (editingSystem) {
                const updated = await systemService.update(editingSystem.id, formData);
                setSystems(prev => prev.map(item => item.id === editingSystem.id ? updated : item));
            } else {
                const created = await systemService.create(formData);
                setSystems(prev => [...prev, created]);
            }
            handleCloseModal();
        } catch (error) {
            alert("Gagal save data: " + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Yakin hapus sistem ini? Pastikan tidak ada organ yang terhubung!")) return;
        try {
            await systemService.delete(id);
            setSystems(prev => prev.filter(item => item.id !== id));
        } catch (error) {
            alert("Gagal hapus: " + error.message);
        }
    };

    const filteredData = systems.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8">
            {/* Stats Simple */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Sistem Organ</CardTitle>
                        <Network className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent><div className="text-2xl font-bold">{systems.length}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Organ Terhubung</CardTitle>
                        <Layers className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        {/* Hitung total organ dari semua sistem */}
                        <div className="text-2xl font-bold">
                            {systems.reduce((acc, curr) => acc + (curr.organs?.length || 0), 0)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Table Area */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold">Data Sistem Organ</h2>
                    <Button onClick={handleCreate} className="bg-slate-900">
                        <Plus className="mr-2 h-4 w-4" /> Tambah Sistem
                    </Button>
                </div>
                <Separator />

                <Card>
                    <div className="p-4 border-b flex items-center">
                        <div className="relative flex-1 md:max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                            <Input placeholder="Cari sistem..." className="pl-9" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                        </div>
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                {/* <TableHead>Ilustrasi</TableHead> */}
                                <TableHead>Nama Sistem</TableHead>
                                <TableHead className="hidden md:table-cell">Deskripsi</TableHead>
                                <TableHead>Jumlah Organ</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={6} className="text-center h-24">Loading...</TableCell></TableRow>
                            ) : filteredData.length === 0 ? (
                                <TableRow><TableCell colSpan={6} className="text-center h-24 text-muted-foreground">Tidak ada data.</TableCell></TableRow>
                            ) : filteredData.map(sys => (
                                <TableRow key={sys.id}>
                                    <TableCell className="font-mono text-xs">#{sys.id}</TableCell>
                                    {/* <TableCell>
                                        {sys.imageUrl ? (
                                            <div className="w-10 h-10 rounded overflow-hidden border bg-slate-50">
                                                <img src={sys.imageUrl} alt={sys.name} className="w-full h-full object-cover" />
                                            </div>
                                        ) : (
                                            <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center">
                                                <ImageIcon className="h-4 w-4 text-slate-400" />
                                            </div>
                                        )}
                                    </TableCell> */}
                                    <TableCell className="font-medium">{sys.name}</TableCell>
                                    <TableCell className="hidden md:table-cell truncate max-w-xs text-muted-foreground text-xs">
                                        {(sys.description || '').replace(/<[^>]*>?/gm, '').substring(0, 50)}...
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="flex w-fit items-center gap-1">
                                            <FolderTree size={12} />
                                            {sys.organs?.length || 0} Organ
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(sys)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(sys.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
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
                        <DialogTitle>{editingSystem ? 'Edit Sistem' : 'Tambah Sistem Baru'}</DialogTitle>
                        <DialogDescription>Kelola data induk sistem organ (e.g. Pencernaan, Pernapasan).</DialogDescription>
                    </DialogHeader>
                    
                    <SystemForm
                        key={editingSystem ? editingSystem.id : 'new'}
                        initialData={editingSystem}
                        onSubmit={handleSave}
                        onCancel={handleCloseModal}
                        isSubmitting={isSubmitting}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}