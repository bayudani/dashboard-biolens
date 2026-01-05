import { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { 
  Printer, Download, Plus, Trash2, CloudUpload, QrCode, Dna, Image as ImageIcon
} from 'lucide-react';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card } from "../components/ui/card";
import { Label } from "../components/ui/label";

export default function MarkerGenerator() {
  const [config, setConfig] = useState({
    appName: 'BIOLENS AR',
    cardNum: '01',
    color: '#4f46e5',
    title: 'RONGGA MULUT',
    sub: 'Sistem Pencernaan Manusia',
    image: '[https://img.freepik.com/free-vector/human-mouth-open-realistic-illustration_1284-59368.jpg](https://img.freepik.com/free-vector/human-mouth-open-realistic-illustration_1284-59368.jpg)',
    logo: null // State buat nampung logo custom
  });

  const [queue, setQueue] = useState([]);
  const cardRef = useRef(null);

  const colors = ['#4f46e5', '#ef4444', '#f59e0b', '#10b981', '#06b6d4', '#d946ef', '#1e293b'];

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setConfig(prev => ({ ...prev, image: e.target.result }));
      reader.readAsDataURL(file);
    }
  };

  // Handler buat upload logo
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

  const removeFromQueue = (id) => {
    setQueue(queue.filter(item => item.id !== id));
  };

  const downloadImage = async () => {
    if (!cardRef.current) return;
    const canvas = await html2canvas(cardRef.current, { scale: 2, useCORS: true });
    const link = document.createElement('a');
    link.download = `AR-Marker-${config.title}.jpg`;
    link.href = canvas.toDataURL('image/jpeg', 0.9);
    link.click();
  };

  const handlePrint = () => {
    if (queue.length === 0) return alert("Antrean kosong bro! Tambahin dulu ke antrean.");
    window.print();
  };

  // --- REUSABLE CARD COMPONENT (Fix Overflow & Spacing) ---
  const CardTemplate = ({ data, isPreview = false }) => (
    <div 
      className={`relative bg-white flex flex-col overflow-hidden ${isPreview ? 'shadow-2xl' : 'queued-card'}`} 
      style={{ width: '350px', height: '550px', border: '12px solid #1f2937' }}
    >
      {/* Header: Fixed Height (shrink-0) */}
      <div className="px-6 py-4 flex justify-between items-center border-b-2 border-slate-100 bg-white z-10 shrink-0 h-[80px]">
        <div className="flex items-center gap-3 overflow-hidden">
          <div 
            className="w-10 h-10 flex-shrink-0 flex items-center justify-center text-white clip-hex shadow-md overflow-hidden" 
            style={{ backgroundColor: data.color }}
          >
            {data.logo ? (
                <img src={data.logo} alt="Logo" className="w-full h-full object-cover" />
            ) : (
                <Dna className="h-5 w-5" />
            )}
          </div>
          <span className="font-bold text-lg tracking-wider text-slate-900 font-mono truncate">{data.appName}</span>
        </div>
        <span className="bg-slate-900 text-white text-xs font-bold px-2 py-1 rounded font-mono shadow-sm shrink-0">#{data.cardNum}</span>
      </div>

      {/* Image Area: Flexible Height (min-h-0) */}
      <div className="flex-1 p-4 flex items-center justify-center relative bg-slate-50 min-h-0 overflow-hidden">
         <div 
           className="w-full h-full border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center bg-white/80 relative overflow-hidden shadow-inner"
           style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '24px 24px' }}
         >
            <img 
              src={data.image} 
              alt="AR Marker" 
              className="max-w-[90%] max-h-[90%] w-auto h-auto object-contain drop-shadow-xl mix-blend-multiply" 
            />
            
            {/* Watermarks */}
            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-slate-400 rounded-tl-md"></div>
            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-slate-400 rounded-tr-md"></div>
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-slate-400 rounded-bl-md"></div>
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-slate-400 rounded-br-md"></div>
         </div>
      </div>

      {/* Footer: Fixed Height content (shrink-0) */}
      <div className="p-6 bg-white z-10 border-t-2 border-slate-100 relative shrink-0 h-[140px] flex flex-col justify-center">
        <h2 className="text-3xl font-extrabold text-slate-900 uppercase leading-none mb-2 tracking-tight drop-shadow-sm truncate">
          {data.title}
        </h2>
        <p className="text-slate-500 font-semibold text-sm flex items-center gap-2 truncate">
          <span className="w-2 h-2 rounded-full bg-green-500 inline-block ring-2 ring-green-100 shrink-0"></span>
          <span className="truncate">{data.sub}</span>
        </p>
        
        {/* Corner Triangle */}
        <div 
          className="absolute bottom-0 right-0 w-0 h-0 border-solid border-b-[80px] border-r-[80px] border-l-transparent border-t-transparent z-10 opacity-90" 
          style={{ borderBottomColor: 'transparent', borderRightColor: data.color }}
        />
        
        <div className="absolute bottom-4 right-16 opacity-10 pointer-events-none">
          <QrCode className="h-12 w-12" />
        </div>
      </div>
    </div>
  );

  return (
    // FIX: Layout Mobile Responsive
    // - h-auto buat mobile biar bisa scroll ke bawah
    // - lg:h-[calc(100vh-100px)] buat desktop biar fixed
    <div className="flex flex-col lg:flex-row gap-8 h-auto lg:h-[calc(100vh-100px)]">
      
      {/* LEFT CONTROLS */}
      {/* - lg:overflow-y-auto biar scroll cuma di desktop, pr-2 dihapus di mobile */}
      <div className="w-full lg:w-1/3 space-y-6 lg:overflow-y-auto lg:pr-2 pb-10">
        <div className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Printer className="h-5 w-5 text-indigo-600" /> Generator Kontrol
          </h2>
          
          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-3">
              <Label>Nama Aplikasi</Label>
              <Input value={config.appName} onChange={e => setConfig({...config, appName: e.target.value})} />
            </div>
            <div className="col-span-1">
              <Label>No.</Label>
              <Input value={config.cardNum} onChange={e => setConfig({...config, cardNum: e.target.value})} />
            </div>
          </div>

          <div>
            <Label className="mb-2 block">Logo Aplikasi</Label>
            <div className="relative">
              <Input type="file" className="hidden" id="logo-up" onChange={handleLogoUpload} accept="image/*" />
              <label htmlFor="logo-up" className="flex items-center justify-center w-full px-4 py-2 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors gap-2 bg-white">
                <CloudUpload className="h-4 w-4 text-slate-500" />
                <span className="text-xs text-slate-600 font-medium">Ganti Logo</span>
              </label>
            </div>
          </div>

          <div>
            <Label className="mb-2 block">Warna Tema</Label>
            <div className="flex flex-wrap gap-2">
              {colors.map(c => (
                <button
                  key={c}
                  className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${config.color === c ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : ''}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setConfig({...config, color: c})}
                />
              ))}
            </div>
          </div>

          <div>
            <Label>Judul Organ</Label>
            <Input className="font-bold uppercase" value={config.title} onChange={e => setConfig({...config, title: e.target.value})} />
          </div>

          <div>
            <Label>Sub-Judul</Label>
            <Input value={config.sub} onChange={e => setConfig({...config, sub: e.target.value})} />
          </div>

          <div>
            <Label>Gambar Organ</Label>
            <div className="relative mt-1">
              <Input type="file" className="hidden" id="img-up" onChange={handleImageUpload} accept="image/*" />
              <label htmlFor="img-up" className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors gap-2">
                <ImageIcon className="h-5 w-5 text-slate-400" />
                <span className="text-sm text-slate-500 font-medium">Upload Gambar</span>
              </label>
            </div>
          </div>
        </div>

        {/* Queue Manager */}
        <Card className="p-4 bg-indigo-50 border-indigo-100">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-indigo-800 uppercase">Antrean Cetak (A4)</span>
            <span className="bg-indigo-200 text-indigo-800 text-[10px] px-2 py-0.5 rounded-full font-bold">{queue.length}/4</span>
          </div>
          
          <div className="space-y-2 mb-4 min-h-[20px]">
            {queue.length === 0 ? (
              <p className="text-xs text-indigo-400 italic text-center">Belum ada kartu.</p>
            ) : (
              queue.map((item) => (
                <div key={item.id} className="flex justify-between items-center bg-white p-2 rounded border border-indigo-100 text-xs">
                  <div className="truncate font-medium">#{item.cardNum} - {item.title}</div>
                  <button onClick={() => removeFromQueue(item.id)} className="text-red-400 hover:text-red-600"><Trash2 className="h-3 w-3" /></button>
                </div>
              ))
            )}
          </div>

          <div className="flex gap-2">
            <Button onClick={addToQueue} className="flex-1 bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-600 hover:text-white" size="sm">
              <Plus className="h-3 w-3 mr-1" /> Tambah
            </Button>
            <Button onClick={() => setQueue([])} variant="destructive" size="sm" className="px-3">
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </Card>

        <div className="flex flex-col gap-2">
          <Button onClick={downloadImage} className="w-full bg-slate-800 hover:bg-slate-900">
            <Download className="mr-2 h-4 w-4" /> Simpan JPG (Satuan)
          </Button>
          <Button onClick={handlePrint} className="w-full bg-indigo-600 hover:bg-indigo-700">
            <Printer className="mr-2 h-4 w-4" /> Print Batch PDF
          </Button>
        </div>
      </div>

      {/* RIGHT PREVIEW AREA FIXED */}
      {/* - min-h-[400px] biar di HP gak gepeng, p-4 di mobile */}
      <div className="w-full lg:flex-1 bg-slate-100 rounded-xl relative flex items-center justify-center border border-slate-200 p-4 lg:p-8 overflow-hidden min-h-[400px] lg:min-h-0">
        {/* Grid Background */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
        </div>

        {/* Scalable Container for Preview */}
        {/* Extreme scaling for mobile (0.65) */}
        <div className="transform scale-[0.65] sm:scale-[0.8] lg:scale-100 transition-transform duration-300 origin-center">
            <div ref={cardRef}>
               <CardTemplate data={config} isPreview={true} />
            </div>
        </div>
      </div>

      {/* HIDDEN PRINT BATCH CONTAINER (Akan Muncul Saat CTRL+P / Print) */}
      <div id="print-batch" className="hidden">
        {queue.map((item) => (
          <CardTemplate key={item.id} data={item} isPreview={false} />
        ))}
      </div>
    </div>
  );
}