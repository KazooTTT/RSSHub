module.exports = (router) => {
    router.get('/mgclub/getPostsByUid/:uid', require('./getMgClubPostsByUid'));
};
