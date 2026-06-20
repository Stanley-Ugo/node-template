const validator = require('@app-core/validator');
const { throwAppError } = require('@app-core/errors');
const creatorCardRepository = require('@app/repository/creator-card');
const { CreatorCardMessages } = require('@app/messages');

const createSpec = `root {
  title string<minLength:3|maxLength:100>
  description? string<maxLength:500>
  slug? string<minLength:5|maxLength:50>
  creator_reference string<minLength:20|maxLength:20>
  status string(draft|published)
  access_type? string(public|private)
  access_code? string<minLength:6|maxLength:6>
  links[]? {
    title string<minLength:1|maxLength:100>
    url string<maxLength:200>
  }
  service_rates? {
    currency string(NGN|USD|GBP|GHS)
    rates[] {
      name string<minLength:3|maxLength:100>
      description? string<maxLength:250>
      amount number<min:1>
    }
  }
}`;

const parsedCreateSpec = validator.parse(createSpec);

function generateSlugFromTitle(title) {
  return title
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-_]/g, '')
    .slice(0, 50);
}

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
    deleted: doc.deleted || null,
  };
}

async function createCreatorCard(serviceData) {
  const data = validator.validate(serviceData, parsedCreateSpec);

  const accessType = data.access_type || 'public';

  if (accessType === 'private' && !data.access_code) {
    throwAppError(CreatorCardMessages.ACCESS_CODE_REQUIRED, 'AC01');
  }

  if (accessType === 'public' && data.access_code) {
    throwAppError(CreatorCardMessages.ACCESS_CODE_NOT_ALLOWED, 'AC05');
  }

  let { slug } = data;
  if (!slug) {
    slug = generateSlugFromTitle(data.title);
    if (slug.length < 5) {
      slug = slug.padEnd(5, '0');
    }
  }

  const existingCard = await creatorCardRepository.findOne({ query: { slug } });
  if (existingCard) {
    throwAppError(CreatorCardMessages.SLUG_TAKEN, 'SL02');
  }

  const card = await creatorCardRepository.create({
    title: data.title,
    description: data.description || null,
    slug,
    creator_reference: data.creator_reference,
    links: data.links || [],
    service_rates: data.service_rates || null,
    status: data.status,
    access_type: accessType,
    access_code: data.access_code || null,
    deleted: null,
  });

  return formatCardResponse(card);
}

module.exports = createCreatorCard;
