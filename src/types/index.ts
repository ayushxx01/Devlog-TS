export interface CommitRow {
    repo: string,
    message: string,
    commit_time: Date
}

export interface Summaries {
    id: number,
    summary: string,
    created_at: Date,
}