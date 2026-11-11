import { roundMoney } from './tax'

export type MortgageType = 'installment' | 'principal'

export interface MortgageRow {
  period: number
  payment: number
  principal: number
  interest: number
  remaining: number
}

export interface MortgageResult {
  rows: MortgageRow[]
  totalPayment: number
  totalInterest: number
}

export function mortgageSchedule(principal: number, annualPercent: number, months: number, type: MortgageType): MortgageResult {
  if (principal <= 0 || months <= 0) throw new Error('本金和期数必须大于 0')
  if (annualPercent < 0) throw new Error('利率不能为负')
  const periods = Math.round(months)
  const monthlyRate = annualPercent / 100 / 12
  const rows: MortgageRow[] = []
  let remaining = principal
  const fixedPrincipal = roundMoney(principal / periods)
  const annuity = monthlyRate === 0
    ? principal / periods
    : (principal * monthlyRate * (1 + monthlyRate) ** periods) / ((1 + monthlyRate) ** periods - 1)

  for (let period = 1; period <= periods; period += 1) {
    const interest = roundMoney(remaining * monthlyRate)
    const principalPart = period === periods
      ? roundMoney(remaining)
      : type === 'principal'
        ? fixedPrincipal
        : roundMoney(annuity - interest)
    const payment = roundMoney(principalPart + interest)
    remaining = roundMoney(remaining - principalPart)
    rows.push({
      period,
      payment,
      principal: principalPart,
      interest,
      remaining: Math.max(0, remaining),
    })
  }

  return {
    rows,
    totalPayment: roundMoney(rows.reduce((sum, row) => sum + row.payment, 0)),
    totalInterest: roundMoney(rows.reduce((sum, row) => sum + row.interest, 0)),
  }
}
