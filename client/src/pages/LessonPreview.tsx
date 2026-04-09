import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Check, Copy, LayoutDashboard, Loader2, X, Zap } from 'lucide-react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import ChatRefine from '../components/teacher/ChatRefine'

interface CardItem { stelling: string; correct: boolean; uitleg: string }
interface Lesson { id: string; code: string; subject: string; course_name: string | null; summary: string | null; cards_json: string | null; status: string }

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
      if (res.ok) { const updated = await res.json(); setLesson(updated); setShowPublished(true) }
    } catch {} finally { setPublishing(false) }
  }

  const copyCode = () => {
    if (!lesson) return
    navigator.clipboard.writeText(lesson.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const cards: CardItem[] = lesson?.cards_json ? JSON.parse(lesson.cards_json) : []

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 text-cheetah-500 animate-spin" /></div>
  if (!lesson) return <div className="min-h-screen flex items-center justify-center"><p className="text-earth-400">Les niet gevonden</p></div>

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="min-h-screen px-4 py-8 relative">
      <div className="absolute inset-0 -z-10 spot-decoration opacity-15" />
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate('/teacher/create')} className="inline-flex items-center gap-2 text-earth-400 hover:text-earth-600 transition-colors">
            <ArrowLeft className="w-4 h-4" /><span className="text-sm">Terug</span>
          </button>
          <Badge variant={lesson.status === 'published' ? 'success' : 'warning'}>
            {lesson.status === 'published' ? 'Gepubliceerd' : 'Concept'}
          </Badge>
        </div>

        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cheetah-400 to-primary-500 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-earth-900">{lesson.subject}</h1>
        </div>
        {lesson.course_name && <div className="ml-11"><Badge variant="primary" size="sm">{lesson.course_name}</Badge></div>}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-8">
          <div className="lg:col-span-3 space-y-6">
            <Card padding="lg" className="bg-gradient-to-br from-white to-cheetah-50/30">
              <h2 className="text-lg font-semibold text-earth-900 mb-4">Samenvatting</h2>
              {lesson.summary
                ? <p className="text-earth-600 leading-relaxed whitespace-pre-line">{lesson.summary}</p>
                : <p className="text-earth-300 italic">Nog geen samenvatting gegenereerd</p>}
            </Card>

            <Card padding="lg">
              <h2 className="text-lg font-semibold text-earth-900 mb-4">Swipe-kaartjes</h2>
              {cards.length > 0 ? (
                <div className="space-y-4">
                  {cards.map((card, i) => (
                    <motion.div key={i} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.1 }}
                      className={`p-4 rounded-xl border-2 ${card.correct ? 'border-success-200 bg-success-50/50' : 'border-coral-200 bg-coral-50/50'}`}>
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-medium text-earth-800">{card.stelling}</p>
                        <Badge variant={card.correct ? 'success' : 'danger'} size="sm">{card.correct ? 'Juist' : 'Onjuist'}</Badge>
                      </div>
                      <p className="text-sm text-earth-400 mt-2">{card.uitleg}</p>
                    </motion.div>
                  ))}
                </div>
              ) : <p className="text-earth-300 italic">Nog geen kaartjes gegenereerd</p>}
            </Card>

            {lesson.status !== 'published' && (
              <Button variant="success" size="lg" fullWidth onClick={handlePublish} loading={publishing}>
                Goedkeuren & Publiceren
              </Button>
            )}

            {lesson.status === 'published' && (
              <div className="flex items-center gap-3 p-4 bg-success-50 rounded-xl border border-success-200">
                <Check className="w-5 h-5 text-success-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-success-800">Gepubliceerd</p>
                  <p className="text-sm text-success-600">Lescode: <span className="font-mono font-bold">{lesson.code}</span></p>
                </div>
                <button onClick={copyCode} className="p-2 hover:bg-success-100 rounded-lg transition-colors flex-shrink-0">
                  {copied ? <Check className="w-4 h-4 text-success-600" /> : <Copy className="w-4 h-4 text-success-600" />}
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

      <AnimatePresence>
        {showPublished && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowPublished(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-xl relative">
              <button onClick={() => setShowPublished(false)} className="absolute top-4 right-4 text-earth-300 hover:text-earth-500"><X className="w-5 h-5" /></button>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                className="w-20 h-20 bg-gradient-to-br from-cheetah-100 to-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-cheetah-600" />
              </motion.div>
              <h2 className="text-2xl font-bold text-earth-900 mb-2">Les gepubliceerd!</h2>
              <p className="text-earth-400 mb-6">Deel deze code met je studenten:</p>
              <div className="bg-gradient-to-r from-cheetah-50 to-primary-50 rounded-xl p-4 mb-6">
                <p className="text-3xl font-mono font-bold text-cheetah-700">{lesson.code}</p>
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
