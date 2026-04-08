import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { KeyRound, User, BookOpen, ArrowLeft } from 'lucide-react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'

export default function JoinLesson() {
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) { setError('Vul een lescode in'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/lessons/code/${code.trim().toUpperCase()}`)
      if (!res.ok) {
        setError('Les niet gevonden. Controleer de code.')
        return
      }
      const lesson = await res.json()
      if (name.trim()) sessionStorage.setItem('studentName', name.trim())
      navigate(`/student/lesson/${lesson.id}`)
    } catch {
      setError('Er ging iets mis. Probeer het opnieuw.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-50 via-white to-purple-50" />

      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-8 text-center">
        <button onClick={() => navigate('/')} className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-600 transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /><span className="text-sm">Terug</span>
        </button>
        <div className="flex items-center gap-2 justify-center mb-2">
          <BookOpen className="w-6 h-6 text-purple-600" />
          <span className="text-xl font-bold text-purple-600">LesPrep</span>
        </div>
      </motion.div>

      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="w-full max-w-md">
        <Card padding="lg" className="shadow-xl">
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">Doe mee met een les</h1>
          <p className="text-gray-500 text-center mb-8 text-sm">Voer de code in die je van je docent hebt gekregen</p>

          <form onSubmit={handleJoin} className="space-y-5">
            <Input
              label="Lescode"
              placeholder="bijv. FRA-2847"
              icon={<KeyRound className="w-4 h-4" />}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="text-center font-mono text-lg tracking-wider"
              required
            />
            <Input
              label="Je naam (optioneel)"
              placeholder="Hoe heet je?"
              icon={<User className="w-4 h-4" />}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            {error && (
              <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-600 bg-red-50 p-3 rounded-lg text-center">{error}</motion.p>
            )}

            <Button type="submit" variant="primary" size="lg" fullWidth loading={loading} disabled={!code.trim()}>
              Deelnemen
            </Button>
          </form>
        </Card>
      </motion.div>
    </motion.div>
  )
}
