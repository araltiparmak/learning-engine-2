import type { ComponentType } from 'react'
import EnglishBridge from './EnglishBridge'
import CaseFlow from './CaseFlow'
import DirectionCompass from './DirectionCompass'
import SentenceParts from './SentenceParts'
import PosterWall from './PosterWall'
import DialogLesson from './DialogLesson'
import TimeLine from './TimeLine'
import TurnDiagram from './TurnDiagram'
import {
  SpeechPhrases,
  SpeechDialog,
  SpeechLadder,
  SpeechDrill,
  SpeechMistakes,
  SpeechTakeaway,
  SpeechScene,
} from './speech'
import {
  PairList,
  ContrastBox,
  TeKaMoLoSlots,
  FormTable,
  TableCards,
  VerbTable,
  ModalCards,
  RevealExercises,
  WordTable,
  EmailSamples,
} from './blocks'
import { PatternList, TermList, MistakeList, RewriteList, TimeTravel, FrequencyBar } from './lists'
import { PronunciationCheck } from './pronunciation'

// The whitelist of components a lesson may call from a `component` block. Only names
// registered here render (safe: there is no dynamic file-path import).
// For a heavy or interactive component: add it via React.lazy(() => import('./Heavy'))
// and wrap it in Suspense inside LessonRenderer.
//
// One list for every target. An entry enters a build only when that target's content
// pack uses it: vite/contentUsage.ts scans the pack for `component` blocks and sets
// import.meta.env.VITE_BLOCK_<name> to true or false, and a false flag lets the bundler
// drop the component. The flag has to be written out in full at each entry — only the
// literal expression is replaced at build time.
//
// The keys are the `name` a lesson JSON writes in its `component` block — data, not
// code — so they keep their spelling even when a component is renamed (KasusFlow).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const registry: Record<string, ComponentType<any> | false> = {
  EnglishBridge: import.meta.env.VITE_BLOCK_EnglishBridge && EnglishBridge,
  KasusFlow: import.meta.env.VITE_BLOCK_KasusFlow && CaseFlow,
  DirectionCompass: import.meta.env.VITE_BLOCK_DirectionCompass && DirectionCompass,
  SentenceParts: import.meta.env.VITE_BLOCK_SentenceParts && SentenceParts,
  PosterWall: import.meta.env.VITE_BLOCK_PosterWall && PosterWall,
  DialogLesson: import.meta.env.VITE_BLOCK_DialogLesson && DialogLesson,
  TimeLine: import.meta.env.VITE_BLOCK_TimeLine && TimeLine,
  TurnDiagram: import.meta.env.VITE_BLOCK_TurnDiagram && TurnDiagram,
  SpeechPhrases: import.meta.env.VITE_BLOCK_SpeechPhrases && SpeechPhrases,
  SpeechDialog: import.meta.env.VITE_BLOCK_SpeechDialog && SpeechDialog,
  SpeechLadder: import.meta.env.VITE_BLOCK_SpeechLadder && SpeechLadder,
  SpeechDrill: import.meta.env.VITE_BLOCK_SpeechDrill && SpeechDrill,
  SpeechMistakes: import.meta.env.VITE_BLOCK_SpeechMistakes && SpeechMistakes,
  SpeechTakeaway: import.meta.env.VITE_BLOCK_SpeechTakeaway && SpeechTakeaway,
  SpeechScene: import.meta.env.VITE_BLOCK_SpeechScene && SpeechScene,
  PairList: import.meta.env.VITE_BLOCK_PairList && PairList,
  ContrastBox: import.meta.env.VITE_BLOCK_ContrastBox && ContrastBox,
  TeKaMoLoSlots: import.meta.env.VITE_BLOCK_TeKaMoLoSlots && TeKaMoLoSlots,
  FormTable: import.meta.env.VITE_BLOCK_FormTable && FormTable,
  TableCards: import.meta.env.VITE_BLOCK_TableCards && TableCards,
  VerbTable: import.meta.env.VITE_BLOCK_VerbTable && VerbTable,
  ModalCards: import.meta.env.VITE_BLOCK_ModalCards && ModalCards,
  RevealExercises: import.meta.env.VITE_BLOCK_RevealExercises && RevealExercises,
  WordTable: import.meta.env.VITE_BLOCK_WordTable && WordTable,
  EmailSamples: import.meta.env.VITE_BLOCK_EmailSamples && EmailSamples,
  PatternList: import.meta.env.VITE_BLOCK_PatternList && PatternList,
  TermList: import.meta.env.VITE_BLOCK_TermList && TermList,
  MistakeList: import.meta.env.VITE_BLOCK_MistakeList && MistakeList,
  RewriteList: import.meta.env.VITE_BLOCK_RewriteList && RewriteList,
  TimeTravel: import.meta.env.VITE_BLOCK_TimeTravel && TimeTravel,
  FrequencyBar: import.meta.env.VITE_BLOCK_FrequencyBar && FrequencyBar,
  PronunciationCheck: import.meta.env.VITE_BLOCK_PronunciationCheck && PronunciationCheck,
}
