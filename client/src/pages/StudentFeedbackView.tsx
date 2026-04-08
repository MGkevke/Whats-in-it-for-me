import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Loader2, Users, BarChart3, MessageSquare } from 'lucide-react'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'

interface CardItem { stelling: string; correct: boolean; uitleg: string }
interface CardStat { cardIndex: number; understood: number; notUnderstood: number; total: number; understoodPercentage: number }
interface Bulletpoint { punt: string; aantal_studenten: number }
interface Lesson { id: string; code: string; subject: string; course_name: string | null; summary: string | null; cards_json: string | null; status: string }

export default function StudentFeedbackView() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [cardStats, setCardStats] = useState<CardStat[]>([])
  const [totalResponses, setTotalResponses] = useState(0)
  const [bulletpoints, setBulletpoints] = useState<Bulletpoint[]>([])
  const [loading, setLoading] = useState(true)
  const [feedbackLoading, setFeedbackLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch(`/api/lessons/${id}`).then(r => r.ok ? r.json() : null),
      fetch(`/api/lessons/${id}/stats`).then(r => r.ok ? r.json() : { totalResponses: 0, cards: [] }),
    ]).then(([lessonData, statsData]) => {
      setLesson(lessonData)
      setCardStats(statsData.cards || [])
      setTotalResponses(statsData.totalResponses || 0)
      setLoading(false)
    }).catch(() => setLoading(false))

    fetch(`/api/lessons/${id}/feedback`)
      .then(r => r.ok ? r.json() : { bulletpoints: [] })
      .then(data => setBulletpoints(data.bulletpoints || []))
      .catch(() => {})
      .finally(() => setFeedbackLoading(false))
  }, [id])

  const cards: CardItem[] = lesson?.cards_json ? JSON.parse(lesson.cards_json) : []
  const maxStudents = bulletpoints.length > 0 ? Math.max(...bulletpoints.map(b => b.aantal_studenten)) : 1
  const avgUnderstood = cardStats.length > 0
    ? Math.round(cardStats.reduce((sum, s) => sum + s.understoodPercentage, 0) / cardStats.length)
    : 0

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 text-purple-600 animate-spin" /></div>
  if (!lesson) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Les niet gevonden</p></div>

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="min-h-screen px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate('/teacher/dashboard')} className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /><span className="text-sm">Dashboard</span>
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{lesson.subject}</h1>
          <div className="flex items-center gap-3 mt-2">
            {lesson.course_name && <Badge variant="primary" size="sm">{lesson.course_name}</Badge>}
            <span className="font-mono text-sm text-purple-600">{lesson.code}</span>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <Card padding="md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalResponses}</p>
                <p className="text-xs text-gray-500">Studenten</p>
              </div>
            </div>
          </Card>
          <Card padding="md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{avgUnderstood}%</p>
                <p className="text-xs text-gray-500">Begrepen</p>
              </div>
            </div>
          </Card>
          <Card padding="md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{bulletpoints.length}</p>
                <p className="text-xs text-gray-500">Leerwensen</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Card results */}
        <Card padding="lg" className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-600" /> Kaartjes resultaten
          </h2>
          {totalResponses === 0 ? (
            <p className="text-gray-400 text-center py-4">Nog geen reacties van studenten</p>
          ) : (
            <div className="space-y-6">
              {cards.map((card, i) => {
                const stat = cardStats.find(s => s.cardIndex === i)
                const understood = stat?.understoodPercentage ?? 0
                const notUnderstood = 100 - understood
                return (
                  <motion.div key={i} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.1 }}>
                    <p className="text-sm font-medium text-gray-800 mb-2">{card.stelling}</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden flex">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${understood}%` }}
                          transition={{ duration: 0.8, delay: i * 0.1 }}
                          className="bg-green-500 h-full flex items-center justify-end px-2"
                        >
                          {understood > 15 && <span className="text-xs text-white font-medium">{understood}%</span>}
                        </motion.div>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${notUnderstood}%` }}
                          transition={{ duration: 0.8, delay: i * 0.1 }}
                          className="bg-red-400 h-full flex items-center px-2"
                        >
                          {notUnderstood > 15 && <span className="text-xs text-white font-medium">{notUnderstood}%</span>}
                        </motion.div>
                      </div>
                      <span className="text-xs text-gray-500 w-20 text-right">{stat?.total || 0} antw.</span>
                    </div>
                    <div className="flex gap-4 mt-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> Snap ik</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400" /> Snap ik niet</span>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </Card>

        {/* Learning wishes */}
        <Card padding="lg">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-purple-600" /> Wat willen studenten leren?
          </h2>
          {feedbackLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-purple-600 animate-spin mr-2" />
              <span className="text-gray-500 text-sm">AI analyseert studentfeedback...</span>
            </div>
          ) : bulletpoints.length === 0 ? (
            <p className="text-gray-400 text-center py-4">Nog geen leerwensen ontvangen</p>
          ) : (
            <div className="space-y-3">
              {bulletpoints.map((bp, i) => (
                <motion.div key={i} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{bp.punt}</p>
                    <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(bp.aantal_studenten / maxStudents) * 100}%` }}
                        transition={{ duration: 0.6, delay: i * 0.05 }}
                        className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                      />
                    </div>
                  </div>
                  <Badge variant="primary" size="sm">{bp.aantal_studenten}x</Badge>
                </motion.div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </motion.div>
  )
}
