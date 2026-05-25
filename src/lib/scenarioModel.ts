import type { ScenarioSpec } from '../types/calc'

export type BonusDuration = 'first-year' | 'first-two-years'

export interface BonusConfig {
  duration: BonusDuration
  amount: number
}

export interface UIScenario {
  name: string
  recurring: number
  bonus: BonusConfig | null
}

export const BONUS_LABEL: Record<BonusDuration, string> = {
  'first-year': '1. rok (mies. 1–12)',
  'first-two-years': '2 lata (mies. 1–24)',
}

export function toScenarioSpec(scenario: UIScenario): ScenarioSpec {
  if (!scenario.bonus || scenario.bonus.amount <= 0) {
    return { name: scenario.name, recurringOverpayment: scenario.recurring }
  }
  const toMonth = scenario.bonus.duration === 'first-year' ? 12 : 24
  return {
    name: scenario.name,
    recurringOverpayment: scenario.recurring,
    timeBands: [
      {
        fromMonth: 1,
        toMonth,
        amount: scenario.recurring + scenario.bonus.amount,
      },
    ],
  }
}
