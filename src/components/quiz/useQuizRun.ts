import { useState } from 'react'

// State shared by every quiz engine: the question deck, position, answer, score, end.
// An engine only writes the "how does a question look / is this answer right" part.
//   Q = question type, A = answer type (option text, 'haben' | 'sein', typed result…)
export function useQuizRun<Q, A>(build: () => Q[]) {
  const [questions, setQuestions] = useState<Q[]>(build)
  const [current, setCurrent] = useState(0)
  const [answer, setAnswer] = useState<A | null>(null)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)

  const total = questions.length
  const isLast = current + 1 >= total

  /** Records the answer; a second call on the same question does nothing. */
  const submit = (value: A, correct: boolean) => {
    if (answer !== null) return
    setAnswer(value)
    if (correct) setScore((s) => s + 1)
  }

  const next = () => {
    if (isLast) {
      setFinished(true)
    } else {
      setCurrent((c) => c + 1)
      setAnswer(null)
    }
  }

  const restart = () => {
    setQuestions(build())
    setCurrent(0)
    setAnswer(null)
    setScore(0)
    setFinished(false)
  }

  return {
    questions,
    question: questions[current],
    current,
    total,
    isLast,
    answer,
    answered: answer !== null,
    score,
    finished,
    submit,
    next,
    restart,
  }
}
