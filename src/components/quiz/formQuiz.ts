import { sourceField, sourceRows } from '../../data/sources'

// Shared by the two form engines (FormChoiceQuiz, FormWriteQuiz): a quiz over the rows of
// one source, one row per question. What to ask is the source's `formQuiz` settings
// object (as `package` is for tekrarPaketi), so the engines know no grammar:
//
//   groups        the source groups that hold the rows, in order
//   prompt        the row field shown in bold (the verb)
//   answer        the row field that is the answer (its participle)
//   answers       when the answer is the GROUP's rather than the row's: group → answer
//   tips          group → the tip shown after answering; {field} fills in a row field
//   rowTips       prompt value → a tip of its own, for a row the group's tip does not fit
//   wrong         prompt value → plausible wrong answers (the choice engine pads them with
//                 other rows' answers)
//   choice/write  each engine's own wording (question, options, placeholder…)
//
// The rows themselves stay as the lesson's tables read them: what only the quiz needs
// lives here, keyed by the prompt, so the lesson's reading-time estimate never counts it.

export type FormRow = Record<string, unknown> & { tr: string; en: string }

export type FormQuizSettings = {
  groups: string[]
  prompt: string
  answer: string
  answers?: Record<string, string>
  tips?: Record<string, string>
  rowTips?: Record<string, string>
  wrong?: Record<string, string[]>
  count?: number
  choice?: { question: string; options?: string[]; optionLabels?: Record<string, string> }
  write?: { question: string; placeholder?: string; label?: string }
}

export type FormItem = { row: FormRow; group: string }

const QUESTION_COUNT = 10

/** Replaces each {field} in a template with that row field. */
export const fill = (template: string, row: Record<string, unknown>) =>
  template.replace(/\{(\w+)\}/g, (_, key: string) => String(row[key] ?? ''))

export function formSettings(source: string): FormQuizSettings {
  return sourceField<FormQuizSettings>(source, 'formQuiz') ?? { groups: [], prompt: '', answer: '' }
}

/** Every row of the settings' groups, in order. Read on call: the source loads lazily. */
export function formItems(source: string, settings: FormQuizSettings): FormItem[] {
  return settings.groups.flatMap((group) => sourceRows<FormRow>(source, group).map((row) => ({ row, group })))
}

export const questionCount = (settings: FormQuizSettings) => settings.count ?? QUESTION_COUNT

export const rowText = (item: FormItem, field: string) => String(item.row[field] ?? '')

/** The right answer: the group's when the settings map groups to answers, else the row's. */
export function answerOf(item: FormItem, settings: FormQuizSettings): string {
  return settings.answers?.[item.group] ?? rowText(item, settings.answer)
}

export function tipOf(item: FormItem, settings: FormQuizSettings): string {
  return settings.rowTips?.[rowText(item, settings.prompt)] ?? fill(settings.tips?.[item.group] ?? '', item.row)
}
