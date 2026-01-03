import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { SourceAdapter, SourceConfig, ContentItem } from '../../core';

interface GitHubEvent {
    id: string;
    type: string;
    actor: {
        login: string;
        display_login: string;
        avatar_url: string;
    };
    repo: {
        name: string;
        url: string;
    };
    payload: any;
    created_at: string;
}

interface GitHubRelease {
    id: number;
    tag_name: string;
    name: string;
    body: string;
    draft: boolean;
    prerelease: boolean;
    published_at: string;
    author: {
        login: string;
        avatar_url: string;
    };
    html_url: string;
}

@Injectable()
export class GitHubAdapter implements SourceAdapter {
    private readonly logger = new Logger(GitHubAdapter.name);
    public readonly type = 'github';
    private readonly API_BASE = 'https://api.github.com';

    constructor(private readonly httpService: HttpService) { }

    async validateConfig(config: SourceConfig): Promise<boolean> {
        return true;
    }

    async fetchContent(
        identifier: string, // Format: "owner/repo" or "owner/repo:releases"
        config: SourceConfig,
        lastPolledAt?: Date,
        userId?: string
    ): Promise<ContentItem[]> {
        try {
            const [repoPath, mode] = identifier.split(':');
            const token = (config as any)?.github_token;

            this.logger.log(`Fetching GitHub data for: ${repoPath} (mode: ${mode || 'events'})`);

            const headers: any = {
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'ksha/1.0',
            };
            if (token) {
                headers['Authorization'] = `token ${token}`;
            }

            if (mode === 'releases') {
                return this.fetchReleases(repoPath, headers, lastPolledAt);
            } else {
                return this.fetchEvents(repoPath, headers, lastPolledAt);
            }
        } catch (error) {
            this.logger.error(`Error fetching GitHub data ${identifier}: ${error.message}`);
            return [];
        }
    }

    private async fetchEvents(repoPath: string, headers: any, lastPolledAt?: Date): Promise<ContentItem[]> {
        const response = await firstValueFrom(
            this.httpService.get(`${this.API_BASE}/repos/${repoPath}/events`, {
                headers,
                params: { per_page: 30 },
                timeout: 15000,
            })
        );

        const events: GitHubEvent[] = response.data;
        const items: ContentItem[] = [];

        for (const event of events) {
            const postedAt = new Date(event.created_at);
            if (lastPolledAt && postedAt <= lastPolledAt) continue;

            const content = this.formatEvent(event);
            if (!content) continue;

            items.push({
                externalId: event.id,
                rawContent: content,
                postedAt,
                metadata: {
                    type: event.type,
                    actor: event.actor.login,
                    repo: event.repo.name,
                    payload: event.payload,
                },
            });
        }

        this.logger.log(`Processed ${items.length} GitHub events`);
        return items;
    }

    private async fetchReleases(repoPath: string, headers: any, lastPolledAt?: Date): Promise<ContentItem[]> {
        const response = await firstValueFrom(
            this.httpService.get(`${this.API_BASE}/repos/${repoPath}/releases`, {
                headers,
                params: { per_page: 10 },
                timeout: 15000,
            })
        );

        const releases: GitHubRelease[] = response.data;
        const items: ContentItem[] = [];

        for (const release of releases) {
            if (release.draft) continue;

            const postedAt = new Date(release.published_at);
            if (lastPolledAt && postedAt <= lastPolledAt) continue;

            const content = `🚀 **${release.name || release.tag_name}**\n\n${release.body || 'No release notes'}`;

            items.push({
                externalId: `release_${release.id}`,
                rawContent: content,
                postedAt,
                metadata: {
                    type: 'release',
                    tagName: release.tag_name,
                    name: release.name,
                    prerelease: release.prerelease,
                    author: release.author.login,
                    url: release.html_url,
                },
            });
        }

        this.logger.log(`Processed ${items.length} GitHub releases`);
        return items;
    }

    private formatEvent(event: GitHubEvent): string | null {
        const { type, actor, repo, payload } = event;

        switch (type) {
            case 'PushEvent': {
                const commits = payload.commits?.length || 0;
                const branch = payload.ref?.replace('refs/heads/', '') || 'unknown';
                return `📦 ${actor.login} pushed ${commits} commit(s) to ${repo.name}:${branch}`;
            }

            case 'PullRequestEvent':
                return `🔀 ${actor.login} ${payload.action} PR #${payload.pull_request?.number}: "${payload.pull_request?.title}" in ${repo.name}`;

            case 'IssuesEvent':
                return `🐛 ${actor.login} ${payload.action} issue #${payload.issue?.number}: "${payload.issue?.title}" in ${repo.name}`;

            case 'IssueCommentEvent':
                return `💬 ${actor.login} commented on issue #${payload.issue?.number} in ${repo.name}`;

            case 'CreateEvent':
                return `✨ ${actor.login} created ${payload.ref_type} "${payload.ref}" in ${repo.name}`;

            case 'ReleaseEvent':
                return `🚀 ${actor.login} ${payload.action} release "${payload.release?.tag_name}" in ${repo.name}`;

            case 'StarEvent':
                return `⭐ ${actor.login} starred ${repo.name}`;

            case 'ForkEvent':
                return `🍴 ${actor.login} forked ${repo.name}`;

            case 'WatchEvent':
                return `👀 ${actor.login} started watching ${repo.name}`;

            default:
                return null; // Skip unknown events
        }
    }
}
