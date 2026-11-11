export interface DiffOp<T> {
  type: 'equal' | 'insert' | 'delete'
  value: T
}

export interface LineDiff {
  type: 'equal' | 'insert' | 'delete' | 'change'
  left: string
  right: string
  leftNumber: number | null
  rightNumber: number | null
  wordDiff: DiffOp<string>[]
}

const MAX_LINES = 1500

export function diffSequence<T>(left: T[], right: T[], equals: (a: T, b: T) => boolean = (a, b) => a === b): DiffOp<T>[] {
  const n = left.length
  const m = right.length
  const scores: number[][] = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0))
  for (let i = n - 1; i >= 0; i -= 1) {
    for (let j = m - 1; j >= 0; j -= 1) {
      scores[i][j] = equals(left[i], right[j])
        ? scores[i + 1][j + 1] + 1
        : Math.max(scores[i + 1][j], scores[i][j + 1])
    }
  }
  const ops: DiffOp<T>[] = []
  let i = 0
  let j = 0
  while (i < n && j < m) {
    if (equals(left[i], right[j])) {
      ops.push({ type: 'equal', value: left[i] })
      i += 1
      j += 1
    } else if (scores[i + 1][j] >= scores[i][j + 1]) {
      ops.push({ type: 'delete', value: left[i] })
      i += 1
    } else {
      ops.push({ type: 'insert', value: right[j] })
      j += 1
    }
  }
  while (i < n) ops.push({ type: 'delete', value: left[i++] })
  while (j < m) ops.push({ type: 'insert', value: right[j++] })
  return ops
}

export function tokenizeWords(value: string): string[] {
  return value.split(/(\s+|[\u4e00-\u9fff])/).filter((token) => token !== '')
}

export function diffWords(left: string, right: string): DiffOp<string>[] {
  return diffSequence(tokenizeWords(left), tokenizeWords(right))
}

export function diffLines(left: string, right: string): LineDiff[] {
  const leftLines = left.replace(/\r\n/g, '\n').split('\n')
  const rightLines = right.replace(/\r\n/g, '\n').split('\n')
  if (leftLines.length > MAX_LINES || rightLines.length > MAX_LINES) {
    throw new Error(`单侧最多比较 ${MAX_LINES} 行`)
  }
  const ops = diffSequence(leftLines, rightLines)
  const rows: LineDiff[] = []
  let leftNumber = 1
  let rightNumber = 1
  for (let index = 0; index < ops.length; index += 1) {
    const op = ops[index]
    if (op.type === 'equal') {
      rows.push({ type: 'equal', left: op.value, right: op.value, leftNumber: leftNumber++, rightNumber: rightNumber++, wordDiff: [] })
      continue
    }
    if (op.type === 'insert') {
      rows.push({ type: 'insert', left: '', right: op.value, leftNumber: null, rightNumber: rightNumber++, wordDiff: [] })
      continue
    }
    const deleted: string[] = []
    const inserted: string[] = []
    while (index < ops.length && ops[index].type === 'delete') deleted.push(ops[index++].value)
    while (index < ops.length && ops[index].type === 'insert') inserted.push(ops[index++].value)
    index -= 1
    const count = Math.max(deleted.length, inserted.length)
    for (let pair = 0; pair < count; pair += 1) {
      const removed = deleted[pair]
      const added = inserted[pair]
      if (removed !== undefined && added !== undefined) {
        rows.push({
          type: 'change',
          left: removed,
          right: added,
          leftNumber: leftNumber++,
          rightNumber: rightNumber++,
          wordDiff: diffWords(removed, added),
        })
      } else if (removed !== undefined) {
        rows.push({ type: 'delete', left: removed, right: '', leftNumber: leftNumber++, rightNumber: null, wordDiff: [] })
      } else {
        rows.push({ type: 'insert', left: '', right: added, leftNumber: null, rightNumber: rightNumber++, wordDiff: [] })
      }
    }
  }
  return rows
}

export function diffStats(rows: LineDiff[]): { added: number; removed: number; changed: number } {
  return {
    added: rows.filter((row) => row.type === 'insert').length,
    removed: rows.filter((row) => row.type === 'delete').length,
    changed: rows.filter((row) => row.type === 'change').length,
  }
}
