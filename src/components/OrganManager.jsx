import { useState, useEffect } from 'react';
import {
    Plus, Search, Pencil, Trash2, Loader2, Database, Box, Activity
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
            const data = await organService.getAll();
            setOrgans(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
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
            setIsModalOpen(false);
        } catch (error) {
            alert("Gagal save data.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Yakin hapus?")) return;
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Missing Model</CardTitle>
                        <Activity className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent><div className="text-2xl font-bold text-orange-600">{stats.missing}</div></CardContent>
                </Card>
            </div>

            {/* Table Area */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold">Data Organ</h2>
                    <Button onClick={() => { setEditingOrgan(null); setIsModalOpen(true); }} className="bg-slate-900">
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
                                <TableHead>Nama</TableHead>
                                <TableHead className="hidden md:table-cell">Deskripsi</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={5} className="text-center h-24">Loading...</TableCell></TableRow>
                            ) : filteredData.map(organ => (
                                <TableRow key={organ.id}>
                                    <TableCell className="font-mono text-xs">#{organ.id}</TableCell>
                                    <TableCell className="font-medium">{organ.name}</TableCell>
                                    <TableCell className="hidden md:table-cell truncate max-w-xs">{organ.description}</TableCell>
                                    <TableCell>
                                        {organ.model3D_Url ? <Badge className="bg-emerald-50 text-emerald-700">Ready</Badge> : <Badge variant="outline">Missing</Badge>}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => { setEditingOrgan(organ); setIsModalOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(organ.id)} className="text-red-500 hover:text-red-700"><Trash2 className="h-4 w-4" /></Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingOrgan ? 'Edit Data' : 'Tambah Baru'}</DialogTitle>
                        <DialogDescription>Masukkan detail data organ di bawah ini.</DialogDescription>
                    </DialogHeader>
                    <OrganForm
                        key={editingOrgan ? editingOrgan.id : 'new'}
                        initialData={editingOrgan}
                        onSubmit={handleSave}
                        onCancel={() => setIsModalOpen(false)}
                        isSubmitting={isSubmitting}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
