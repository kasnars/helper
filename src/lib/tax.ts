export interface TaxBracketResult {
  rate: number
  deduction: number
  tax: number
}

export interface TaxInput {
  monthlySalary: number
  months: number
  monthlyInsurance: number
  monthlySpecial: number
  monthlyOther: number
}

export interface TaxMonth {
  month: number
  cumulativeIncome: number
  cumulativeDeduction: number
  taxable: number
  rate: number
  cumulativeTax: number
  taxThisMonth: number
}

const BRACKETS = [
  { up: 36000, rate: 0.03, deduction: 0 },
  { up: 144000, rate: 0.1, deduction: 2520 },
  { up: 300000, rate: 0.2, deduction: 16920 },
  { up: 420000, rate: 0.25, deduction: 31920 },
  { up: 660000, rate: 0.3, deduction: 52920 },
  { up: 960000, rate: 0.35, deduction: 85920 },
  { up: Number.POSITIVE_INFINITY, rate: 0.45, deduction: 181920 },
]

export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

export function taxOnTaxable(taxable: number): TaxBracketResult {
  if (taxable <= 0) return { rate: 0, deduction: 0, tax: 0 }
  const bracket = BRACKETS.find((item) => taxable <= item.up)
  if (!bracket) return { rate: 0, deduction: 0, tax: 0 }
  return {
    rate: bracket.rate,
    deduction: bracket.deduction,
    tax: roundMoney(taxable * bracket.rate - bracket.deduction),
  }
}

export function withholdingSchedule(input: TaxInput): { rows: TaxMonth[]; current: TaxMonth } {
  if (input.monthlySalary < 0 || input.monthlyInsurance < 0 || input.monthlySpecial < 0 || input.monthlyOther < 0) {
    throw new Error('金额不能为负数')
  }
  const months = Math.min(12, Math.max(1, Math.floor(input.months || 1)))
  const rows: TaxMonth[] = []
  let previous = 0
  for (let month = 1; month <= 12; month += 1) {
    const cumulativeIncome = input.monthlySalary * month
    const cumulativeDeduction = (5000 + input.monthlyInsurance + input.monthlySpecial + input.monthlyOther) * month
    const taxable = Math.max(0, cumulativeIncome - cumulativeDeduction)
    const result = taxOnTaxable(taxable)
    const taxThisMonth = roundMoney(result.tax - previous)
    rows.push({
      month,
      cumulativeIncome,
      cumulativeDeduction,
      taxable,
      rate: result.rate,
      cumulativeTax: result.tax,
      taxThisMonth,
    })
    previous = result.tax
  }
  return { rows, current: rows[months - 1] }
}
