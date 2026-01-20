import { useState, useEffect } from "react";
import { Search, Trophy, Smartphone, User } from "lucide-react";
import { quizService } from "../services/quizService";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Badge } from "./ui/badge";

export default function ScoreManager() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Pastikan endpoint GET /users udah ada di backend ya
      const data = await quizService.getAllStudents();
      setStudents(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = students.filter(
    (s) =>
      s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.grade.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Sort by Points (Tertinggi di atas)
  const sortedData = [...filteredData].sort((a, b) => b.points - a.points);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold tracking-tight">Data Nilai Siswa</h2>
        <p className="text-muted-foreground">
          Monitoring poin dan aktivitas siswa secara realtime.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Siswa</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Score</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {students.length > 0
                ? Math.max(...students.map((s) => s.points))
                : 0}{" "}
              pts
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <div className="p-4 border-b">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Cari nama siswa atau kelas..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Rank</TableHead>
              <TableHead>Nama Siswa</TableHead>
              <TableHead>Kelas</TableHead>
              <TableHead>Device ID (HP)</TableHead>
              <TableHead className="text-right">Total Poin</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24">
                  Loading data siswa...
                </TableCell>
              </TableRow>
            ) : sortedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center h-24 text-muted-foreground"
                >
                  Tidak ada data siswa.
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((student, index) => (
                <TableRow key={student.id}>
                  <TableCell className="font-bold text-slate-500">
                    {index + 1}
                  </TableCell>
                  <TableCell className="font-medium">
                    {student.fullName}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{student.grade}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground font-mono">
                    <div className="flex items-center gap-1">
                      <Smartphone className="h-3 w-3" />
                      {student.deviceId}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-bold text-lg text-slate-900">
                    {student.points} pts
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
