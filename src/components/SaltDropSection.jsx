import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const crystals = [
  [12, 12, 7, '#f5eee0', 18], [32, 4, 5, '#d6aa60', -12],
  [54, 18, 8, '#fff8e9', 34], [77, 7, 6, '#b66b3d', 12],
  [92, 23, 5, '#f8ead2', -25], [22, 38, 6, '#f9f4e7', 28],
  [43, 46, 9, '#c98c4e', 7], [66, 35, 5, '#f7e8ce', -18],
  [86, 51, 8, '#e6d6b7', 35], [8, 70, 5, '#c17d47', 14],
  [35, 75, 7, '#fff8e9', -22], [58, 65, 6, '#e4bb7d', 28],
  [73, 82, 5, '#f6f0e2', 10], [95, 78, 7, '#c1824d', -16],
];

const CrystalGroup = ({ groupRef, className }) => (
  <div className={`pointer-events-none absolute left-1/2 top-[5%] h-[20%] w-[min(30%,14svh,140px)] -translate-x-1/2 select-none ${className}`} aria-hidden="true">
    <div ref={groupRef} className="relative h-full w-full">
      {crystals.map(([left, top, size, color, rotation], index) => (
        <span
          key={index}
          className="absolute block rounded-[2px] shadow-[0_1px_8px_rgba(255,215,145,0.35)]"
          style={{ left: `${left}%`, top: `${top}%`, width: size, height: size * 1.3, backgroundColor: color, transform: `rotate(${rotation}deg)` }}
        />
      ))}
    </div>
  </div>
);

const SaltDropSection = () => {
  const sectionRef = useRef(null);
  const sceneRef = useRef(null);
  const packageRef = useRef(null);
  const frontRef = useRef(null);
  const saltBackRef = useRef(null);
  const saltFrontRef = useRef(null);

  useEffect(() => {
    const context = gsap.context(() => {
      const media = gsap.matchMedia();
      // En pantallas demasiado bajas se conserva la escena estática para no recortar el contenido anclado.
      media.add('(prefers-reduced-motion: no-preference) and (min-height: 680px), (prefers-reduced-motion: no-preference) and (min-width: 350px) and (min-height: 640px), (prefers-reduced-motion: no-preference) and (min-width: 768px) and (min-height: 600px)', () => {
        // Ajustá el 0.19 a la altura de la boca en el recorte real del envase;
        // el cálculo usa el tamaño de la escena, por lo que también se adapta al móvil.
        const fallDistance = (group) =>
          packageRef.current.offsetTop + packageRef.current.offsetHeight * 0.19 -
          sceneRef.current.clientHeight * 0.05 + group.offsetHeight * 0.8;

        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: '+=110%',
            pin: true,
            pinSpacing: true,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });

        timeline
          .fromTo(saltBackRef.current, { y: 0, rotation: -7 }, {
            y: () => fallDistance(saltBackRef.current), rotation: 12, duration: 1, ease: 'power1.in',
          }, 0)
          .fromTo(saltFrontRef.current, { y: -18, rotation: 8 }, {
            y: () => fallDistance(saltFrontRef.current), rotation: -15, duration: 0.85, ease: 'power1.in',
          }, 0)
          .to(frontRef.current, { scaleY: 0.985, y: 4, transformOrigin: '50% 100%', duration: 0.08, ease: 'none' }, 0.78)
          .to(frontRef.current, { scaleY: 1, y: 0, duration: 0.12, ease: 'none' }, 0.86);
      });

      return () => media.revert();
    }, sectionRef);

    return () => context.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative isolate overflow-x-clip bg-[#100e0c] text-white"
      aria-labelledby="salt-drop-title"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_75%_55%,rgba(191,125,43,0.2),transparent_48%)]" aria-hidden="true" />
      <div className="relative mx-auto flex min-h-[100svh] max-w-6xl flex-col items-center justify-center gap-4 px-6 pt-36 pb-6 md:flex-row md:gap-10 md:pt-24 md:pb-10">
        <div className="w-full max-w-xl md:w-1/2">
          <p className="mb-3 text-xs font-bold tracking-[0.2em] text-[#e2b875] uppercase">La esencia de Nowin</p>
          <h2 id="salt-drop-title" className="mb-4 text-[clamp(1.7rem,5vw,4.5rem)] leading-[1.05] font-extrabold tracking-[-0.05em] md:text-[clamp(2.5rem,5vw,4.5rem)]">
            Una pizca de <span className="text-[#ffc400]">sabor</span>, infinitas posibilidades.
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-[#d0c8ba] md:text-base">
            Sales y especias seleccionadas para transformar cada comida en un momento especial.
          </p>
          <a href="#catalogo" className="mt-5 inline-flex min-h-11 items-center rounded-full border border-[#ffc400] px-5 py-2 text-sm font-bold text-[#ffc400] transition-colors hover:bg-[#ffc400] hover:text-[#17120a] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ffc400]">
            Explorá el catálogo
          </a>
        </div>

        <div ref={sceneRef} className="relative h-[min(30svh,320px)] w-full max-w-lg shrink-0 [@media(min-height:750px)_and_(max-width:767px)]:h-[min(38svh,320px)] md:h-[min(68svh,520px)] md:w-1/2" aria-hidden="true">
          <div className="pointer-events-none absolute inset-x-[16%] bottom-[3%] h-[10%] rounded-[100%] bg-[#d79e45]/20 blur-2xl" />
          <div ref={packageRef} className="pointer-events-none absolute bottom-0 left-1/2 z-10 h-[86%] aspect-[430/580] -translate-x-1/2 select-none">
            {/* Reemplazá estos WebP por la boca trasera y el frente transparentes, con el mismo tamaño y alineación; quitá los clip-path y la elipse provisional si los nuevos archivos ya vienen recortados. */}
            <img src="/assets/paquete-trasero.webp" alt="" className="absolute inset-0 h-full w-full object-contain [clip-path:inset(0_0_81%_0)]" />
            <div className="absolute top-[17%] left-[20%] h-[3%] w-[60%] rounded-[100%] border border-[#d1a96f]/60 bg-[#3c2b1d] shadow-[0_0_12px_rgba(0,0,0,0.5)]" />
          </div>
          <CrystalGroup groupRef={saltBackRef} className="z-20 opacity-70" />
          <CrystalGroup groupRef={saltFrontRef} className="z-20" />
          <div className="pointer-events-none absolute bottom-0 left-1/2 z-30 h-[86%] aspect-[430/580] -translate-x-1/2 select-none">
            <img ref={frontRef} src="/assets/paquete-frente.webp" alt="" className="absolute inset-0 h-full w-full object-contain [clip-path:inset(19%_0_0_0)]" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default SaltDropSection;
