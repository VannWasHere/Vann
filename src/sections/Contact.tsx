import { useState } from 'react'
import { motion } from 'framer-motion'
import { FaWhatsapp, FaEnvelope, FaRegCopy } from 'react-icons/fa'

export default function Contact() {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText('justinedonovan812@gmail.com')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleWhatsApp = () => {
    window.open('https://wa.me/6281310783796', '_blank')
  }

  return (
    <section className="relative min-h-[90vh] py-32 bg-zinc-950 text-white flex items-center justify-center px-6 md:px-12 overflow-hidden border-t border-zinc-900">
      
      {/* Background radial gradient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[150%] max-w-4xl bg-[radial-gradient(circle,rgba(59,130,246,0.05)_0%,transparent_60%)] pointer-events-none" />

      <motion.div 
        className="relative z-10 w-full max-w-4xl mx-auto flex flex-col md:flex-row gap-16 md:gap-24 items-center md:items-start justify-between"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        viewport={{ once: true, margin: '-20%' }}
      >
        
        {/* Contact Info */}
        <div className="flex-1 space-y-12">
          <div>
            <h2 className="text-zinc-500 font-mono tracking-widest uppercase text-sm mb-4">
              [ 05 ] Let's Talk
            </h2>
            <h3 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-br from-white via-zinc-200 to-zinc-500">
              Ready to <br /> innovate?
            </h3>
            <p className="text-xl text-zinc-400 font-light max-w-sm">
              Whether it's a new enterprise application or a scalable frontend system, I'm just a click away.
            </p>
          </div>

          <div className="space-y-6">
            <motion.button 
              onClick={handleWhatsApp}
              whileHover={{ x: 10 }}
              className="flex items-center gap-4 text-xl md:text-2xl text-zinc-300 hover:text-white transition-colors group"
            >
              <div className="w-12 h-12 rounded-full border border-zinc-700 group-hover:border-green-500 flex items-center justify-center transition-colors">
                <FaWhatsapp className="group-hover:text-green-500" />
              </div>
              <span className="font-light tracking-wide">+62 813 1078 3796</span>
            </motion.button>
            
            <motion.button 
              onClick={handleCopy}
              whileHover={{ x: 10 }}
              className="flex items-center gap-4 text-xl md:text-2xl text-zinc-300 hover:text-white transition-colors group relative"
            >
              <div className="w-12 h-12 rounded-full border border-zinc-700 group-hover:border-blue-500 flex items-center justify-center transition-colors relative">
                <FaEnvelope className={copied ? 'opacity-0' : 'opacity-100 group-hover:text-blue-500'} />
                {copied && <FaRegCopy className="absolute text-blue-500" />}
              </div>
              <span className="font-light tracking-wide">justinedonovan812@gmail.com</span>
              {copied && <span className="absolute -top-6 right-0 text-sm text-blue-400 font-mono">Copied!</span>}
            </motion.button>
          </div>
        </div>

        {/* Form elements (Visual / Static) */}
        <div className="flex-1 w-full bg-black/50 p-8 rounded-3xl border border-white/5 backdrop-blur-xl">
          <form className="space-y-8 flex flex-col" onSubmit={(e) => e.preventDefault()}>
            <div className="relative group">
              <input 
                type="text" 
                id="name"
                className="w-full bg-transparent border-b border-zinc-800 text-white text-lg py-4 focus:outline-none focus:border-blue-500 transition-colors peer"
                placeholder=" "
              />
              <label htmlFor="name" className="absolute left-0 top-4 text-zinc-500 text-lg transition-all peer-focus:-top-4 peer-focus:text-xs peer-focus:text-blue-500 peer-focus:font-mono uppercase tracking-widest peer-not-placeholder-shown:-top-4 peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:text-blue-500">
                Your Name
              </label>
            </div>
            
            <div className="relative group">
              <input 
                type="email" 
                id="email"
                className="w-full bg-transparent border-b border-zinc-800 text-white text-lg py-4 focus:outline-none focus:border-blue-500 transition-colors peer"
                placeholder=" "
              />
              <label htmlFor="email" className="absolute left-0 top-4 text-zinc-500 text-lg transition-all peer-focus:-top-4 peer-focus:text-xs peer-focus:text-blue-500 peer-focus:font-mono uppercase tracking-widest peer-not-placeholder-shown:-top-4 peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:text-blue-500">
                Email Address
              </label>
            </div>
            
            <div className="relative group">
              <textarea 
                id="message"
                className="w-full bg-transparent border-b border-zinc-800 text-white text-lg py-4 focus:outline-none focus:border-blue-500 transition-colors resize-none peer h-24"
                placeholder=" "
              />
              <label htmlFor="message" className="absolute left-0 top-4 text-zinc-500 text-lg transition-all peer-focus:-top-4 peer-focus:text-xs peer-focus:text-blue-500 peer-focus:font-mono uppercase tracking-widest peer-not-placeholder-shown:-top-4 peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:text-blue-500">
                Message Ideas
              </label>
            </div>

            <button 
              type="submit"
              className="self-start mt-4 px-8 py-4 bg-white text-black font-semibold rounded-full hover:bg-zinc-200 transition-colors"
            >
              Send Message
            </button>
          </form>
        </div>

      </motion.div>
    </section>
  )
}
