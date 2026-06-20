const { createHandler } = require('@app-core/server');
const deleteCreatorCardService = require('@app/services/creator-card/delete');

module.exports = createHandler({
  path: '/creator-cards/:slug',
  method: 'delete',
  middlewares: [],
  async handler(rc, helpers) {
    const { slug } = rc.params;
    const payload = rc.body;

    const data = await deleteCreatorCardService({ slug, ...payload });

    return {
      status: helpers.http_statuses.HTTP_200_OK,
      message: 'Creator Card Deleted Successfully.',
      data,
    };
  },
});
