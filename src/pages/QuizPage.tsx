import { use } from 'react'
import { useParams } from 'react-router'
import QuizView from '../components/quiz/QuizView'
import { NotFound } from '../components/DetailPage'
import { loadQuiz, quizzes, type QuizDef } from '../data/quizzes'
import { t } from '../i18n'

// Suspends until the source files the quiz reads have arrived (see loadQuiz).
function LoadedQuiz({ def }: { def: QuizDef }) {
  use(loadQuiz(def))
  return <QuizView def={def} />
}

// The standalone /quiz/<slug> page — reads from the quiz registry, the single source.
function QuizPage() {
  const { slug } = useParams()
  const def = slug ? quizzes[slug] : undefined
  if (!def) {
    return (
      <NotFound back="/quiz" backLabel={t.quiz.backToList} message={t.quiz.notFound} className="max-w-xl" />
    )
  }
  return <LoadedQuiz def={def} />
}

export default QuizPage
