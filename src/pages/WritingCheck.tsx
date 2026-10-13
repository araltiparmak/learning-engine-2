import WritingCheck from '../components/WritingCheck'
import { language } from '../lib/language'

// The standalone /yazma page: the same widget lessons embed, minus a lesson to anchor it
// to, so the learner names the topic themselves. Both are open — see LessonWriting and
// api/correction.ts for what guards the quota now that no key does.
const LEAD = language.writingCheck?.pageLead

function WritingCheckPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold tracking-tight">Yazma denemesi</h1>
      <p className="mt-2 mb-6 text-sm text-gray-600">{LEAD}</p>
      <WritingCheck />
    </div>
  )
}

export default WritingCheckPage
