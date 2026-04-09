import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check, Zap } from 'lucide-react'
import confetti from 'canvas-confetti'

export default function ThankYou() {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F97316', '#FBBF24', '#F59E0B', '#34D399', '#FF6B6B'],
      })
    }, 300)
    return () => clearTimeout(timer)
  }, [])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center justify-center px-4 relative">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-cheetah-50 via-primary-50 to-savanna-50" />
      <div className="absolute inset-0 -z-10 spot-decoration opacity-20" />

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.1 }}
        className="w-28 h-28 rounded-full bg-gradient-to-br from-cheetah-100 to-primary-100 flex items-center justify-center mb-8 shadow-xl shadow-cheetah-500/20"
      >
        <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 200, delay: 0.3 }}>
          <Check className="w-14 h-14 text-cheetah-600" strokeWidth={3} />
        </motion.div>
      </motion.div>

      <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}
        className="text-4xl font-extrabold text-earth-900 mb-3">
        Bedankt!
      </motion.h1>

      <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}
        className="text-earth-400 text-center max-w-sm mb-8">
        Je docent neemt jouw input mee in de les.
      </motion.p>

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
        className="text-xs text-earth-300 mb-4">
        Je kunt dit venster sluiten
      </motion.p>

      <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
        onClick={() => navigate('/')}
        className="inline-flex items-center gap-2 text-sm text-cheetah-600 hover:text-cheetah-800 transition-colors font-medium">
        <Zap className="w-4 h-4" /> Terug naar CheetaPrep
      </motion.button>
    </motion.div>
  )
}
