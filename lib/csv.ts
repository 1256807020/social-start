/**
 * 轻量 CSV 互转（进阶能力，独立于核心 CRUD）。
 * 用于集合数据的批量导入 / 导出：数组 <-> CSV 文本。
 * 支持引号包裹字段、字段内逗号/引号（"" 转义）、CRLF/LF 换行。
 */

function csvEscape(v: any): string {
  if (v === null || v === undefined) return ''
  let s: string
  if (typeof v === 'object') s = JSON.stringify(v)
  else s = String(v)
  if (/[",\n\r]/.test(s)) return '"' + s.replace(/"/g, '""') + '"'
  return s
}

/** 记录数组 -> CSV 文本（表头取所有键的并集，按首条记录顺序） */
export function arrayToCsv(records: any[]): string {
  if (!Array.isArray(records) || !records.length) return ''
  const keys: string[] = []
  for (const r of records) {
    if (r && typeof r === 'object') {
      for (const k of Object.keys(r)) if (!keys.includes(k)) keys.push(k)
    }
  }
  const lines = [keys.map(csvEscape).join(',')]
  for (const r of records) {
    lines.push(keys.map((k) => csvEscape(r ? r[k] : '')).join(','))
  }
  return lines.join('\r\n')
}

/** CSV 文本 -> 记录数组（首行为表头；`id` 列数值化，其余保持字符串） */
export function csvToArray(text: string): any[] {
  const rows = parseCsvRows(text)
  if (!rows.length) return []
  const header = rows[0]
  const out: any[] = []
  for (let i = 1; i < rows.length; i++) {
    const cells = rows[i]
    if (cells.length === 1 && cells[0] === '') continue
    const obj: any = {}
    header.forEach((h, idx) => {
      let v: any = cells[idx] ?? ''
      if (h === 'id' && v !== '' && !isNaN(Number(v))) v = Number(v)
      obj[h] = v
    })
    out.push(obj)
  }
  return out
}

/** CSV 文本解析为二维数组（状态机，处理引号与转义） */
function parseCsvRows(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false
  const src = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  for (let i = 0; i < src.length; i++) {
    const c = src[i]
    if (inQuotes) {
      if (c === '"') {
        if (src[i + 1] === '"') {
          field += '"'
          i++
        } else inQuotes = false
      } else field += c
    } else {
      if (c === '"') inQuotes = true
      else if (c === ',') {
        row.push(field)
        field = ''
      } else if (c === '\n') {
        row.push(field)
        rows.push(row)
        row = []
        field = ''
      } else field += c
    }
  }
  row.push(field)
  rows.push(row)
  return rows
}
