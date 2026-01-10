import { useState, useEffect } from 'react';
import { 
    Database, Network, Box, Activity, ArrowRight, Plus 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { organService } from '../services/organService';
import { systemService } from '../services/systemService';

export default function DashboardHome({ onChangeView }) {
    const [stats, setStats] = useState({
        totalOrgans: 0,
        totalSystems: 0,
        readyModels: 0,
        recentOrgans: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStats = async () => {
            try {
                const [organs, systems] = await Promise.all([
                    organService.getAll(),
                    systemService.getAll()
                ]);

                setStats({
                    totalOrgans: organs.length,
                    totalSystems: systems.length,
                    // readyModels: organs.filter(o => o.model3D_Url).length,
                    // Ambil 5 organ terakhir (asumsi ID auto increment, yg gede yg baru)
                    recentOrgans: [...organs].sort((a, b) => b.id - a.id).slice(0, 5)
                });
            } catch (error) {
                console.error("Gagal load dashboard stats:", error);
            } finally {
                setLoading(false);
            }
        };

        loadStats();
    }, []);

    const statCards = [
        {
            title: "Total Organ",
            value: stats.totalOrgans,
            icon: Database,
            color: "text-blue-600",
            bg: "bg-blue-50",
            desc: "Organ tersimpan di database"
        },
        {
            title: "Sistem Organ",
            value: stats.totalSystems,
            icon: Network,
            color: "text-purple-600",
            bg: "bg-purple-50",
            desc: "Kategori sistem tubuh"
        },
        // {
        //     title: "Model 3D Ready",
        //     value: stats.readyModels,
        //     icon: Box,
        //     color: "text-emerald-600",
        //     bg: "bg-emerald-50",
        //     desc: "Asset bundle siap AR"
        // }
    ];

    if (loading) {
        return <div className="p-8 text-center text-slate-400">Loading dashboard...</div>;
    }

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Selamat Datang, Admin! 👋</h2>
                    <p className="text-slate-500 mt-1">Ini ringkasan data aplikasi BioLens hari ini.</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => onChangeView('organs')} variant="outline" className="hidden md:flex">
                        Lihat Data Organ
                    </Button>
                    <Button onClick={() => onChangeView('markers')} className="bg-slate-900 text-white">
                        Generate Marker
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {statCards.map((stat, i) => (
                    <Card key={i} className="border-none shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500">
                                {stat.title}
                            </CardTitle>
                            <div className={`p-2 rounded-lg ${stat.bg}`}>
                                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-slate-400 mt-1">{stat.desc}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity */}
                <Card className="lg:col-span-2 border-none shadow-sm">
                    <CardHeader>
                        <CardTitle>Organ Terbaru Ditambahkan</CardTitle>
                        <CardDescription>5 data organ terakhir yang masuk ke sistem.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stats.recentOrgans.length === 0 ? (
                                <p className="text-sm text-slate-400 text-center py-4">Belum ada data.</p>
                            ) : (
                                stats.recentOrgans.map((organ) => (
                                    <div key={organ.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg group hover:bg-slate-100 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-md bg-white border flex items-center justify-center overflow-hidden">
                                                {organ.imageUrl ? (
                                                    <img src={organ.imageUrl} alt={organ.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Database className="h-4 w-4 text-slate-300" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900">{organ.name}</p>
                                                <p className="text-xs text-slate-500 line-clamp-1">
                                                    {organ.system ? organ.system.name : "Tanpa Sistem"}
                                                </p>
                                            </div>
                                        </div>
                                        {/* <div className="flex items-center gap-3">
                                             {organ.model3D_Url ? (
                                                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none shadow-none">AR Ready</Badge>
                                             ) : (
                                                <Badge variant="outline" className="text-slate-400 border-slate-200">No Model</Badge>
                                             )}
                                        </div> */}
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions / Tips */}
                <div className="space-y-6">
                    <Card className="bg-slate-900 text-white border-none shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5 text-blue-400" />
                                Quick Actions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <p className="text-sm text-slate-300 mb-4">
                                Jalan pintas untuk mengelola konten aplikasi AR kamu.
                            </p>
                            <Button 
                                onClick={() => onChangeView('systems')} 
                                variant="secondary" 
                                className="w-full justify-start hover:bg-slate-100"
                            >
                                <Plus className="mr-2 h-4 w-4" /> Tambah Sistem Baru
                            </Button>
                            <Button 
                                onClick={() => onChangeView('organs')} 
                                className="w-full justify-start bg-slate-700 hover:bg-slate-600 border-none text-white"
                            >
                                <Plus className="mr-2 h-4 w-4" /> Tambah Organ Baru
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-dashed border-2 shadow-none bg-transparent">
                        <CardContent className="p-6 flex flex-col items-center text-center space-y-2">
                            <div className="p-3 bg-blue-50 rounded-full text-blue-600 mb-2">
                                <Network className="h-6 w-6" />
                            </div>
                            <h3 className="font-semibold text-slate-900">Tips Data</h3>
                            <p className="text-xs text-slate-500">
                                Pastikan setiap Organ memiliki Sistem Induk agar struktur data di aplikasi Unity rapi.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}