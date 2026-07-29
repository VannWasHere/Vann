import { useState } from 'react'
import { motion } from 'framer-motion'
import { FaWhatsapp, FaEnvelope, FaCheck, FaGithub, FaLinkedin } from 'react-icons/fa'
import contentData from '../data/content.json'

export default function Contact() {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(contentData.contact.emailValue)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleWhatsApp = () => {
    window.open(contentData.contact.phoneLink, '_blank')
  }

  return (
    <section id="contact" className="relative min-h-screen py-32 bg-black text-white flex items-center justify-center px-6 md:px-12 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-black to-black pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-500/[0.04] rounded-full blur-[200px] pointer-events-none" />

      {/* Decorative grid lines */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
          backgroundSize: '80px 80px'
        }}
      />

      <motion.div
        className="relative z-10 w-full max-w-5xl mx-auto"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        viewport={{ once: true, margin: '-15%' }}
      >
        {/* Header */}
        <div className="text-center mb-20">
          <h2 className="text-zinc-500 font-mono tracking-widest uppercase text-sm mb-6">
            {contentData.contact.sectionSubtitle}
          </h2>
          <h3 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white via-zinc-200 to-zinc-600">
            {contentData.contact.title}
          </h3>
          <p className="text-lg md:text-xl text-zinc-500 font-light max-w-lg mx-auto mt-6">
            {contentData.contact.description}
          </p>
        </div>

        {/* Contact Cards Grid */}
        <div className="grid md:grid-cols-2 gap-4 md:gap-6 max-w-3xl mx-auto mb-16">
          {/* WhatsApp Card */}
          <motion.button
            onClick={handleWhatsApp}
            whileHover={{ y: -4 }}
            className="group relative p-5 md:p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-green-500/30 text-left transition-colors duration-500 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <div className="relative flex items-center gap-5">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0 group-hover:bg-green-500/20 transition-colors">
                <FaWhatsapp className="text-green-400 text-xl" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] text-zinc-600 font-mono tracking-widest uppercase mb-1">WhatsApp</div>
                <div className="text-zinc-200 text-base md:text-lg font-medium tracking-wide">{contentData.contact.phoneLabel}</div>
              </div>
            </div>
          </motion.button>

          {/* Email Card */}
          <motion.button
            onClick={handleCopy}
            whileHover={{ y: -4 }}
            className="group relative p-5 md:p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-red-500/30 text-left transition-colors duration-500 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <div className="relative flex items-center gap-5">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0 group-hover:bg-red-500/20 transition-colors">
                {copied
                  ? <FaCheck className="text-red-400 text-lg" />
                  : <FaEnvelope className="text-red-400 text-lg" />
                }
              </div>
              <div className="min-w-0">
                <div className="text-[10px] text-zinc-600 font-mono tracking-widest uppercase mb-1">
                  {copied ? 'Copied to Clipboard!' : 'Email — Click to Copy'}
                </div>
                <div className="relative overflow-hidden">
                  <motion.div
                    className="text-zinc-200 text-base md:text-lg font-medium tracking-wide whitespace-nowrap inline-block"
                    animate={{ x: ['0%', '-50%'] }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                  >
                    {contentData.contact.emailLabel} &nbsp; • &nbsp; {contentData.contact.emailLabel}
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.button>
        </div>

        {/* Social Links */}
        <div className="flex items-center justify-center gap-4">
          <a
            href={contentData.footer.github}
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 rounded-full border border-zinc-800 hover:border-zinc-600 flex items-center justify-center text-zinc-500 hover:text-white transition-all duration-300"
          >
            <FaGithub className="text-lg" />
          </a>
          <a
            href={contentData.footer.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 rounded-full border border-zinc-800 hover:border-zinc-600 flex items-center justify-center text-zinc-500 hover:text-white transition-all duration-300"
          >
            <FaLinkedin className="text-lg" />
          </a>
        </div>

      </motion.div>
    </section>
  )
}
