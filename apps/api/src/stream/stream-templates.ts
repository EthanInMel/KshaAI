export interface StreamTemplate {
    id: string;
    name: string;
    description: string;
    category: string;
    icon: string;
    promptTemplate: {
        triggerPrompt: string;
        notificationPrompt: string;
    };
    notificationConfig: {
        channel: string;
    };
}

export const STREAM_TEMPLATES: StreamTemplate[] = [
    {
        id: 'twitter-ai-monitor',
        name: 'AI News Monitor',
        description: 'Monitor Twitter/X for AI-related news and breakthroughs',
        category: 'Social Media',
        icon: 'sparkles',
        promptTemplate: {
            triggerPrompt: `Analyze this tweet: {{content}}

Does it contain significant AI/ML news, research breakthroughs, or important announcements?

Return TRUE if:
- Major AI research paper or breakthrough
- Important AI product launch
- Significant AI company news
- Notable AI regulation or policy

Return FALSE otherwise.`,
            notificationPrompt: `Summarize this AI news in 2-3 sentences:

{{content}}

Include:
- What happened
- Why it's important
- Key takeaways

URL: {{url}}`,
        },
        notificationConfig: {
            channel: 'telegram',
        },
    },
    {
        id: 'rss-tech-news',
        name: 'Tech News Digest',
        description: 'Curate and summarize tech news from RSS feeds',
        category: 'News',
        icon: 'newspaper',
        promptTemplate: {
            triggerPrompt: `Analyze this article: {{title}}

{{content}}

Is this a significant tech news story worth sharing?

Return TRUE if:
- Major product launches
- Industry-changing news
- Important acquisitions or funding
- Significant technical breakthroughs

Return FALSE for minor updates or promotional content.`,
            notificationPrompt: `Create a concise summary of this tech news:

Title: {{title}}
Content: {{content}}

Format:
📰 [Headline]
🔍 [2-sentence summary]
💡 [Key insight]

Link: {{url}}`,
        },
        notificationConfig: {
            channel: 'telegram',
        },
    },
    {
        id: 'twitter-sentiment',
        name: 'Brand Sentiment Monitor',
        description: 'Track brand mentions and sentiment on Twitter/X',
        category: 'Social Media',
        icon: 'heart',
        promptTemplate: {
            triggerPrompt: `Analyze the sentiment of this tweet about our brand:

{{content}}

Classify as:
- TRUE: Positive or neutral mention worth acknowledging
- FALSE: Negative mention or spam

Consider context, tone, and intent.`,
            notificationPrompt: `Brand Mention Alert:

Tweet: {{content}}

Sentiment: [Analyze and state: Positive/Neutral/Negative]
Recommended Action: [Suggest response strategy]

Link: {{url}}`,
        },
        notificationConfig: {
            channel: 'telegram',
        },
    },
    {
        id: 'rss-security-alerts',
        name: 'Security Alerts',
        description: 'Monitor security vulnerabilities and CVEs',
        category: 'Security',
        icon: 'shield',
        promptTemplate: {
            triggerPrompt: `Analyze this security advisory:

{{title}}
{{content}}

Is this a critical security issue requiring immediate attention?

Return TRUE if:
- Critical or High severity CVE
- Zero-day vulnerability
- Widespread impact
- Affects our tech stack

Return FALSE for low-priority or unrelated issues.`,
            notificationPrompt: `🚨 SECURITY ALERT

Title: {{title}}

Summary: [Provide 2-3 sentence summary]
Severity: [Extract severity level]
Affected: [List affected systems/software]
Action Required: [Immediate steps]

Details: {{url}}`,
        },
        notificationConfig: {
            channel: 'telegram',
        },
    },
    {
        id: 'twitter-competitor',
        name: 'Competitor Tracking',
        description: 'Monitor competitor announcements and activities',
        category: 'Business Intelligence',
        icon: 'target',
        promptTemplate: {
            triggerPrompt: `Analyze this tweet from a competitor:

{{content}}

Is this a significant competitive move?

Return TRUE if:
- Product launch or major update
- Pricing changes
- Partnership announcements
- Market expansion
- Strategic pivot

Return FALSE for routine updates.`,
            notificationPrompt: `🎯 Competitor Activity

Company: {{source}}
Update: {{content}}

Analysis:
- What they're doing: [Brief description]
- Potential impact: [How this affects us]
- Recommended response: [Strategic suggestion]

Link: {{url}}`,
        },
        notificationConfig: {
            channel: 'telegram',
        },
    },
    {
        id: 'rss-research-papers',
        name: 'Research Paper Digest',
        description: 'Curate relevant academic papers and research',
        category: 'Research',
        icon: 'book-open',
        promptTemplate: {
            triggerPrompt: `Evaluate this research paper:

Title: {{title}}
Abstract: {{content}}

Is this relevant to our research interests in [AI/ML/your field]?

Return TRUE if:
- Novel methodology or approach
- Significant results
- Relevant to our domain
- High-impact venue

Return FALSE for incremental work or unrelated topics.`,
            notificationPrompt: `📚 New Research Paper

Title: {{title}}

Key Contributions:
[Summarize main findings in 2-3 points]

Relevance:
[Explain why this matters for our work]

Paper: {{url}}`,
        },
        notificationConfig: {
            channel: 'telegram',
        },
    },
];
