import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, BookOpen, Users, ArrowLeft, Loader2, Copy, Check, Zap } from 'lucide-react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'

interface Lesson {
  id: string
  code: string
  subject: string
  course_name: string | null
  status: string
  created_at: string
}

interface Stats {
  totalResponses: number
}

export default function TeacherDashboard() {
  const navigate = useNavigate()
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [stats, setStats] = useState<Record<string, Stats>>({})
  const [loading, setLoading] = useState(true)
  const [copiedCode, setCopiedCode] = useState('')

  useEffect(() => {
    fetch('/api/lessons')
      .then(r => r.ok ? r.json() : [])
      .then(async (data: Lesson[]) => {
        setLessons(data)
        const statsMap: Record<string, Stats> = {}
        await Promise.all(data.map(async (l) => {
          try {
            const r = await fetch(`/api/lessons/${l.id}/stats`)
            if (r.ok) statsMap[l.id] = await r.json()
          } catch { /* ignore */ }
        }))
        setStats(statsMap)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const copyCode = (code: string, e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(''), 2000)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 text-cheetah-500 animate-spin" /></div>

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="min-h-screen px-4 py-8 relative">
      <div className="absolute inset-0 -z-10 spot-decoration opacity-15" />
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <button onClick={() => navigate('/')} className="inline-flex items-center gap-2 text-earth-400 hover:text-earth-600 transition-colors mb-4">
              <ArrowLeft className="w-4 h-4" /><span className="text-sm">Terug</span>
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cheetah-400 to-primary-500 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-earth-900">Mijn Lessen</h1>
            </div>
          </div>
          <Button variant="primary" onClick={() => navigate('/teacher/create')}>
            <Plus className="w-4 h-4" /> Nieuwe les
          </Button>
        </div>

        {lessons.length === 0 ? (
          <Card padding="lg" className="text-center">
            <BookOpen className="w-12 h-12 text-earth-200 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-earth-500 mb-2">Nog geen lessen</h2>
            <p className="text-earth-300 mb-6">Maak je eerste les aan om te beginnen</p>
            <Button variant="primary" onClick={() => navigate('/teacher/create')}>
              <Plus className="w-4 h-4" /> Les aanmaken
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lessons.map((lesson, i) => (
              <motion.div
                key={lesson.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card hover padding="md" className="cursor-pointer h-full relative overflow-hidden"
                  onClick={() => navigate(lesson.status === 'published' ? `/teacher/lesson/${lesson.id}/feedback` : `/teacher/lesson/${lesson.id}`)}>
                  {/* Subtle cheetah accent on top */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cheetah-400 to-primary-500" />

                  <div className="flex items-start justify-between mb-3 mt-1">
                    <Badge variant={lesson.status === 'published' ? 'success' : 'warning'} size="sm">
                      {lesson.status === 'published' ? 'Gepubliceerd' : 'Concept'}
                    </Badge>
                    {lesson.course_name && <Badge variant="neutral" size="sm">{lesson.course_name}</Badge>}
                  </div>

                  <h3 className="text-lg font-semibold text-earth-900 mb-2">{lesson.subject}</h3>

                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-mono text-sm text-cheetah-700 bg-cheetah-50 px-2 py-1 rounded-lg">{lesson.code}</span>
                    <button onClick={(e) => copyCode(lesson.code, e)} className="p-1 hover:bg-cheetah-50 rounded transition-colors">
                      {copiedCode === lesson.code ? <Check className="w-3.5 h-3.5 text-success-600" /> : <Copy className="w-3.5 h-3.5 text-earth-400" />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-sm text-earth-400 mt-auto pt-3 border-t border-cheetah-100/60">
                    <span>{new Date(lesson.created_at).toLocaleDateString('nl-NL')}</span>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{stats[lesson.id]?.totalResponses || 0} studenten</span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}
