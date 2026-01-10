import { useState, useRef, useCallback } from 'react';
import { toJpeg } from 'html-to-image'; 
import { Printer, Download, Plus, Trash2, CloudUpload, QrCode, Dna } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function MarkerGenerator() {
  const [config, setConfig] = useState({
    appName: 'BIOLENS AR',
    cardNum: '01',
    color: '#4f46e5',
    title: 'RONGGA MULUT',
    sub: 'Sistem Pencernaan Manusia',
    image: '[https://img.freepik.com/free-vector/human-mouth-open-realistic-illustration_1284-59368.jpg](https://img.freepik.com/free-vector/human-mouth-open-realistic-illustration_1284-59368.jpg)',
    logo: null 
  });

  const [queue, setQueue] = useState([]);
  const cardRef = useRef(null);
  const colors = ['#4f46e5', '#ef4444', '#f59e0b', '#10b981', '#06b6d4', '#d946ef', '#1e293b'];
  const [isGenerating, setIsGenerating] = useState(false);

  // Handle upload gambar organ
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setConfig(prev => ({ ...prev, image: e.target.result }));
      reader.readAsDataURL(file);
    }
  };

  // Handle upload logo
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setConfig(prev => ({ ...prev, logo: e.target.result }));
      reader.readAsDataURL(file);
    }
  };

  const addToQueue = () => {
    if (queue.length >= 4) return alert("Maksimal 4 kartu per halaman A4!");
    setQueue([...queue, { ...config, id: Date.now() }]);
  };

  const removeFromQueue = (id) => setQueue(queue.filter(item => item.id !== id));

  const downloadImage = useCallback(async () => {
    if (cardRef.current === null) return;

    try {
      setIsGenerating(true);

      await new Promise((resolve) => setTimeout(resolve, 100));

      // Pake function import langsung dari 'html-to-image'
      const dataUrl = await toJpeg(cardRef.current, { 
        quality: 0.95,
        backgroundColor: '#ffffff', // Pastiin background putih bersih
        // Filter elemen yang gak mau diprint (misal class .do-not-print)
        filter: (node) => !node.classList?.contains('do-not-print'),
        style: {
             // Reset transform biar lurus pas disave, jaga-jaga kalau di preview ada scale
             transform: 'none',
             margin: '0'
        }
      });

      const link = document.createElement('a');
      link.download = `AR-Marker-${config.title.replace(/[^a-zA-Z0-9]/g, '-')}.jpg`;
      link.href = dataUrl;
      link.click();
      
    } catch (error) {
      console.error("Gagal save gambar:", error);
      alert("Gagal simpan gambar. Coba cek koneksi atau gambar yang dipake. Note: Gambar dari internet mungkin kena blokir CORS.");
    } finally {
      setIsGenerating(false);
    }
  }, [config.title]);

  const handlePrint = () => {
    if (queue.length === 0) return alert("Antrean kosong bro!");
    window.print();
  };

  // --- KOMPONEN KARTU ---
  const CardTemplate = ({ data, isPreview = false }) => {
    // Logika crossOrigin: Kalo base64 (upload lokal) gaperlu crossOrigin, kalo URL internet perlu.
    const isBase64 = data.image && data.image.startsWith('data:');
    const imgProps = isBase64 ? {} : { crossOrigin: "anonymous" };
    
    const logoIsBase64 = data.logo && data.logo.startsWith('data:');
    const logoProps = logoIsBase64 ? {} : { crossOrigin: "anonymous" };

    return (
      <div 
        className={`relative bg-white flex flex-col overflow-hidden ${isPreview ? 'shadow-2xl queued-card-preview' : 'queued-card'}`} 
        style={{ width: '350px', height: '550px', border: '12px solid #1f2937' }}
      >
        {/* Header */}
        <div className="px-6 py-4 flex justify-between items-center border-b-2 border-slate-100 bg-white z-10 shrink-0 h-[80px]">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center text-white clip-hex shadow-md overflow-hidden" style={{ backgroundColor: data.color }}>
              {data.logo ? (
                  <img src={data.logo} className="w-full h-full object-cover" alt="logo" {...logoProps} />
              ) : (
                  <Dna className="h-5 w-5" />
              )}
            </div>
            <span className="font-bold text-lg tracking-wider text-slate-900 font-mono truncate">{data.appName}</span>
          </div>
          <span className="bg-slate-900 text-white text-xs font-bold px-2 py-1 rounded font-mono shadow-sm shrink-0">#{data.cardNum}</span>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-4 flex items-center justify-center relative bg-slate-50 min-h-0 overflow-hidden">
           <div className="w-full h-full border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center bg-white/80 relative overflow-hidden shadow-inner"
             style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
             
             {/* GAMBAR ORGAN */}
             <img 
               src={data.image} 
               className="max-w-[90%] max-h-[90%] w-auto h-auto object-contain drop-shadow-xl"
               style={{ mixBlendMode: 'multiply' }} 
               alt="Organ Preview"
               {...imgProps}
             />

           </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-white z-10 border-t-2 border-slate-100 relative shrink-0 h-[140px] flex flex-col justify-center">
          <h2 className="text-3xl font-extrabold text-slate-900 uppercase leading-none mb-2 tracking-tight drop-shadow-sm truncate">{data.title}</h2>
          <p className="text-slate-500 font-semibold text-sm flex items-center gap-2 truncate">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block ring-2 ring-green-100 shrink-0"></span>
            <span className="truncate">{data.sub}</span>
          </p>
          <div className="absolute bottom-0 right-0 w-0 h-0 border-solid border-b-[80px] border-r-[80px] border-l-transparent border-t-transparent z-10 opacity-90" style={{ borderBottomColor: 'transparent', borderRightColor: data.color }}/>
          <div className="absolute bottom-4 right-16 opacity-10 pointer-events-none"><QrCode className="h-12 w-12" /></div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-auto lg:h-[calc(100vh-100px)]">
      {/* --- PANEL KIRI: KONTROL --- */}
      <div className="w-full lg:w-1/3 space-y-6 lg:overflow-y-auto lg:pr-2 pb-10">
        <div className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2"><Printer className="h-5 w-5 text-indigo-600" /> Generator Kontrol</h2>
          
          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-3"><Label>Nama Aplikasi</Label><Input value={config.appName} onChange={e => setConfig({...config, appName: e.target.value})} /></div>
            <div className="col-span-1"><Label>No.</Label><Input value={config.cardNum} onChange={e => setConfig({...config, cardNum: e.target.value})} /></div>
          </div>
          
          <div>
            <Label className="mb-2 block">Warna & Logo</Label>
            <div className="flex gap-2 items-center mb-2">
               <div className="relative">
                  <Input type="file" className="hidden" id="logo-up" onChange={handleLogoUpload} accept="image/*" />
                  <label htmlFor="logo-up" className="flex items-center justify-center px-3 py-2 border border-slate-300 rounded cursor-pointer bg-white hover:bg-slate-50"><CloudUpload className="h-4 w-4" /></label>
               </div>
               <div className="flex flex-wrap gap-1">
                  {colors.map(c => <button key={c} className={`w-6 h-6 rounded-full ${config.color === c ? 'ring-2 ring-offset-1 ring-slate-400' : ''}`} style={{ backgroundColor: c }} onClick={() => setConfig({...config, color: c})} />)}
               </div>
            </div>
          </div>

          <div><Label>Judul Organ</Label><Input className="font-bold uppercase" value={config.title} onChange={e => setConfig({...config, title: e.target.value})} /></div>
          <div><Label>Sub-Judul</Label><Input value={config.sub} onChange={e => setConfig({...config, sub: e.target.value})} /></div>
          <div><Label>Gambar Organ</Label><Input type="file" onChange={handleImageUpload} accept="image/*" className="mt-1" /></div>
        </div>

        {/* Antrean Card */}
        <Card className="p-4 bg-indigo-50 border-indigo-100">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-indigo-800 uppercase">Antrean Cetak</span>
            <span className="bg-indigo-200 text-indigo-800 text-[10px] px-2 py-0.5 rounded-full font-bold">{queue.length}/4</span>
          </div>
          <div className="space-y-2 mb-4">
            {queue.map((item) => (
                <div key={item.id} className="flex justify-between items-center bg-white p-2 rounded border border-indigo-100 text-xs">
                  <div className="truncate font-medium">#{item.cardNum} - {item.title}</div>
                  <button onClick={() => removeFromQueue(item.id)} className="text-red-400 hover:text-red-600"><Trash2 className="h-3 w-3" /></button>
                </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Button onClick={addToQueue} size="sm" className="flex-1 bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-600 hover:text-white"><Plus className="h-3 w-3 mr-1" /> Tambah</Button>
            <Button onClick={() => setQueue([])} variant="destructive" size="sm"><Trash2 className="h-3 w-3" /></Button>
          </div>
        </Card>

        {/* Tombol Aksi */}
        <div className="flex flex-col gap-2">
          <Button onClick={downloadImage} disabled={isGenerating} className="w-full bg-slate-800 hover:bg-slate-900">
            {isGenerating ? "Menyimpan..." : <><Download className="mr-2 h-4 w-4" /> Simpan JPG</>}
          </Button>
          <Button onClick={handlePrint} className="w-full bg-indigo-600 hover:bg-indigo-700"><Printer className="mr-2 h-4 w-4" /> Print PDF</Button>
        </div>
      </div>

      {/* --- PANEL KANAN: PREVIEW --- */}
      <div className="w-full lg:flex-1 bg-slate-100 rounded-xl flex items-center justify-center p-4 overflow-hidden min-h-[400px]">
        <div className="transform scale-[0.65] sm:scale-[0.8] lg:scale-100 transition-transform origin-center">
            {/* REF dipasang di sini untuk html-to-image */}
            <div ref={cardRef}><CardTemplate data={config} isPreview={true} /></div>
        </div>
      </div>

      {/* --- HIDDEN: BUAT PRINT NATIVE --- */}
      <div id="print-batch" className="hidden">
        {queue.map((item) => <CardTemplate key={item.id} data={item} isPreview={false} />)}
      </div>
    </div>
  );
}
