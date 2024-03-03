module.exports = {
    '2550505.com': {
        _name: '毛怪俱乐部',
        '.': [
            {
                title: '某位用户所发的帖子',
                docs: 'https://docs.rsshub.app/routes/social-media',
                source: ['/mgclub/getPostsByUid/:uid'],
                target: (params) => `/mgclub/getPostsByUid/${params.uid}}`,
            },
        ],
    },
};
