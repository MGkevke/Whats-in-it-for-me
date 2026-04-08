import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import LandingPage from './pages/LandingPage'
import CreateLesson from './pages/CreateLesson'
import LessonPreview from './pages/LessonPreview'
import TeacherDashboard from './pages/TeacherDashboard'
import StudentFeedbackView from './pages/StudentFeedbackView'
import JoinLesson from './pages/JoinLesson'
import SummaryView from './pages/SummaryView'
import SwipeCards from './pages/SwipeCards'
import LearningWishes from './pages/LearningWishes'
import ThankYou from './pages/ThankYou'

export default function App() {
  const location = useLocation()

  return (
    <div className="min-h-screen gradient-bg">
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/teacher/create" element={<CreateLesson />} />
          <Route path="/teacher/lesson/:id" element={<LessonPreview />} />
          <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
          <Route path="/teacher/lesson/:id/feedback" element={<StudentFeedbackView />} />
          <Route path="/student/join" element={<JoinLesson />} />
          <Route path="/student/lesson/:id" element={<SummaryView />} />
          <Route path="/student/lesson/:id/cards" element={<SwipeCards />} />
          <Route path="/student/lesson/:id/wishes" element={<LearningWishes />} />
          <Route path="/student/thankyou" element={<ThankYou />} />
        </Routes>
      </AnimatePresence>
    </div>
  )
}
