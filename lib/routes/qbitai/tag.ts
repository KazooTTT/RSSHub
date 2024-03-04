// @ts-nocheck
import parser from '@/utils/rss-parser';

import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const tag = ctx.req.param('tag');
    const link = encodeURI(`https://www.qbitai.com/tag/${tag}/feed`);
    const feed = await parser.parseURL(link);

    const items = feed.items.map((item) => ({
        title: item.title,
        pubDate: parseDate(item.pubDate),
        link: item.link,
        author: '量子位',
        category: item.categories,
        description: item['content:encoded'],
    }));

    ctx.set('data', {
        // 源标题
        title: `量子位-${tag}`,
        // 源链接
        link: `https://www.qbitai.com/tag/${tag}`,
        // 源文章
        item: items,
    });
};
