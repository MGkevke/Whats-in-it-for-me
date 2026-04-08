import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Send, Loader2 } from 'lucide-react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'

export default function LearningWishes() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [subject, setSubject] = useState('')
  const [wishes, setWishes] = useState<string[]>([''])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/lessons/${id}`)
      .then(r => r.ok ? r.json() : null)
      .then(lesson => { if (lesson) setSubject(lesson.subject) })
      .catch(() => {})
  }, [id])

  const addWish = () => {
    if (wishes.length < 7) setWishes([...wishes, ''])
  }

  const removeWish = (index: number) => {
    if (wishes.length > 1) setWishes(wishes.filter((_, i) => i !== index))
  }

  const updateWish = (index: number, value: string) => {
    setWishes(wishes.map((w, i) => i === index ? value.slice(0, 100) : w))
  }

  const handleSubmit = async () => {
    const validWishes = wishes.filter(w => w.trim())
    if (validWishes.length === 0) { setError('Voer minimaal 1 punt in'); return }

    setSubmitting(true)
    setError('')

    try {
      const cardResults = JSON.parse(sessionStorage.getItem('cardResults') || '[]')
      const studentName = sessionStorage.getItem('studentName') || undefined

      const res = await fetch(`/api/lessons/${id}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_name: studentName,
          card_results: cardResults,
          wishes: validWishes,
        }),
      })

      if (!res.ok) throw new Error('Versturen mislukt')

      sessionStorage.removeItem('cardResults')
      navigate('/student/thankyou')
    } catch {
      setError('Er ging iets mis. Probeer het opnieuw.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Wat wil jij leren deze les?
          </h1>
          <p className="text-gray-500 text-sm">
            Voer in wat je het liefst wilt behandelen over <span className="font-medium text-purple-600">{subject}</span>.
            Je kunt tot 7 punten opgeven.
          </p>
        </motion.div>

        <Card padding="lg" className="shadow-lg">
          <div className="space-y-3">
            <AnimatePresence>
              {wishes.map((wish, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 w-5 flex-shrink-0">{i + 1}.</span>
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={wish}
                        onChange={(e) => updateWish(i, e.target.value)}
                        placeholder="Ik wil meer weten over..."
                        maxLength={100}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-100 focus:outline-none transition-all pr-12"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-300">
                        {wish.length}/100
                      </span>
                    </div>
                    {wishes.length > 1 && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => removeWish(i)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {wishes.length < 7 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={addWish}
              className="mt-4 w-full py-3 rounded-xl border-2 border-dashed border-gray-200 hover:border-purple-300 hover:bg-purple-50/50 text-sm text-gray-500 hover:text-purple-600 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Punt toevoegen
            </motion.button>
          )}

          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-600 bg-red-50 p-3 rounded-lg mt-4 text-center">
              {error}
            </motion.p>
          )}

          <div className="mt-6">
            <Button variant="primary" size="lg" fullWidth onClick={handleSubmit} loading={submitting}
              disabled={wishes.every(w => !w.trim())}>
              <Send className="w-4 h-4" /> Versturen
            </Button>
          </div>
        </Card>
      </div>
    </motion.div>
  )
}
