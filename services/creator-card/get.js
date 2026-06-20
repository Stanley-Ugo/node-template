const { throwAppError } = require('@app-core/errors');
const creatorCardRepository = require('@app/repository/creator-card');
const { CreatorCardMessages } = require('@app/messages');

function formatCardResponse(doc) {
  return {
    id: doc._id,
    title: doc.title,
    description: doc.description || null,
    slug: doc.slug,
    creator_reference: doc.creator_reference,
    links: doc.links || [],
    service_rates: doc.service_rates || null,
    status: doc.status,
    access_type: doc.access_type,
    created: doc.created,
    updated: doc.updated,
    deleted: doc.deleted || null,
  };
}

async function getCreatorCard(serviceData) {
  // eslint-disable-next-line camelcase
  const { slug, access_code } = serviceData;

  const card = await creatorCardRepository.findOne({ query: { slug, deleted: null } });

  if (!card) {
    throwAppError(CreatorCardMessages.CARD_NOT_FOUND, 'NF01');
  }

  if (card.status === 'draft') {
    throwAppError(CreatorCardMessages.CARD_NOT_FOUND, 'NF02');
  }

  if (card.access_type === 'private') {
    // eslint-disable-next-line camelcase
    if (!access_code) {
      throwAppError(CreatorCardMessages.ACCESS_CODE_MISSING, 'AC03');
    }

    // eslint-disable-next-line camelcase
    if (access_code !== card.access_code) {
      throwAppError(CreatorCardMessages.INVALID_ACCESS_CODE, 'AC04');
    }
  }

  return formatCardResponse(card);
}

module.exports = getCreatorCard;
