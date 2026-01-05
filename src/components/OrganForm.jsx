import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label"; // Pastikan punya komponen Label
// Kalau Textarea belum ada di ui/textarea, pake Input dulu atau bikin Textarea.jsx
import { Textarea } from "../components/ui/textarea"; 

export function OrganForm({ initialData, onSubmit, onCancel, isSubmitting }) {
  // FIX: Langsung init state dari props. Gak butuh useEffect.
  const [formData, setFormData] = useState(initialData || {
    name: '',
    description: '',
    funFact: '',
    model3D_Url: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Nama Organ</Label>
        <Input 
          id="name" 
          placeholder="Contoh: Jantung" 
          value={formData.name}
          onChange={e => setFormData({...formData, name: e.target.value})}
          required
        />
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="description">Deskripsi</Label>
        <Textarea 
          id="description" 
          placeholder="Jelaskan fungsi organ ini..." 
          value={formData.description}
          onChange={e => setFormData({...formData, description: e.target.value})}
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="funFact">Fun Fact (Opsional)</Label>
        <Input 
          id="funFact" 
          placeholder="Fakta unik..." 
          value={formData.funFact}
          onChange={e => setFormData({...formData, funFact: e.target.value})}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="modelUrl">URL Model 3D</Label>
        <Input 
          id="modelUrl" 
          placeholder="https://..." 
          value={formData.model3D_Url}
          onChange={e => setFormData({...formData, model3D_Url: e.target.value})}
        />
      </div>

      <div className="flex justify-end gap-3 mt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? 'Simpan Perubahan' : 'Tambah Organ'}
        </Button>
      </div>
    </form>
  );
}