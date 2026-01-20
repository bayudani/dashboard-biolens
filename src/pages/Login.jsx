import { useState } from 'react';
import { Box, User, Lock, X } from 'lucide-react';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";

export default function Login({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (username === 'admin' && password === 'admin') {
            onLogin(); 
        } else {
            setError('Username atau password salah (Coba: admin/admin)');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <Card className="w-full max-w-md shadow-xl border-slate-200">
                <CardHeader className="space-y-1 text-center pb-2">
                    <div className="flex justify-center mb-4">
                        <div className="h-12 w-12 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg">
                            <Box className="h-6 w-6" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold text-slate-900">BioLens Admin</CardTitle>
                    <CardDescription>Login untuk masuk ke halaman admin</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Username</label>
                            <div className="relative">
                                <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="admin"
                                    className="pl-9"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                <Input
                                    type="password"
                                    className="pl-9"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="text-red-500 text-xs font-bold bg-red-50 p-3 rounded-lg flex items-center gap-2">
                                <X className="h-4 w-4" /> {error}
                            </div>
                        )}

                        <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 font-bold">
                            Masuk
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}