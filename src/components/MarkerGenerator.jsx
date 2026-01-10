import { useState, useRef, useEffect } from 'react';
// Hapus import html2canvas yang bikin error
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
    image: 'https://img.freepik.com/free-vector/human-mouth-open-realistic-illustration_1284-59368.jpg',
    logo: null 
  });

  const [queue, setQueue] = useState([]);
  const cardRef = useRef(null);
  const colors = ['#4f46e5', '#ef4444', '#f59e0b', '#10b981', '#06b6d4', '#d946ef', '#1e293b'];
  const [isGenerating, setIsGenerating] = useState(false);

  // Load html2canvas lewat jalur VIP (CDN) yang lebih stabil
  useEffect(() => {
    // Cek kalau script belum ada, baru pasang
    if (!window.html2canvas && !document.querySelector('script[src*="html2canvas"]')) {
      const script = document.createElement('script');
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
      script.async = true;
      document.body.appendChild(script);
      
      // Kita ga pake cleanup (removeChild) biar scriptnya tetep stay walaupun komponen re-render
    }
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setConfig(prev => ({ ...prev, image: e.target.result }));
      reader.readAsDataURL(file);
    }
  };

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

  // Fungsi download yang udah "kebal" error security
  const downloadImage = async () => {
    if (!cardRef.current) return;
    
    // Cek keberadaan library
    if (typeof window.html2canvas === 'undefined') {
        alert("Sistem lagi loading library gambar nih, tunggu 2 detik terus klik lagi ya!");
        return;
    }

    try {
      setIsGenerating(true);
      
      // Kasih napas lebih lama dikit (500ms) buat pastiin gambar ke-render
      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await window.html2canvas(cardRef.current, { 
        scale: 3, // Resolusi tinggi (HD)
        useCORS: true, // Wajib buat gambar internet
        allowTaint: false, // CRITICAL FIX: Harus false biar toDataURL ga error SecurityError
        backgroundColor: null,
        logging: false,
        // Hack biar gambar ga kepotong pas ada transform CSS
        ignoreElements: (element) => element.classList.contains('do-not-print'),
        onclone: (clonedDoc) => {
           // Reset transform pada elemen clone agar hasil capture lurus
           const clonedElement = clonedDoc.querySelector('.queued-card-preview');
           if (clonedElement) {
             clonedElement.style.transform = 'none'; 
             clonedElement.style.margin = '0';
             // Paksa repaint dikit biar gambar nongol
             clonedElement.style.display = 'block'; 
           }
        }
      });

      const link = document.createElement('a');
      link.download = `AR-Marker-${config.title.replace(/[^a-zA-Z0-9]/g, '-')}.jpg`;
      // Convert canvas ke blob/dataURL
      link.href = canvas.toDataURL('image/jpeg', 0.95);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error("Gagal generate gambar:", error);
      // Pesan error lebih detail
      alert(`Ups, gagal simpan. Error: ${error.message || "Unknown error"}. Coba refresh halaman atau ganti gambar lain.`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    if (queue.length === 0) return alert("Antrean kosong bro!");
    window.print();
  };

  const CardTemplate = ({ data, isPreview = false }) => {
    // Logika Pintar: Cek apakah gambar dari upload (base64) atau link internet
    const isBase64 = data.image && data.image.startsWith('data:');
    // Kalau base64 (upload sendiri), JANGAN pakai crossOrigin="anonymous" karena bikin error tainted canvas
    const imgProps = isBase64 ? {} : { crossOrigin: "anonymous" };

    return (
      <div 
        className={`relative bg-white flex flex-col overflow-hidden ${isPreview ? 'shadow-2xl queued-card-preview' : 'queued-card'}`} 
        style={{ width: '350px', height: '550px', border: '12px solid #1f2937' }}
      >
        <div className="px-6 py-4 flex justify-between items-center border-b-2 border-slate-100 bg-white z-10 shrink-0 h-[80px]">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center text-white clip-hex shadow-md overflow-hidden" style={{ backgroundColor: data.color }}>
              {data.logo ? <img src={data.logo} className="w-full h-full object-cover" {...(data.logo.startsWith('data:') ? {} : {crossOrigin: "anonymous"})} /> : <Dna className="h-5 w-5" />}
            </div>
            <span className="font-bold text-lg tracking-wider text-slate-900 font-mono truncate">{data.appName}</span>
          </div>
          <span className="bg-slate-900 text-white text-xs font-bold px-2 py-1 rounded font-mono shadow-sm shrink-0">#{data.cardNum}</span>
        </div>

        <div className="flex-1 p-4 flex items-center justify-center relative bg-slate-50 min-h-0 overflow-hidden">
           <div className="w-full h-full border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center bg-white/80 relative overflow-hidden shadow-inner"
             style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
              
              {/* GAMBAR ORGAN: Efek blend dinyalakan lagi biar cakep */}
              <img 
                src={data.image} 
                className="max-w-[90%] max-h-[90%] w-auto h-auto object-contain drop-shadow-xl"
                style={{ mixBlendMode: 'multiply' }} 
                alt="Organ Preview"
                {...imgProps}
              />

           </div>
        </div>

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

        <div className="flex flex-col gap-2">
          <Button onClick={downloadImage} disabled={isGenerating} className="w-full bg-slate-800 hover:bg-slate-900">
            {isGenerating ? "Menyimpan..." : <><Download className="mr-2 h-4 w-4" /> Simpan JPG</>}
          </Button>
          <Button onClick={handlePrint} className="w-full bg-indigo-600 hover:bg-indigo-700"><Printer className="mr-2 h-4 w-4" /> Print PDF</Button>
        </div>
      </div>

      <div className="w-full lg:flex-1 bg-slate-100 rounded-xl flex items-center justify-center p-4 overflow-hidden min-h-[400px]">
        <div className="transform scale-[0.65] sm:scale-[0.8] lg:scale-100 transition-transform origin-center">
            <div ref={cardRef}><CardTemplate data={config} isPreview={true} /></div>
        </div>
      </div>

      <div id="print-batch" className="hidden">
        {queue.map((item) => <CardTemplate key={item.id} data={item} isPreview={false} />)}
      </div>
    </div>
  );
}