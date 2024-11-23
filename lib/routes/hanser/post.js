import got from '@/utils/got';
import cache from '@/utils/cache';

const paths = {
    getUserInfo: (uid) => `https://2550505.com/user/user-info?uid=${uid}`,
    getUserPostList: (uid) => `https://2550505.com/post/user/list?page=1&pageSize=40&uid=${uid}`,
    getPostContent: (postId) => `https://2550505.com/post/detail/${postId}`,
    spaceUrl: (uid) => `https://2550505.com/space/${uid}`,
};

const getNicknameFromUID = (uid) => {
    const url = paths.getUserInfo(uid);
    return cache.tryGet(url, async () => {
        const { data: infoResponse } = await got(url, {});
        return infoResponse.info.nickname;
    });
};

export default async (ctx) => {
    const uid = ctx.req.param('uid');
    const nickname = await getNicknameFromUID(uid);
    const { data: listResponse } = await got({
        method: 'get',
        url: paths.getUserPostList(uid),
    });
    const list = listResponse.list;

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(paths.getPostContent(item.id), async () => {
                const { data: response } = await got(paths.getPostContent(item.id));
                const postInfo = `发帖时间：${item.post_time} 回复数：${item.replies} 点赞数：${item.likes} ${item.content}`;
                return {
                    ...item,
                    description: `<div><div>${postInfo}</div><div>${response.content}</div></div>`,
                    title: item.title,
                    pubDate: item.post_time,
                    guid: paths.getPostContent(item.id),
                    link: paths.getPostContent(item.id),
                };
            })
        )
    );

    ctx.set('data', {
        title: `${nickname}的发帖动态`,
        description: `feedId:76245438397618182+userId:62156866798228480`,
        link: paths.spaceUrl(uid),
        item: items,
    });
};
