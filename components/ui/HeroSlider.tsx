"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Button } from "@/components/ui/button";

export type HeroSlide = {
  id: string;
  imageUrl: string;
  blurDataUrl?: string;
  titleEn?: string;
  titleNe?: string;
  subtitleEn?: string;
  subtitleNe?: string;
  ctaTextEn?: string;
  ctaTextNe?: string;
  ctaLink?: string;
  overlayOpacity: number;
  textPosition: "left" | "center" | "right";
  duration: number;
};

interface HeroSliderProps {
  slides: HeroSlide[];
  settings: Record<string, string>;
}

export default function HeroSlider({ slides, settings }: HeroSliderProps) {
  const { t } = useTranslation();
  const { locale } = useLanguage();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(true);

  // Fallback slide if none provided from backend
  const activeSlides = useMemo(() => slides.length > 0 ? slides : [{
    id: 'default',
    imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80',
    overlayOpacity: 60,
    textPosition: 'left',
    duration: 6,
    titleEn: settings.site_title_en || t.hero.title,
    titleNe: settings.site_title_ne || t.hero.title,
    subtitleEn: settings.slogan_en || t.hero.subtitle,
    subtitleNe: settings.slogan_ne || t.hero.subtitle,
    ctaTextEn: t.hero.apply,
    ctaTextNe: t.hero.apply,
    ctaLink: '/register'
  } as HeroSlide], [slides, settings, t.hero.title, t.hero.subtitle, t.hero.apply]);

  // Check reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    // Set initial value asynchronously to avoid cascading render warning
    const timeoutId = setTimeout(() => {
      setIsReducedMotion(mediaQuery.matches);
    }, 0);
    
    const handler = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => {
      clearTimeout(timeoutId);
      mediaQuery.removeEventListener('change', handler);
    };
  }, []);

  // Intersection Observer to pause when off-screen
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Handle Tab visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(document.visibilityState === 'visible');
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
  }, [activeSlides.length]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? activeSlides.length - 1 : prev - 1));
  }, [activeSlides.length]);

  // Main Timer Logic
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    
    // Only run timer if playing, visible, not hovered, and more than 1 slide
    if (isPlaying && isVisible && !isHovered && activeSlides.length > 1) {
      const currentDuration = activeSlides[currentIndex]?.duration || 5;
      timerRef.current = setTimeout(goToNext, currentDuration * 1000);
    }
    
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentIndex, isPlaying, isVisible, isHovered, activeSlides, goToNext]);

  return (
    <section 
      ref={sectionRef}
      className="relative h-[400px] md:h-[650px] overflow-hidden group bg-slate-900"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label="Hero Slider"
    >
      {activeSlides.map((slide, index) => {
        const isActive = index === currentIndex;
        const opacity = slide.overlayOpacity / 100;
        
        let alignClass = "items-start text-left";
        if (slide.textPosition === "center") alignClass = "items-center text-center mx-auto";
        if (slide.textPosition === "right") alignClass = "items-end text-right ml-auto";
        
        const title = locale === 'en' ? slide.titleEn : slide.titleNe;
        const subtitle = locale === 'en' ? slide.subtitleEn : slide.subtitleNe;
        const ctaText = locale === 'en' ? slide.ctaTextEn : slide.ctaTextNe;

        return (
          <div 
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}
            aria-hidden={!isActive}
          >
            {/* Background Image Wrapper for Zoom Animation */}
            <div className={`absolute inset-0 w-full h-full transform transition-transform duration-[10000ms] ease-out ${isActive && !isReducedMotion ? 'scale-105' : 'scale-100'}`}>
              <Image 
                src={slide.imageUrl} 
                alt={title || "Hero Slide"}
                fill
                priority={index === 0}
                loading={index === 0 ? "eager" : "lazy"}
                placeholder={slide.blurDataUrl ? "blur" : "empty"}
                blurDataURL={slide.blurDataUrl || undefined}
                className="object-cover"
              />
            </div>
            
            {/* Gradient Overlay */}
            <div 
              className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent"
              style={{ opacity }}
            />
            
            {/* Content Layer */}
            <div className="container mx-auto px-6 h-full flex items-center relative z-20">
              <div className={`max-w-2xl text-white flex flex-col ${alignClass} transform transition-all duration-1000 delay-300 ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                
                {index === 0 && (
                  <div className={`inline-flex items-center gap-2 bg-brand-600/90 backdrop-blur-md px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-8 shadow-xl shadow-brand-900/20 transform transition-all duration-1000 delay-[400ms] ${isActive ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
                    <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
                    Welcome to Dipshikha
                  </div>
                )}
                
                {title && (
                  <h1 className={`text-5xl md:text-8xl font-black mb-8 leading-[0.95] tracking-[-0.04em] drop-shadow-2xl transition-all duration-1000 delay-[600ms] ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
                    {title.split(' ').map((word, i) => (
                      <span key={i} className="inline-block mr-[0.2em] last:mr-0">
                        {word}
                      </span>
                    ))}
                  </h1>
                )}
                
                {subtitle && (
                  <p className={`text-xl md:text-2xl mb-12 font-medium text-white/90 leading-relaxed max-w-xl drop-shadow-lg transition-all duration-1000 delay-[800ms] ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
                    {subtitle}
                  </p>
                )}
                
                {(ctaText || slide.ctaLink) && (
                  <div className={`flex flex-wrap gap-4 transition-all duration-1000 delay-[1000ms] ${isActive ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}>
                    <Link href={slide.ctaLink || "/register"}>
                      <Button size="lg" className="bg-white text-slate-900 hover:bg-brand-50 h-16 px-10 text-lg rounded-2xl font-black shadow-2xl shadow-black/20 transition-all active:scale-95 group/btn overflow-hidden relative">
                        <span className="relative z-10 flex items-center gap-2">
                          {ctaText || t.hero.apply} <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-brand-400/0 via-brand-400/10 to-brand-400/0 transform -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000"></div>
                      </Button>
                    </Link>
                  </div>
                )}

              </div>
            </div>
          </div>
        );
      })}

      {/* Navigation Controls */}
      {activeSlides.length > 1 && (
        <>
          {/* Arrows (Visible on hover) */}
          <div className="absolute inset-y-0 left-0 flex items-center px-4 opacity-0 group-hover:opacity-100 transition-opacity z-30">
            <button 
              onClick={goToPrev}
              className="w-12 h-12 bg-black/30 hover:bg-black/60 backdrop-blur text-white rounded-full flex items-center justify-center transition-colors focus:outline-none focus:ring-2 ring-white"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center px-4 opacity-0 group-hover:opacity-100 transition-opacity z-30">
            <button 
              onClick={goToNext}
              className="w-12 h-12 bg-black/30 hover:bg-black/60 backdrop-blur text-white rounded-full flex items-center justify-center transition-colors focus:outline-none focus:ring-2 ring-white"
              aria-label="Next Slide"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Bottom Indicators & Controls */}
          <div className="absolute bottom-8 left-0 w-full flex justify-center items-center gap-4 z-30">
            {/* Play/Pause Button for Accessibility */}
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-8 h-8 rounded-full bg-black/30 text-white flex items-center justify-center hover:bg-black/50 transition-colors focus:outline-none"
              aria-label={isPlaying ? "Pause Auto-play" : "Play Auto-play"}
            >
              {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 ml-0.5" />}
            </button>
            
            {/* Dots */}
            <div className="flex gap-2">
              {activeSlides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`transition-all duration-300 rounded-full h-2 ${idx === currentIndex ? 'w-8 bg-brand-500' : 'w-2 bg-white/50 hover:bg-white'}`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </>
      )}
      {/* Scroll Down Indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 hidden md:flex flex-col items-center gap-2 text-white/50 animate-bounce">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{locale === 'en' ? 'Scroll' : 'तल सर्नुहोस्'}</span>
        <div className="w-px h-8 bg-gradient-to-b from-white/50 to-transparent"></div>
      </div>
    </section>
  );
}
