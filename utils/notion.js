const https = require('https')

const BLOG_TABLE_ID = 'ceef6f1a895a46b2a0e4a87b41405547'

function toUuid (id) {
  const hex = String(id || '').replace(/-/g, '')
  if (hex.length !== 32) return String(id || '')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

function unwrap (node) {
  if (!node || typeof node !== 'object') return node
  const inner = node.value
  if (inner && typeof inner === 'object' && inner.value && typeof inner.value === 'object' && inner.value.id) {
    return inner.value
  }
  if (inner && typeof inner === 'object' && inner.id) return inner
  return node
}

function plainText (property) {
  if (!Array.isArray(property)) return ''
  return property.map((part) => (Array.isArray(part) ? part[0] : '')).join('')
}

function dateValue (property) {
  const decorations = property && property[0] && property[0][1]
  if (!Array.isArray(decorations)) return ''
  const date = decorations.find((item) => item[0] === 'd')
  return (date && date[1] && date[1].start_date) || ''
}

function fileValue (property, blockId) {
  if (!Array.isArray(property)) return []
  return property.map((item) => {
    const name = item[0]
    const decorations = item[1] || []
    const link = decorations.find((entry) => entry[0] === 'a')
    const rawUrl = link ? link[1] : ''
    const url = rawUrl
      ? `https://www.notion.so/image/${encodeURIComponent(rawUrl)}?table=block&id=${blockId}&cache=v2`
      : ''
    return { name, url, rawUrl }
  }).filter((file) => file.rawUrl)
}

function readProperty (property, type, blockId) {
  if (type === 'date') return dateValue(property)
  if (type === 'checkbox') return plainText(property) === 'Yes'
  if (type === 'multi_select') {
    return plainText(property).split(',').map((tag) => tag.trim()).filter(Boolean)
  }
  if (type === 'file') return fileValue(property, blockId)
  return plainText(property)
}

function mapRow (blockNode, schema) {
  const value = unwrap(blockNode)
  const row = { id: value.id }
  const properties = value.properties || {}
  Object.keys(schema || {}).forEach((key) => {
    const definition = schema[key]
    if (!properties[key] || !definition || !definition.name) return
    row[definition.name] = readProperty(properties[key], definition.type, value.id)
  })
  return row
}

function postJson (path, payload) {
  const body = JSON.stringify(payload)
  return new Promise((resolve, reject) => {
    const request = https.request({
      hostname: 'www.notion.so',
      path,
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'content-length': Buffer.byteLength(body),
        'user-agent': 'Mozilla/5.0'
      }
    }, (response) => {
      const chunks = []
      response.on('data', (chunk) => chunks.push(chunk))
      response.on('end', () => {
        const text = Buffer.concat(chunks).toString('utf8')
        if (response.statusCode < 200 || response.statusCode >= 300 || text.startsWith('<')) {
          reject(new Error(`Notion request failed (${response.statusCode})`))
          return
        }
        resolve(JSON.parse(text))
      })
    })
    request.on('error', reject)
    request.write(body)
    request.end()
  })
}

async function loadPageChunk (pageId) {
  const blocks = {}
  const collections = {}
  let cursor = { stack: [] }
  for (let chunkNumber = 0; chunkNumber < 20; chunkNumber += 1) {
    const data = await postJson('/api/v3/loadPageChunk', {
      page: { id: pageId },
      limit: 100,
      cursor,
      chunkNumber,
      verticalColumns: false
    })
    Object.assign(blocks, (data.recordMap && data.recordMap.block) || {})
    Object.assign(collections, (data.recordMap && data.recordMap.collection) || {})
    cursor = data.cursor || { stack: [] }
    if (!cursor.stack || cursor.stack.length === 0) break
  }
  return { blocks, collections }
}

function toBlockMap (blocks, pageId) {
  const blockMap = {}
  const orderedIds = Object.keys(blocks)
  if (blocks[pageId]) orderedIds.splice(orderedIds.indexOf(pageId), 1)
  const ids = blocks[pageId] ? [pageId].concat(orderedIds.filter((id) => id !== pageId)) : orderedIds
  ids.forEach((id) => {
    const value = unwrap(blocks[id])
    if (value && value.id) blockMap[id] = { value }
  })
  return blockMap
}

async function getPageBlocks (pageId) {
  const id = toUuid(pageId)
  const { blocks } = await loadPageChunk(id)
  return toBlockMap(blocks, id)
}

async function getPageTable (pageId = BLOG_TABLE_ID) {
  const id = toUuid(pageId)
  const { blocks, collections } = await loadPageChunk(id)
  const pageBlock = unwrap(blocks[id])
  if (!pageBlock || !pageBlock.collection_id) return []

  const collection = unwrap(collections[pageBlock.collection_id])
  const schema = (collection && collection.schema) || {}
  const spaceId = pageBlock.space_id
  const viewId = pageBlock.view_ids && pageBlock.view_ids[0]
  const queried = await postJson('/api/v3/queryCollection?src=initial_load', {
    source: { type: 'collection', id: pageBlock.collection_id, spaceId },
    collectionView: { id: viewId, spaceId },
    loader: {
      reducers: {
        collection_group_results: { type: 'results', limit: 100 }
      },
      sort: [],
      searchQuery: '',
      userTimeZone: 'Europe/Paris'
    }
  })
  const blockIds = queried.result.reducerResults.collection_group_results.blockIds || []
  return blockIds
    .map((blockId) => mapRow(queried.recordMap.block[blockId], schema))
    .filter((row) => row.slug)
}

module.exports = {
  BLOG_TABLE_ID,
  toUuid,
  mapRow,
  getPageBlocks,
  getPageTable
}
