import { useState, useRef, useMemo } from 'react';
import JoditEditor from 'jodit-react';
import { Loader2, X, UploadCloud } from 'lucide-react'; 
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
// Pastikan path import ini sesuai sama file config lo (api.js atau apiConfig.js)
import API_BASE_URL from '../config/apiConfig';

export function OrganForm({ initialData, systems = [], onSubmit, onCancel, isSubmitting }) {
  const editor = useRef(null);

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '', 
    funFact: initialData?.funFact || '',
    model3D_Url: initialData?.model3D_Url || '',
    systemId: initialData?.systemId || '', 
  });

  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(initialData?.imageUrl || null);

  // --- CONFIG JODIT EDITOR (SIMPLIFIED & FIXED) ---
  // Kita samain logic-nya kayak SystemForm yang udah terbukti jalan
  const config = useMemo(() => ({
    readonly: false,
    placeholder: 'Tulis penjelasan lengkap organ di sini...',
    height: 400,
    width: '100%',
    enableDragAndDropFileToEditor: true,
    toolbarAdaptive: false,
    buttons: [
      'bold', 'italic', 'underline', 'strikethrough', '|',
      'ul', 'ol', '|',
      'image', 'video', 'link', 'table', '|',
      'hr', 'eraser', 'copyformat', '|',
      'fullsize', 'preview', 'print', 'source'
    ],
    // Config Upload Simple (Copy dari SystemForm)
    uploader: {
      insertImageAsBase64URI: false,
      url: `${API_BASE_URL}/upload-media`,
      format: 'json',
      method: 'POST',
      filesVariableName: 'file', // Pake string aja, jangan function
      headers: {
        // 'Authorization': 'Bearer token' // Kalo butuh auth
      },
      // Simple process: ambil URL dari respon backend
      process: function (resp) { 
        return { files: [resp.url] }; 
      },
      error: function (e) { 
        console.error("Gagal upload:", e);
        // Alert cuma kalau error parah
        if (e.message !== "Abort") alert("Gagal upload gambar.");
      }
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
    dataToSend.append('funFact', formData.funFact);
    dataToSend.append('model3D_Url', formData.model3D_Url);
    
    if (formData.systemId) {
        dataToSend.append('systemId', formData.systemId);
    }

    if (imageFile) {
      dataToSend.append('image', imageFile);
    }

    onSubmit(dataToSend);
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 py-4">
      
      {/* 1. Foto Organ (Thumbnail) */}
      <div className="grid gap-2">
        <Label>Foto Organ (Thumbnail)</Label>
        <div className="flex items-start gap-4 p-4 border rounded-lg bg-slate-50 transition-colors hover:bg-slate-100/50">
            {previewUrl ? (
                <div className="relative w-32 h-32 border rounded-md overflow-hidden bg-white shadow-sm shrink-0 group">
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    {imageFile && (
                        <button 
                            type="button"
                            onClick={() => { setImageFile(null); setPreviewUrl(initialData?.imageUrl || null); }}
                            className="absolute top-1 right-1 bg-red-500/90 text-white rounded-full p-1 hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>
            ) : (
                <div className="w-32 h-32 border-2 border-dashed border-slate-300 rounded-md flex flex-col items-center justify-center text-slate-400 bg-white shrink-0">
                    <UploadCloud size={24} className="mb-2 opacity-50" />
                    <span className="text-[10px] text-center px-2">No Image</span>
                </div>
            )}
            
            <div className="flex-1 space-y-3 pt-1">
                <div className="space-y-1">
                    <Label htmlFor="image" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Upload File
                    </Label>
                    <Input 
                        id="image" 
                        type="file" 
                        accept="image/*"
                        onChange={handleFileChange}
                        className="cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                    Upload foto utama yang akan muncul sebagai icon/thumbnail di menu aplikasi AR. 
                    <br/><span className="italic opacity-70">Max size: 5MB. Format: JPG, PNG.</span>
                </p>
            </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
          <div className="grid gap-2">
            <Label htmlFor="name">Nama Organ <span className="text-red-500">*</span></Label>
            <Input 
              id="name" 
              placeholder="Contoh: Jantung" 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              required
              className="font-medium"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="systemId">Sistem Organ</Label>
            <select
                id="systemId"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.systemId}
                onChange={e => setFormData({...formData, systemId: e.target.value})}
            >
                <option value="">-- Pilih Sistem Organ --</option>
                {systems?.map((sys) => (
                    <option key={sys.id} value={sys.id}>
                        {sys.name}
                    </option>
                ))}
            </select>
            <p className="text-[10px] text-muted-foreground">
                Organ ini termasuk dalam sistem apa? (e.g. Pencernaan)
            </p>
          </div>
      </div>
      
      {/* 3. JODIT EDITOR */}
      <div className="grid gap-2">
        <Label htmlFor="description" className="flex items-center justify-between">
            <span>Deskripsi Lengkap <span className="text-red-500">*</span></span>
            <span className="text-[10px] font-normal text-muted-foreground bg-slate-100 px-2 py-0.5 rounded-full">
                Rich Text Supported
            </span>
        </Label>
        <div className="bg-white border rounded-md shadow-sm overflow-hidden min-h-[400px]"> 
            <JoditEditor
                ref={editor}
                value={formData.description}
                config={config}
                tabIndex={1} 
                onBlur={newContent => handleDescriptionChange(newContent)} 
                onChange={() => {}} 
            />
        </div>
        <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            Gunakan icon <strong>Image</strong> di toolbar untuk menyisipkan gambar ilustrasi ke dalam artikel.
        </p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="funFact">Fun Fact (Opsional)</Label>
        <Input 
          id="funFact" 
          placeholder="Fakta unik yang jarang diketahui..." 
          value={formData.funFact}
          onChange={e => setFormData({...formData, funFact: e.target.value})}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="modelUrl">URL Model 3D (Asset Bundle)</Label>
        <Input 
          id="modelUrl" 
          placeholder="https://..." 
          value={formData.model3D_Url}
          onChange={e => setFormData({...formData, model3D_Url: e.target.value})}
          className="font-mono text-xs"
        />
      </div>

      <div className="flex justify-end gap-3 mt-6 pt-6 border-t bg-white sticky bottom-0 z-10">
        <Button type="button" variant="outline" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit" disabled={isSubmitting} className="bg-slate-900 hover:bg-slate-800 text-white min-w-[140px]">
          {isSubmitting ? (
            <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menyimpan...
            </>
          ) : (
            initialData ? 'Simpan Perubahan' : 'Tambah Organ'
          )}
        </Button>
      </div>
    </form>
  );
}