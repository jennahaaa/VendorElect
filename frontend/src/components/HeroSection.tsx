"use client";

interface HeroSectionProps {
  onStart: () => void;
}

export function HeroSection({ onStart }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pb-24">
      {/* Decorative Elements - Floating Orbs */}
      <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-[var(--accent)]/10 rounded-full blur-[100px] animate-pulse-soft pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-[var(--primary)]/5 rounded-full blur-[120px] animate-float pointer-events-none" />

      {/* Main content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto animate-fade-in-up">
        {/* Badge */}
        <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-[var(--primary)]/10 border border-[var(--primary)]/20 mb-10">
          <span className="w-3 h-3 rounded-full bg-[var(--accent)] animate-pulse-soft" />
          <span className="text-base font-medium text-[var(--primary)]">Powered by FHE</span>
        </div>

        {/* Title */}
        <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-8">
          <span className="text-[var(--primary)]">VENDOR</span>
          <span className="text-[var(--accent)]">ELECT</span>
        </h1>
        
        {/* Subtitle */}
        <p className="text-3xl md:text-4xl font-semibold text-[var(--primary)] mb-6">
          Vendor Potential Rating System
        </p>
        
        {/* Description */}
        <p className="text-xl md:text-2xl text-[var(--text-primary)] max-w-2xl mx-auto mb-14 leading-relaxed">
          Leveraging FHE technology to intelligently assess vendor potential while keeping your data fully encrypted and private
        </p>

        {/* CTA button */}
        <button
          onClick={onStart}
          className="btn-primary inline-flex items-center gap-4 px-12 py-5 rounded-full text-white font-semibold text-xl"
        >
          Start Rating
          <svg className="w-6 h-6 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
      </div>

      {/* Feature indicators */}
      <div className="absolute bottom-16 left-0 right-0 flex justify-center gap-16 text-base font-medium text-[var(--primary)]">
        <div className="flex items-center gap-3">
          <svg className="w-6 h-6 text-[var(--accent)]" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          Data Encrypted
        </div>
        <div className="flex items-center gap-3">
          <svg className="w-6 h-6 text-[var(--accent)]" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
          </svg>
          Smart Rating
        </div>
        <div className="flex items-center gap-3">
          <svg className="w-6 h-6 text-[var(--accent)]" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          On-Chain Verified
        </div>
      </div>
    </section>
  );
}
