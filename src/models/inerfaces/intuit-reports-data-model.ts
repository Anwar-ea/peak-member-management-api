export type QuickBooksReport = Root[]

export interface Root {
  Header?: Header
  Rows?: Rows
  Summary: Summary
  type: string
  group: string
}

export interface Header {
  ColData: ColDaum[]
}

export interface ColDaum {
  value: string,
  id?: string
}

export interface Rows {
  Row: Row[]
}

export interface Row {
  ColData?: ColDaum[]
  type: string
  group?: string
  Header?: Header
  Rows?: Rows
  Summary?: Summary
}

export interface Summary {
  ColData: ColDaum[]
}

