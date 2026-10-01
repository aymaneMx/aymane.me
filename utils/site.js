const SITE_ORIGIN = 'https://aymane.me'

function postUrl (slug) {
  return `${SITE_ORIGIN}/posts/${slug}`
}

function isGa4MeasurementId (id) {
  return typeof id === 'string' && /^G-[A-Z0-9]+$/.test(id)
}

module.exports = {
  SITE_ORIGIN,
  postUrl,
  isGa4MeasurementId
}
