import WritingCheck from './WritingCheck'

// The writing section under a lesson, sitting right after its quizzes: the quizzes check
// whether the learner recognises the rule, this checks whether they can produce it.
//
// The lesson title travels to the model as the topic, so the correction is explained in
// the terms of the lesson the learner is on rather than in general ones. That context is
// the whole reason this belongs under the lesson instead of only on /yazma.
//
// Rendered for every lesson, including those without a quiz — writing a sentence needs no
// quiz data. It costs nothing until the learner presses the button: the request only
// leaves on submit.
function LessonWriting({ title }: { title: string }) {
  return (
    <section id="kendin-yaz" className="mt-10 max-w-3xl scroll-mt-20">
      <h2 className="text-sm font-semibold tracking-wide text-brand-700 uppercase">
        ✍️ Kendin yaz
      </h2>
      <div className="mt-3 rounded-xl border border-brand-200 bg-brand-50/40 p-5">
        <p className="mb-4 text-sm text-gray-600">
          Bu dersteki konuyu kullanarak bir cümle kur — Felix düzeltip hatanı Türkçe
          anlatsın. İkinci sekmede Türkçe cümleni çevirtebilir, çeviride hangi gramerin
          kullanıldığını görebilirsin. Konu olarak{' '}
          <span className="font-medium text-gray-800">{title}</span> alınacak.
        </p>
        <WritingCheck topic={title} />
      </div>
    </section>
  )
}

export default LessonWriting
