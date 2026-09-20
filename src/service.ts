import Pool from './db';
import {CommitRow} from './types';


export async function saveCommit(
    repo: string,
    commitHash: string,
    message: string,
    commitTime: Date
): Promise<void> {
    await Pool.query(
        `INSERT INTO commits
        (repo, commit_hash, message, commit_time)
        VALUES ($1, $2, $3, $4)`,
        [repo, commitHash, message, commitTime]
    );
}

export async function getTodayCommits(): Promise<CommitRow[]> {
    const result = await Pool.query<CommitRow>(
        'SELECT repo,message,commit_time FROM commits WHERE commit_time >= CURRENT_DATE ORDER BY commit_time DESC'
    );

    return result.rows;
}
export function buildSummary(commits: CommitRow[]): string {
    const grouped : Record<string, string[]> = {};

    commits.forEach(commit => {
        if (!grouped[commit.repo]) {
            grouped[commit.repo] = [];
        }

        grouped[commit.repo].push(commit.message);
    });

    let result = '';

    for (const [repo, messages] of Object.entries(grouped)) {
        result += `Repository: ${repo}\n`;

        messages.forEach(msg => {
            result += `- ${msg}\n`;
        });

        result += '\n';
    }

    return result;
}

export async function fetchDailySummary(): Promise<string> {
    const result = await getTodayCommits();
    const summary = buildSummary(result);
    return summary;

}


