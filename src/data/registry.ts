// Section meta registry and question lookup for the seven assessment sections
import type { Question, SectionMeta } from '../types/app.types'
import { transportMeta, transportQuestions } from './sections/transport'
import { foodMeta, foodQuestions } from './sections/food'
import { energyMeta, energyQuestions } from './sections/energy'
import { consumptionMeta, consumptionQuestions } from './sections/consumption'
import { waterMeta, waterQuestions } from './sections/water'
import { wasteMeta, wasteQuestions } from './sections/waste'
import { digitalMeta, digitalQuestions } from './sections/digital'

export const SECTIONS: SectionMeta[] = [
  transportMeta,
  foodMeta,
  energyMeta,
  consumptionMeta,
  waterMeta,
  wasteMeta,
  digitalMeta,
]

export const questionRegistry: Record<string, Question[]> = {
  [transportMeta.id]: transportQuestions,
  [foodMeta.id]: foodQuestions,
  [energyMeta.id]: energyQuestions,
  [consumptionMeta.id]: consumptionQuestions,
  [waterMeta.id]: waterQuestions,
  [wasteMeta.id]: wasteQuestions,
  [digitalMeta.id]: digitalQuestions,
}
