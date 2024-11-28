import { sqliteTable, text, SQLiteBlobJson } from 'drizzle-orm/sqlite-core'

export const BOARDS = sqliteTable('boards', {
    board_id: text('board_id').primaryKey(),
    data: text("data", {mode:"json"})
})
