import { useState, useRef, useMemo } from 'react';
import JoditEditor from 'jodit-react';
import { Loader2, X, UploadCloud } from 'lucide-react'; 
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import API_BASE_URL, { USE_MOCK_API } from '../config/apiConfig';


export function SystemForm({ initialData, onSubmit, onCancel, isSubmitting }) {
  const editor = useRef(null);

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '', 
    process: initialData?.process || '', // Field khusus Sistem Organ
  });

  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(initialData?.imageUrl || null);

  // --- CONFIG JODIT EDITOR ---
  const config = useMemo(() => ({
    readonly: false,
    placeholder: 'Jelaskan sistem ini secara umum...',
    height: 300,
    width: '100%',
    enableDragAndDropFileToEditor: true,
    toolbarAdaptive: false,
    buttons: [
      'bold', 'italic', 'underline', 'ul', 'ol', '|',
      'image', 'link', 'table', '|',
      'fullsize', 'preview'
    ],
    uploader: {
      insertImageAsBase64URI: false,
      url: `${API_BASE_URL}/upload-media`,
      format: 'json',
      method: 'POST',
      filesVariableName: 'file',
      process: function (resp) { return { files: [resp.url] }; },
      error: function (e) { console.error("Gagal upload:", e); }
    },
    statusbar: true,
  }), []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleDescriptionChange = (newContent) => {
    setFormData(prev => ({ ...prev, description: newContent }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const dataToSend = new FormData();
    dataToSend.append('name', formData.name);
    dataToSend.append('description', formData.description);
    dataToSend.append('process', formData.process);

    if (imageFile) {
      dataToSend.append('image', imageFile);
    }

    onSubmit(dataToSend);
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 py-4">
      
      {/* FOTO UTAMA SISTEM */}
      <div className="grid gap-2">
        <Label>Ilustrasi Sistem (Thumbnail)</Label>
        <div className="flex items-start gap-4 p-4 border rounded-lg bg-slate-50">
            {previewUrl ? (
                <div className="relative w-32 h-32 border rounded-md overflow-hidden bg-white shadow-sm shrink-0">
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    {imageFile && (
                        <button 
                            type="button"
                            onClick={() => { setImageFile(null); setPreviewUrl(initialData?.imageUrl || null); }}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                            <X size={12} />
                        </button>
                    )}
                </div>
            ) : (
                <div className="w-32 h-32 border-2 border-dashed border-slate-300 rounded-md flex flex-col items-center justify-center text-slate-400 bg-white shrink-0">
                    <UploadCloud size={24} className="mb-2 opacity-50" />
                    <span className="text-[10px] text-center">No Image</span>
                </div>
            )}
            
            <div className="flex-1 space-y-2">
                <Input 
                    type="file" 
                    accept="image/*"
                    onChange={handleFileChange}
                    className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground">
                    Upload ilustrasi sistem organ (misal: Gambar seluruh pencernaan). Max 5MB.
                </p>
            </div>
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="name">Nama Sistem Organ <span className="text-red-500">*</span></Label>
        <Input 
          id="name" 
          placeholder="Contoh: Sistem Pencernaan" 
          value={formData.name}
          onChange={e => setFormData({...formData, name: e.target.value})}
          required
        />
      </div>
      
      {/* DESKRIPSI (JODIT) */}
      <div className="grid gap-2">
        <Label>Deskripsi Umum</Label>
        <div className="bg-white border rounded-md shadow-sm overflow-hidden"> 
            <JoditEditor
                ref={editor}
                value={formData.description}
                config={config}
                tabIndex={1} 
                onBlur={newContent => handleDescriptionChange(newContent)} 
                onChange={() => {}} 
            />
        </div>
      </div>

      {/* PROSES (TEXTAREA BIASA) */}
      <div className="grid gap-2">
        <Label htmlFor="process">Penjelasan Proses/Urutan</Label>
        <Textarea 
          id="process" 
          placeholder="Jelaskan urutan kerja sistem ini. Contoh: Makanan masuk mulut -> Kerongkongan -> Lambung..." 
          value={formData.process}
          onChange={e => setFormData({...formData, process: e.target.value})}
          className="h-32 font-sans"
        />
        <p className="text-xs text-muted-foreground">
          Jelaskan alur atau mekanisme kerja sistem ini secara ringkas.
        </p>
      </div>

      <div className="flex justify-end gap-3 mt-4 pt-4 border-t sticky bottom-0 bg-white z-10">
        <Button type="button" variant="outline" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit" disabled={isSubmitting} className="bg-slate-900 hover:bg-slate-800 text-white">
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {initialData ? 'Simpan Perubahan' : 'Buat Sistem Baru'}
        </Button>
      </div>
    </form>
  );
}