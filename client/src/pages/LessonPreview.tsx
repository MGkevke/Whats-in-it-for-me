import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Check, Copy, LayoutDashboard, Loader2, X } from 'lucide-react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import ChatRefine from '../components/teacher/ChatRefine'

interface CardItem {
  stelling: string
  correct: boolean
  uitleg: string
}

interface Lesson {
  id: string
  code: string
  subject: string
  course_name: string | null
  summary: string | null
  cards_json: string | null
  status: string
}

export default function LessonPreview() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)
  const [publishing, setPublishing] = useState(false)
  const [showPublished, setShowPublished] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch(`/api/lessons/${id}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setLesson)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  const handlePublish = async () => {
    if (!lesson) return
    setPublishing(true)
    try {
      const res = await fetch(`/api/lessons/${lesson.id}/publish`, { method: 'PUT' })
      if (res.ok) {
        const updated = await res.json()
        setLesson(updated)
        setShowPublished(true)
      }
    } catch { /* ignore */ } finally { setPublishing(false) }
  }

  const copyCode = () => {
    if (!lesson) return
    navigator.clipboard.writeText(lesson.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const cards: CardItem[] = lesson?.cards_json ? JSON.parse(lesson.cards_json) : []

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 text-purple-600 animate-spin" /></div>
  if (!lesson) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Les niet gevonden</p></div>

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="min-h-screen px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate('/teacher/create')} className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors">
            <ArrowLeft className="w-4 h-4" /><span className="text-sm">Terug</span>
          </button>
          <Badge variant={lesson.status === 'published' ? 'success' : 'warning'}>
            {lesson.status === 'published' ? 'Gepubliceerd' : 'Concept'}
          </Badge>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-1">{lesson.subject}</h1>
        {lesson.course_name && <Badge variant="primary" size="sm">{lesson.course_name}</Badge>}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-8">
          <div className="lg:col-span-3 space-y-6">
            <Card padding="lg">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Samenvatting</h2>
              {lesson.summary
                ? <p className="text-gray-700 leading-relaxed whitespace-pre-line">{lesson.summary}</p>
                : <p className="text-gray-400 italic">Nog geen samenvatting gegenereerd</p>}
            </Card>

            <Card padding="lg">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Swipe-kaartjes</h2>
              {cards.length > 0 ? (
                <div className="space-y-4">
                  {cards.map((card, i) => (
                    <motion.div key={i} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.1 }}
                      className={`p-4 rounded-xl border-2 ${card.correct ? 'border-green-200 bg-green-50/50' : 'border-red-200 bg-red-50/50'}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-medium text-gray-800">{card.stelling}</p>
                        <Badge variant={card.correct ? 'success' : 'danger'} size="sm">{card.correct ? 'Juist' : 'Onjuist'}</Badge>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">{card.uitleg}</p>
                    </motion.div>
                  ))}
                </div>
              ) : <p className="text-gray-400 italic">Nog geen kaartjes gegenereerd</p>}
            </Card>

            {lesson.status !== 'published' && (
              <Button variant="success" size="lg" fullWidth onClick={handlePublish} loading={publishing}>
                Goedkeuren & Publiceren
              </Button>
            )}

            {lesson.status === 'published' && (
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-green-800">Gepubliceerd</p>
                  <p className="text-sm text-green-600">Lescode: <span className="font-mono font-bold">{lesson.code}</span></p>
                </div>
                <button onClick={copyCode} className="p-2 hover:bg-green-100 rounded-lg transition-colors flex-shrink-0">
                  {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-green-600" />}
                </button>
                <Button variant="ghost" size="sm" onClick={() => navigate('/teacher/dashboard')}>
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </Button>
              </div>
            )}
          </div>

          <div className="lg:col-span-2">
            <ChatRefine lessonId={lesson.id} onUpdate={(updated) => setLesson(updated)} />
          </div>
        </div>
      </div>

      {/* Published modal */}
      <AnimatePresence>
        {showPublished && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowPublished(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-xl relative">
              <button onClick={() => setShowPublished(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-green-600" />
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Les gepubliceerd!</h2>
              <p className="text-gray-500 mb-6">Deel deze code met je studenten:</p>
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <p className="text-3xl font-mono font-bold text-purple-700">{lesson.code}</p>
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" fullWidth onClick={copyCode}>{copied ? 'Gekopieerd!' : 'Kopieer code'}</Button>
                <Button variant="primary" fullWidth onClick={() => navigate('/teacher/dashboard')}>Naar dashboard</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
