import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronDown, Loader2, ArrowRight } from 'lucide-react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'

interface Lesson { id: string; subject: string; course_name: string | null; summary: string | null }

export default function SummaryView() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/lessons/${id}`)
      .then(r => r.ok ? r.json() : null)
      .then(setLesson)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 text-cheetah-500 animate-spin" /></div>
  if (!lesson) return <div className="min-h-screen flex items-center justify-center"><p className="text-earth-400">Les niet gevonden</p></div>

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative">
      <div className="absolute inset-0 -z-10 spot-decoration opacity-15" />
      <div className="w-full max-w-lg">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center mb-8">
          {lesson.course_name && <Badge variant="primary" size="sm">{lesson.course_name}</Badge>}
          <h1 className="text-3xl md:text-4xl font-bold text-earth-900 mt-3">{lesson.subject}</h1>
        </motion.div>

        <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
          <Card padding="lg" className="bg-gradient-to-br from-cheetah-50 to-primary-50 border-cheetah-200/40 shadow-lg">
            <p className="text-lg leading-relaxed text-earth-700 whitespace-pre-line">
              {lesson.summary || 'Geen samenvatting beschikbaar.'}
            </p>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-8 text-center">
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }} className="mb-4">
            <ChevronDown className="w-6 h-6 text-earth-300 mx-auto" />
          </motion.div>
          <Button variant="primary" size="lg" onClick={() => navigate(`/student/lesson/${id}/cards`)}>
            Verder naar de kaartjes <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>
      </div>
    </motion.div>
  )
}
