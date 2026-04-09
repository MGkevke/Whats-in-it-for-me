import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, BookOpen, Tag, Upload, FileText, X, Loader2, Zap } from 'lucide-react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'

export default function CreateLesson() {
  const navigate = useNavigate()
  const [subject, setSubject] = useState('')
  const [courseName, setCourseName] = useState('')
  const [extraContext, setExtraContext] = useState('')
  const [fileText, setFileText] = useState('')
  const [fileName, setFileName] = useState('')
  const [uploading, setUploading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setFileName(file.name)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      if (!res.ok) throw new Error('Upload mislukt')
      const data = await res.json()
      setFileText(data.text || '')
    } catch {
      setError('Bestand uploaden mislukt. Probeer het opnieuw.')
      setFileName('')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subject.trim()) { setError('Vul een lesonderwerp in'); return }
    setGenerating(true)
    setError('')
    try {
      const res = await fetch('/api/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: subject.trim(),
          course_name: courseName.trim() || undefined,
          extra_context: extraContext.trim() || undefined,
          file_text: fileText || undefined,
        }),
      })
      if (!res.ok) throw new Error('Aanmaken mislukt')
      const lesson = await res.json()
      navigate(`/teacher/lesson/${lesson.id}`)
    } catch {
      setError('Er ging iets mis bij het aanmaken. Probeer het opnieuw.')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen px-4 py-8 relative"
    >
      <div className="absolute inset-0 -z-10 spot-decoration opacity-20" />
      <div className="max-w-2xl mx-auto">
        <motion.button
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-earth-400 hover:text-earth-600 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Terug</span>
        </motion.button>

        <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cheetah-400 to-primary-500 flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-earth-900">Nieuwe les aanmaken</h1>
        </motion.div>
        <motion.p
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="text-earth-400 mb-8 ml-[52px]"
        >
          Vul de details in en laat AI je lesvoorbereiding genereren
        </motion.p>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
          <Card padding="lg">
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Lesonderwerp *"
                placeholder="bijv. De Franse Revolutie"
                icon={<BookOpen className="w-4 h-4" />}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
              <Input
                label="Vaknaam"
                placeholder="bijv. Geschiedenis"
                icon={<Tag className="w-4 h-4" />}
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
              />
              <Input
                label="Extra toelichting"
                placeholder="Geef extra context of focus voor de AI..."
                as="textarea"
                value={extraContext}
                onChange={(e) => setExtraContext(e.target.value)}
              />

              <div className="space-y-2">
                <label className="block text-sm font-medium text-earth-700">Bestand uploaden</label>
                {fileName ? (
                  <div className="flex items-center gap-3 p-3 bg-cheetah-50 rounded-xl border border-cheetah-200/60">
                    <FileText className="w-5 h-5 text-cheetah-600" />
                    <span className="text-sm text-cheetah-700 flex-1 truncate">{fileName}</span>
                    <button type="button" onClick={() => { setFileName(''); setFileText('') }} className="text-earth-400 hover:text-earth-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-cheetah-200/60 rounded-xl hover:border-cheetah-400/60 hover:bg-cheetah-50/50 transition-colors cursor-pointer">
                    {uploading ? <Loader2 className="w-8 h-8 text-cheetah-400 animate-spin mb-2" /> : <Upload className="w-8 h-8 text-earth-300 mb-2" />}
                    <span className="text-sm text-earth-500">{uploading ? 'Bezig met uploaden...' : 'Klik om een bestand te selecteren'}</span>
                    <span className="text-xs text-earth-300 mt-1">PDF, DOCX, PPTX, JPG of PNG</span>
                    <input type="file" accept=".pdf,.docx,.pptx,.jpg,.jpeg,.png" onChange={handleFileUpload} className="hidden" disabled={uploading} />
                  </label>
                )}
              </div>

              {error && (
                <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-coral-600 bg-coral-50 p-3 rounded-lg">
                  {error}
                </motion.p>
              )}

              <Button type="submit" variant="primary" size="lg" fullWidth loading={generating} disabled={!subject.trim() || uploading}>
                {generating ? 'AI genereert lesvoorbereiding...' : 'Genereer lesvoorbereiding'}
              </Button>
            </form>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}
