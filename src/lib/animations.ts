
import { useEffect, useState, useRef } from 'react';

// Simple fade-in animation
export const useFadeIn = (delay: number = 0) => {
  return {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.5, delay }
  };
};

// Intersection Observer hook for animations on scroll
export const useInView = (threshold = 0.1, rootMargin = '0px') => {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          if (ref.current) observer.unobserve(ref.current);
        }
      },
      { threshold, rootMargin }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold, rootMargin]);

  return { ref, isInView };
};

// Staggered animation for lists
export const useStaggered = (count: number, baseDelay: number = 0.1) => {
  return Array.from({ length: count }, (_, i) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, delay: baseDelay + i * 0.1 }
  }));
};

// Parallax scroll effect
export const useParallax = (speed: number = 0.5) => {
  const [offset, setOffset] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;
      const { top } = ref.current.getBoundingClientRect();
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      
      if (top < windowHeight && top > -ref.current.offsetHeight) {
        setOffset((scrollY - top) * speed);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return { ref, style: { transform: `translateY(${offset}px)` } };
};

// Lazy loading images with blur effect
export const useLazyImage = (src: string, placeholder: string) => {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setImageSrc(src);
      setIsLoaded(true);
    };
  }, [src]);

  return { src: imageSrc, isLoaded, style: { 
    filter: isLoaded ? 'none' : 'blur(10px)',
    transition: 'filter 0.3s ease-out'
  }};
};
