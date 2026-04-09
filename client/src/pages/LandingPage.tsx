import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookOpen, GraduationCap, Sparkles, Loader2, Zap } from 'lucide-react'

export default function LandingPage() {
  const navigate = useNavigate()
  const [loadingDemo, setLoadingDemo] = useState(false)

  const handleDemo = async () => {
    setLoadingDemo(true)
    try {
      await fetch('/api/seed-demo', { method: 'POST' })
    } catch {
      // ignore
    }
    setLoadingDemo(false)
    navigate('/teacher/dashboard')
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden"
    >
      {/* Warm savanna gradient background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-cheetah-50 via-primary-50 to-savanna-50" />
        {/* Cheetah spot decorations */}
        <div className="absolute inset-0 spot-decoration opacity-40" />
        {/* Warm animated blobs */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: 120 + i * 80,
              height: 120 + i * 80,
              background: i % 2 === 0
                ? 'radial-gradient(circle, rgba(251,191,36,0.15) 0%, transparent 70%)'
                : 'radial-gradient(circle, rgba(249,115,22,0.12) 0%, transparent 70%)',
              left: `${5 + i * 18}%`,
              top: `${15 + (i % 3) * 25}%`,
            }}
            animate={{
              y: [0, -25, 0],
              x: [0, 15, 0],
              scale: [1, 1.15, 1],
            }}
            transition={{
              duration: 6 + i * 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.7,
            }}
          />
        ))}
      </div>

      {/* Logo and tagline */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <motion.div
          className="inline-flex items-center gap-3 mb-4"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        >
          {/* Cheetah icon/logo */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cheetah-400 to-primary-500 flex items-center justify-center shadow-xl shadow-cheetah-500/30 relative">
            <Zap className="w-8 h-8 text-white" />
            {/* Spots on logo */}
            <div className="absolute top-1 right-1 w-2 h-2 bg-earth-900/20 rounded-full" />
            <div className="absolute bottom-2 left-1.5 w-1.5 h-1.5 bg-earth-900/15 rounded-full" />
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold bg-gradient-to-r from-earth-900 via-cheetah-700 to-primary-600 bg-clip-text text-transparent">
            CheetaPrep
          </h1>
        </motion.div>
        <motion.p
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-lg md:text-xl text-earth-500 font-medium tracking-wide"
        >
          Snel. Scherp. Voorbereid.
        </motion.p>
      </motion.div>

      {/* Role cards */}
      <div className="flex flex-col sm:flex-row gap-6 mb-12 w-full max-w-lg">
        <motion.button
          initial={{ x: -40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 150 }}
          whileHover={{ scale: 1.04, y: -4 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/teacher/create')}
          className="flex-1 group relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg shadow-cheetah-500/10 border border-cheetah-200/50 hover:shadow-xl hover:shadow-cheetah-500/20 hover:border-cheetah-300 transition-all duration-300 cursor-pointer text-left overflow-hidden"
        >
          {/* Subtle spot pattern on card */}
          <div className="absolute inset-0 spot-decoration opacity-20" />
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cheetah-400 to-primary-500 flex items-center justify-center mb-5 shadow-md group-hover:shadow-lg transition-shadow">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-earth-900 mb-2">Ik ben docent</h2>
            <p className="text-sm text-earth-400">
              Maak een les aan en bekijk wat je studenten willen leren
            </p>
          </div>
        </motion.button>

        <motion.button
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.6, type: 'spring', stiffness: 150 }}
          whileHover={{ scale: 1.04, y: -4 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/student/join')}
          className="flex-1 group relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg shadow-primary-500/10 border border-primary-200/50 hover:shadow-xl hover:shadow-primary-500/20 hover:border-primary-300 transition-all duration-300 cursor-pointer text-left overflow-hidden"
        >
          <div className="absolute inset-0 spot-decoration opacity-20" />
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-cheetah-600 flex items-center justify-center mb-5 shadow-md group-hover:shadow-lg transition-shadow">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-earth-900 mb-2">Ik ben student</h2>
            <p className="text-sm text-earth-400">
              Bereid je voor op de les en geef aan wat je wilt leren
            </p>
          </div>
        </motion.button>
      </div>

      {/* Demo button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleDemo}
        disabled={loadingDemo}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-cheetah-100 to-primary-100 hover:from-cheetah-200 hover:to-primary-200 text-earth-700 text-sm font-semibold transition-all disabled:opacity-50 shadow-sm"
      >
        {loadingDemo ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Sparkles className="w-4 h-4 text-cheetah-600" />
        )}
        Demo bekijken
      </motion.button>

      {/* Bottom decoration - cheetah speed lines */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cheetah-400/30 to-transparent" />
    </motion.div>
  )
}
