module.exports = {
    '2550505.com': {
        _name: '毛怪俱乐部',
        '.': [
            {
                title: '某位用户所发的帖子',
                docs: 'https://github.com/KazooTTT/RSSHub/blob/master/DIY.md',
                source: ['/mgclub/getPostsByUid/:uid'],
                target: (params) => `/mgclub/getPostsByUid/${params.uid}}`,
            },
        ],
    },
};
