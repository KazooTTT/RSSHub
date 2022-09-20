const got = require('@/utils/got');
const cache = require('./cache');

module.exports = async (ctx) => {
    const uid = ctx.params.uid;

    const nickname = await cache.getNicknameFromUID(ctx, uid);

    const listResponse = await got({
        method: 'get',
        url: `https://2550505.com/post/user/list?page=1&pageSize=40&uid=${uid}`,
    });
    const list = listResponse.data.list;

    ctx.state.data = {
        title: `${nickname}的发帖动态`,
        link: `https://2550505.com/space/${uid}`,
        item: list.map((item) => ({
            title: item.title,
            description: `回复数:${item.replies} 点赞数:${item.likes} ${item.content}`,
            pubDate: item.post_time,
            link: `https://2550505.com/postDetails/${item.id}`,
        })),
    };
};
