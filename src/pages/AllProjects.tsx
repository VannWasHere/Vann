import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import projectData from '../data/projects.json'
import CustomCursor from '../components/CustomCursor'
import ProjectImage from '../components/ProjectImage'

// Reuse identical style or simple layout
export default function AllProjects() {
  return (
    <main className="min-h-screen bg-black text-white p-6 md:p-12 lg:p-24 selection:bg-red-500/30 selection:text-white">
      <CustomCursor />
      <Link to="/" className="text-zinc-500 hover:text-white transition-colors uppercase tracking-widest text-sm font-mono flex items-center gap-2 mb-12">
        <span className="text-xl">&larr;</span> Back to Home
      </Link>
      
      <div className="max-w-7xl mx-auto space-y-12">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-16">
          All Projects
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projectData.map((project, i) => {
            const card = (
              <>
                <div className="h-48 md:h-64 overflow-hidden relative">
                  <ProjectImage
                    src={project.image}
                    alt={project.title}
                    title={project.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-500 pointer-events-none" />
                  {project.label && (
                    <span className="absolute top-4 left-4 px-3 py-1 rounded-full border border-red-500/30 bg-black/60 backdrop-blur-sm text-red-300 font-mono text-[10px] tracking-[0.18em] uppercase">
                      {project.label}
                    </span>
                  )}
                </div>

                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-baseline gap-4 text-zinc-500 font-mono text-xs">
                    <span>{project.year}</span>
                    <span className="text-right text-[10px] tracking-wider uppercase">
                      {project.tech.join(' · ')}
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold tracking-tight group-hover:text-red-400 transition-colors">
                    {project.title}
                  </h3>

                  <p className="text-sm text-zinc-300 font-light line-clamp-3">
                    {project.description}
                  </p>

                  <span className="block font-mono text-[10px] tracking-[0.2em] uppercase text-zinc-600">
                    {project.link ? 'Visit live site →' : 'Private build'}
                  </span>
                </div>
              </>
            )

            const shell =
              'group block relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl transition-all hover:border-red-500/50'

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                whileHover={{ y: -5 }}
              >
                {project.link ? (
                  <a href={project.link} target="_blank" rel="noopener noreferrer" className={shell}>
                    {card}
                  </a>
                ) : (
                  <div className={shell}>{card}</div>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>
    </main>
  )
}
