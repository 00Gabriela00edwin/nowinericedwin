import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const EditorialAnimations = ({
  heroRef,
  collectionsRef,
}) => {
  useEffect(() => {
    const ctx = gsap.context(() => {
      const media = gsap.matchMedia();
      media.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('.hero-content h1, .hero-content p, .hero-content .hero-cta', {
          y: 24,
          opacity: 0,
          duration: 0.65,
          stagger: 0.12,
          ease: 'power3.out',
        });
      });
      return () => media.revert();
    }, heroRef);
    return () => ctx.revert();
  }, [heroRef]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const media = gsap.matchMedia();
      media.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
        const cards = gsap.utils.toArray('[data-collection-card]');
        cards.slice(0, -1).forEach((card, index) => {
          gsap.to(card, {
            scale: 0.94,
            opacity: 0.55,
            ease: 'none',
            scrollTrigger: {
              trigger: cards[index + 1],
              start: 'top 80%',
              end: 'top 96px',
              scrub: true,
              invalidateOnRefresh: true,
            },
          });
        });
        ScrollTrigger.refresh();
      });
      return () => media.revert();
    }, collectionsRef);
    return () => ctx.revert();
  }, [collectionsRef]);

  return null;
};

export default EditorialAnimations;
