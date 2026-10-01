function unavailable () {
  return Promise.reject(new Error('Notion content is fetched when the site is generated'))
}

module.exports = {
  getPageBlocks: unavailable,
  getPageTable: unavailable
}
