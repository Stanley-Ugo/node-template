const validator = require('@app-core/validator');
const { throwAppError } = require('@app-core/errors');
const creatorCardRepository = require('@app/repository/creator-card');
const { CreatorCardMessages } = require('@app/messages');

const deleteSpec = `root {
  creator_reference string<minLength:1>
}`;

const parsedDeleteSpec = validator.parse(deleteSpec);

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
    access_code: doc.access_code || null,
    created: doc.created,
    updated: doc.updated,
    deleted: doc.deleted,
  };
}

async function deleteCreatorCard(serviceData) {
  const { slug, ...bodyData } = serviceData;
  const data = validator.validate(bodyData, parsedDeleteSpec);

  const card = await creatorCardRepository.findOne({ query: { slug, deleted: null } });

  if (!card) {
    throwAppError(CreatorCardMessages.CARD_NOT_FOUND, 'NF01');
  }

  if (card.creator_reference !== data.creator_reference) {
    throwAppError(CreatorCardMessages.INVALID_CREATOR_REFERENCE, 'INVALID_REQUEST');
  }

  const now = Date.now();
  await creatorCardRepository.updateOne({
    query: { _id: card._id },
    updateValues: { deleted: now },
  });

  const deletedCard = await creatorCardRepository.findOne({ query: { _id: card._id } });

  return formatCardResponse(deletedCard);
}

module.exports = deleteCreatorCard;
