const { createHandler } = require('@app-core/server');
const getCreatorCardService = require('@app/services/creator-card/get');

module.exports = createHandler({
  path: '/creator-cards/:slug',
  method: 'get',
  middlewares: [],
  async handler(rc, helpers) {
    const { slug } = rc.params;
    // eslint-disable-next-line camelcase
    const { access_code } = rc.query;

    // eslint-disable-next-line camelcase
    const data = await getCreatorCardService({ slug, access_code });

    return {
      status: helpers.http_statuses.HTTP_200_OK,
      message: 'Creator Card Retrieved Successfully.',
      data,
    };
  },
});
