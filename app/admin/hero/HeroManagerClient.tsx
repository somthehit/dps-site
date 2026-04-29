"use client";

import { useState, useEffect } from "react";
import { Save, Plus, Trash2, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

type HeroSlide = {
  id: string;
  imageUrl: string;
  blurDataUrl?: string | null;
  titleEn?: string | null;
  titleNe?: string | null;
  subtitleEn?: string | null;
  subtitleNe?: string | null;
  ctaTextEn?: string | null;
  ctaTextNe?: string | null;
  ctaLink?: string | null;
  overlayOpacity: number;
  textPosition: "left" | "center" | "right";
  duration: number;
  startAt?: string | null;
  endAt?: string | null;
  isActive: boolean;
  sortOrder: number;
};

export default function HeroManagerClient() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [selectedSlide, setSelectedSlide] = useState<HeroSlide | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    fetchSlides();
  }, []);

  async function fetchSlides() {
    try {
      const res = await fetch("/api/admin/hero-slides");
      const data = await res.json();
      setSlides(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  async function saveSlide(slide: HeroSlide) {
    setIsSaving(true);
    try {
      const isNew = slide.id.startsWith("temp-");
      const url = isNew ? "/api/admin/hero-slides" : `/api/admin/hero-slides/${slide.id}`;
      const method = isNew ? "POST" : "PATCH";
      
      const payload = { ...slide };
      if (isNew) {
        // @ts-expect-error - id is not required for creation
        delete payload.id;
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        await fetchSlides();
        setSelectedSlide(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteSlide(id: string) {
    if (!confirm("Are you sure you want to delete this slide?")) return;
    try {
      await fetch(`/api/admin/hero-slides/${id}`, {
        method: "DELETE"
      });
      await fetchSlides();
      if (selectedSlide?.id === id) setSelectedSlide(null);
    } catch (err) {
      console.error(err);
    }
  }

  const addNewSlide = () => {
    setSelectedSlide({
      id: `temp-${Date.now()}`,
      imageUrl: "",
      overlayOpacity: 50,
      textPosition: "left",
      duration: 5,
      isActive: true,
      sortOrder: slides.length
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedSlide) return;
    
    setIsSaving(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) {
        setSelectedSlide({ ...selectedSlide, imageUrl: data.url });
      }
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column: Slide List */}
      <div className="lg:col-span-1 space-y-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h2 className="font-bold text-slate-800">All Slides</h2>
            <button onClick={addNewSlide} className="p-2 bg-brand-100 text-brand-700 rounded-lg hover:bg-brand-200 transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="p-2 space-y-2 max-h-[600px] overflow-y-auto">
            {slides.length === 0 && <div className="text-center text-sm text-slate-500 py-4">No slides added yet.</div>}
            {slides.map(slide => (
              <div 
                key={slide.id} 
                onClick={() => setSelectedSlide(slide)}
                className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${selectedSlide?.id === slide.id ? 'border-brand-500 bg-brand-50' : 'border-slate-100 hover:border-slate-300'}`}
              >
                <div className="w-16 h-12 bg-slate-200 rounded overflow-hidden flex-shrink-0 relative">
                  {slide.imageUrl ? (
                    <Image src={slide.imageUrl} alt="" fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400"><ImageIcon className="w-5 h-5" /></div>
                  )}
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="text-sm font-bold text-slate-800 truncate">{slide.titleEn || "Untitled Slide"}</div>
                  <div className="text-xs text-slate-500 flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${slide.isActive ? 'bg-green-500' : 'bg-slate-300'}`}></span>
                    {slide.isActive ? 'Active' : 'Draft'}
                  </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); deleteSlide(slide.id); }} className="text-slate-400 hover:text-red-500 p-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column: Slide Editor & Preview */}
      <div className="lg:col-span-2">
        {selectedSlide ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="font-bold text-slate-800">Edit Slide</h2>
              <button 
                onClick={() => saveSlide(selectedSlide)} 
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-bold hover:bg-brand-700 disabled:opacity-50"
              >
                <Save className="w-4 h-4" /> {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
            
            <div className="p-6 grid grid-cols-2 gap-6 overflow-y-auto">
              
              {/* Image Upload */}
              <div className="col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Background Image URL</label>
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <input 
                      type="text" 
                      value={selectedSlide.imageUrl} 
                      onChange={e => setSelectedSlide({...selectedSlide, imageUrl: e.target.value})}
                      className="w-full h-10 px-3 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 ring-brand-500/20 outline-none text-sm"
                      placeholder="https://..."
                    />
                  </div>
                  <div className="relative overflow-hidden shrink-0">
                    <button className="h-10 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-lg transition-colors">
                      Upload File
                    </button>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                </div>
                {selectedSlide.imageUrl && (
                  <div className="mt-4 w-full h-48 rounded-xl border border-slate-200 overflow-hidden relative">
                     <Image src={selectedSlide.imageUrl} alt="Preview" fill className="object-cover" />
                  </div>
                )}
              </div>

              {/* Text Content */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Title (English)</label>
                <input type="text" placeholder="e.g. Empowering Farmers" value={selectedSlide.titleEn || ""} onChange={e => setSelectedSlide({...selectedSlide, titleEn: e.target.value})} className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm mb-4" />
                
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Subtitle (English)</label>
                <input type="text" placeholder="e.g. Supporting local agriculture since 2012." value={selectedSlide.subtitleEn || ""} onChange={e => setSelectedSlide({...selectedSlide, subtitleEn: e.target.value})} className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm mb-4" />
                
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Button Text (English)</label>
                <input type="text" placeholder="e.g. Join Us" value={selectedSlide.ctaTextEn || ""} onChange={e => setSelectedSlide({...selectedSlide, ctaTextEn: e.target.value})} className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm mb-4" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Title (Nepali)</label>
                <input type="text" placeholder="उदाहरण: किसानहरूको सशक्तिकरण" value={selectedSlide.titleNe || ""} onChange={e => setSelectedSlide({...selectedSlide, titleNe: e.target.value})} className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm mb-4" />
                
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Subtitle (Nepali)</label>
                <input type="text" placeholder="उदाहरण: २०६९ देखि स्थानीय कृषिलाई समर्थन गर्दै ।" value={selectedSlide.subtitleNe || ""} onChange={e => setSelectedSlide({...selectedSlide, subtitleNe: e.target.value})} className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm mb-4" />
                
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Button Text (Nepali)</label>
                <input type="text" placeholder="उदाहरण: हामीसँग जोडिनुहोस्" value={selectedSlide.ctaTextNe || ""} onChange={e => setSelectedSlide({...selectedSlide, ctaTextNe: e.target.value})} className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm mb-4" />
              </div>

              {/* Slide Settings */}
              <div className="col-span-2 pt-4 border-t border-slate-100">
                <h3 className="font-bold text-slate-800 mb-4">Display Settings</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Duration (Secs)</label>
                    <input type="number" min="1" value={selectedSlide.duration} onChange={e => setSelectedSlide({...selectedSlide, duration: parseInt(e.target.value) || 5})} className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Text Position</label>
                    <select value={selectedSlide.textPosition} onChange={e => setSelectedSlide({...selectedSlide, textPosition: e.target.value as HeroSlide['textPosition']})} className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm bg-white">
                      <option value="left">Left</option>
                      <option value="center">Center</option>
                      <option value="right">Right</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Overlay Opacity (0-100)</label>
                    <input type="number" min="0" max="100" value={selectedSlide.overlayOpacity} onChange={e => setSelectedSlide({...selectedSlide, overlayOpacity: parseInt(e.target.value) || 0})} className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Status</label>
                    <div className="flex items-center h-10">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={selectedSlide.isActive} onChange={e => setSelectedSlide({...selectedSlide, isActive: e.target.checked})} />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                        <span className="ml-3 text-sm font-medium text-slate-700">{selectedSlide.isActive ? 'Active' : 'Inactive'}</span>
                      </label>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Button Link (URL)</label>
                    <select 
                      value={selectedSlide.ctaLink || ""} 
                      onChange={e => setSelectedSlide({...selectedSlide, ctaLink: e.target.value})} 
                      className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm bg-white"
                    >
                      <option value="">-- No Link --</option>
                      <option value="/">Home</option>
                      <option value="/about">About Us</option>
                      <option value="/services">Services</option>
                      <option value="/team">Our Team</option>
                      <option value="/gallery">Gallery</option>
                      <option value="/downloads">Downloads</option>
                      <option value="/contact">Contact</option>
                    </select>
                  </div>
                </div>
              </div>

            </div>
          </div>
        ) : (
          <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-300 h-full min-h-[400px] flex flex-col items-center justify-center text-slate-400">
            <ImageIcon className="w-12 h-12 mb-4 opacity-50" />
            <p>Select a slide from the left or create a new one.</p>
          </div>
        )}
      </div>
    </div>
  );
}
