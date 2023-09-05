const got = require('@/utils/got');

module.exports = {
    getNicknameFromUID: (ctx, uid) => {
        const key = 'mgclub-username-from-uid-' + uid;
        return ctx.cache.tryGet(key, async () => {
            const { data: infoResponse } = await got(`https://2550505.com/user/user-info?uid=${uid}`, {});
            return infoResponse.info.nickname;
        });
    },
};
