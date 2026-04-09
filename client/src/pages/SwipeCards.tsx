import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion'
import { Check, X, Loader2 } from 'lucide-react'

interface CardItem { stelling: string; correct: boolean; uitleg: string }

export default function SwipeCards() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [cards, setCards] = useState<CardItem[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [cardResults, setCardResults] = useState<Array<{ cardIndex: number; correct: boolean }>>([])
  const [showExplanation, setShowExplanation] = useState(false)
  const [lastResult, setLastResult] = useState<{ understood: boolean; card: CardItem } | null>(null)
  const [loading, setLoading] = useState(true)
  const [exiting, setExiting] = useState<'left' | 'right' | null>(null)

  useEffect(() => {
    fetch(`/api/lessons/${id}`)
      .then(r => r.ok ? r.json() : null)
      .then(lesson => { if (lesson?.cards_json) setCards(JSON.parse(lesson.cards_json)) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  const handleSwipe = (direction: 'left' | 'right') => {
    if (currentIndex >= cards.length || showExplanation) return
    const understood = direction === 'right'
    const card = cards[currentIndex]
    const newResults = [...cardResults, { cardIndex: currentIndex, correct: understood }]
    setCardResults(newResults)
    setLastResult({ understood, card })
    setExiting(direction)
    setTimeout(() => { setExiting(null); setShowExplanation(true) }, 300)
  }

  const dismissExplanation = () => {
    setShowExplanation(false)
    setLastResult(null)
    const nextIndex = currentIndex + 1
    setCurrentIndex(nextIndex)
    if (nextIndex >= cards.length) {
      sessionStorage.setItem('cardResults', JSON.stringify(cardResults))
      setTimeout(() => navigate(`/student/lesson/${id}/wishes`), 800)
    }
  }

  useEffect(() => {
    if (showExplanation) {
      const timer = setTimeout(dismissExplanation, 3000)
      return () => clearTimeout(timer)
    }
  }, [showExplanation])

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 text-cheetah-500 animate-spin" /></div>

  const isComplete = currentIndex >= cards.length

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center justify-center px-4 py-8 relative">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-cheetah-50 via-primary-50 to-savanna-50" />
      <div className="absolute inset-0 -z-10 spot-decoration opacity-20" />

      <div className="flex gap-2 mb-8">
        {cards.map((_, i) => (
          <motion.div key={i}
            className={`w-3 h-3 rounded-full transition-colors duration-300 ${
              i < currentIndex ? 'bg-cheetah-500' : i === currentIndex ? 'bg-cheetah-400' : 'bg-earth-200'
            }`}
            animate={i === currentIndex ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 1, repeat: Infinity }}
          />
        ))}
      </div>

      <p className="text-sm text-earth-400 mb-6">
        {isComplete ? 'Klaar!' : `${currentIndex + 1} / ${cards.length}`}
      </p>

      <div className="relative w-80 h-96 mb-8">
        <AnimatePresence>
          {!isComplete && cards.map((card, i) => {
            if (i < currentIndex || i > currentIndex + 1) return null
            if (i === currentIndex) return <SwipeableCard key={i} card={card} onSwipe={handleSwipe} isTop exiting={exiting} />
            return (
              <motion.div key={i}
                className="absolute inset-0 bg-white rounded-2xl shadow-lg border border-cheetah-100/60 flex items-center justify-center p-8"
                style={{ scale: 0.95, y: 10 }}>
                <p className="text-lg text-center text-earth-200 font-medium">{card.stelling}</p>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {isComplete && (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}
              className="w-24 h-24 rounded-full bg-gradient-to-br from-cheetah-100 to-primary-100 flex items-center justify-center mb-4 shadow-lg">
              <Check className="w-12 h-12 text-cheetah-600" />
            </motion.div>
            <p className="text-xl font-bold text-earth-900">Goed gedaan!</p>
          </motion.div>
        )}
      </div>

      {!isComplete && !showExplanation && (
        <div className="flex gap-6">
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={() => handleSwipe('left')}
            className="w-16 h-16 rounded-full bg-coral-100 hover:bg-coral-200 flex items-center justify-center transition-colors shadow-lg">
            <X className="w-8 h-8 text-coral-500" />
          </motion.button>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={() => handleSwipe('right')}
            className="w-16 h-16 rounded-full bg-success-100 hover:bg-success-200 flex items-center justify-center transition-colors shadow-lg">
            <Check className="w-8 h-8 text-success-500" />
          </motion.button>
        </div>
      )}

      <AnimatePresence>
        {showExplanation && lastResult && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            onClick={dismissExplanation} className="fixed bottom-8 left-4 right-4 max-w-md mx-auto z-50 cursor-pointer">
            <div className={`p-4 rounded-2xl shadow-xl border-2 ${
              lastResult.card.correct ? 'bg-success-50 border-success-200' : 'bg-coral-50 border-coral-200'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-sm font-semibold ${lastResult.card.correct ? 'text-success-700' : 'text-coral-700'}`}>
                  {lastResult.card.correct ? 'Juist!' : 'Onjuist!'}
                </span>
              </div>
              <p className="text-sm text-earth-600">{lastResult.card.uitleg}</p>
              <p className="text-xs text-earth-300 mt-2">Tik om door te gaan</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function SwipeableCard({ card, onSwipe, isTop, exiting }: {
  card: CardItem; onSwipe: (dir: 'left' | 'right') => void; isTop: boolean; exiting: 'left' | 'right' | null
}) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-15, 15])
  const leftOpacity = useTransform(x, [-100, -20], [1, 0])
  const rightOpacity = useTransform(x, [20, 100], [0, 1])

  return (
    <motion.div
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
      style={isTop && !exiting ? { x, rotate } : undefined}
      animate={exiting ? { x: exiting === 'left' ? -600 : 600, rotate: exiting === 'left' ? -30 : 30, opacity: 0 } : undefined}
      transition={exiting ? { duration: 0.3 } : undefined}
      drag={isTop && !exiting ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={(_, info) => {
        if (info.offset.x > 100) onSwipe('right')
        else if (info.offset.x < -100) onSwipe('left')
      }}
    >
      <div className="w-full h-full bg-white rounded-2xl shadow-2xl border border-cheetah-100/60 flex flex-col items-center justify-center p-8 relative overflow-hidden">
        {/* Cheetah spot decoration on card */}
        <div className="absolute inset-0 spot-decoration opacity-10" />
        {/* Top accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cheetah-400 to-primary-500 rounded-t-2xl" />

        <motion.div style={{ opacity: leftOpacity }}
          className="absolute inset-0 bg-coral-500/10 flex items-center justify-center rounded-2xl pointer-events-none">
          <div className="bg-coral-500 text-white px-4 py-2 rounded-full font-bold text-lg rotate-[-20deg]">
            <X className="w-6 h-6 inline mr-1" /> Snap ik niet
          </div>
        </motion.div>
        <motion.div style={{ opacity: rightOpacity }}
          className="absolute inset-0 bg-success-500/10 flex items-center justify-center rounded-2xl pointer-events-none">
          <div className="bg-success-500 text-white px-4 py-2 rounded-full font-bold text-lg rotate-[20deg]">
            <Check className="w-6 h-6 inline mr-1" /> Snap ik!
          </div>
        </motion.div>

        <p className="text-xl md:text-2xl font-medium text-earth-800 text-center leading-relaxed relative z-10">
          {card.stelling}
        </p>
        <p className="text-xs text-earth-300 absolute bottom-4">Swipe of gebruik de knoppen</p>
      </div>
    </motion.div>
  )
}
