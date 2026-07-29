import { useEffect } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export const useSmoothScroll = () => {
    useEffect(() => {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

        const lenis = new Lenis({
            duration: 1.5,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: !prefersReducedMotion,
            wheelMultiplier: 0.8,
            touchMultiplier: 2,
            // Lets in-page anchors (#projects, #contact) glide instead of jump-cutting
            anchors: { offset: 0 }
        })

        // Keep ScrollTrigger in sync with Lenis so pinned/scrubbed sections don't jitter
        const update = () => ScrollTrigger.update()
        lenis.on('scroll', update)

        const raf = (time: number) => lenis.raf(time * 1000)
        gsap.ticker.add(raf)
        gsap.ticker.lagSmoothing(0)

        return () => {
            lenis.off('scroll', update)
            gsap.ticker.remove(raf)
            lenis.destroy()
        }
    }, [])
}
