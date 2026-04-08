import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookOpen, GraduationCap, Sparkles, Loader2 } from 'lucide-react'

export default function LandingPage() {
  const navigate = useNavigate()
  const [loadingDemo, setLoadingDemo] = useState(false)

  const handleDemo = async () => {
    setLoadingDemo(true)
    try {
      const res = await fetch('/api/seed-demo', { method: 'POST' })
      if (res.ok) {
        navigate('/teacher/dashboard')
      }
    } catch {
      // If seed-demo endpoint doesn't exist, try navigating to dashboard anyway
      navigate('/teacher/dashboard')
    } finally {
      setLoadingDemo(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden"
    >
      {/* Animated background shapes */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-100 via-white to-indigo-100" />
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full opacity-20"
            style={{
              width: 100 + i * 60,
              height: 100 + i * 60,
              background: i % 2 === 0
                ? 'radial-gradient(circle, #7C3AED 0%, transparent 70%)'
                : 'radial-gradient(circle, #6366F1 0%, transparent 70%)',
              left: `${10 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
            }}
            animate={{
              y: [0, -20, 0],
              x: [0, 10, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 5 + i * 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.5,
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
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <BookOpen className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            LesPrep
          </h1>
        </motion.div>
        <motion.p
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-lg md:text-xl text-gray-500 font-medium"
        >
          Maak elke les relevant
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
          className="flex-1 group relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg shadow-purple-500/10 border border-purple-100 hover:shadow-xl hover:shadow-purple-500/20 transition-shadow duration-300 cursor-pointer text-left"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center mb-5 shadow-md group-hover:shadow-lg transition-shadow">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Ik ben docent</h2>
          <p className="text-sm text-gray-500">
            Maak een les aan en bekijk wat je studenten willen leren
          </p>
        </motion.button>

        <motion.button
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.6, type: 'spring', stiffness: 150 }}
          whileHover={{ scale: 1.04, y: -4 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/student/join')}
          className="flex-1 group relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg shadow-indigo-500/10 border border-indigo-100 hover:shadow-xl hover:shadow-indigo-500/20 transition-shadow duration-300 cursor-pointer text-left"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center mb-5 shadow-md group-hover:shadow-lg transition-shadow">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Ik ben student</h2>
          <p className="text-sm text-gray-500">
            Bereid je voor op de les en geef aan wat je wilt leren
          </p>
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
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-medium transition-colors disabled:opacity-50"
      >
        {loadingDemo ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Sparkles className="w-4 h-4" />
        )}
        Demo bekijken
      </motion.button>
    </motion.div>
  )
}
