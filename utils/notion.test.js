const test = require('node:test')
const assert = require('node:assert/strict')
const { toUuid, mapRow } = require('./notion')

const schema = {
  '0#}p': { name: 'created_at', type: 'date' },
  'IWg]': { name: 'description', type: 'text' },
  MpSo: { name: 'slug', type: 'text' },
  'u\\k=': { name: 'thumbnail', type: 'file' },
  'v<K]': { name: 'tags', type: 'multi_select' },
  'ysX^': { name: 'public', type: 'checkbox' },
  title: { name: 'title', type: 'title' }
}

test('notion ids are normalized to uuids', () => {
  assert.equal(toUuid('ceef6f1a895a46b2a0e4a87b41405547'), 'ceef6f1a-895a-46b2-a0e4-a87b41405547')
  assert.equal(toUuid('ceef6f1a-895a-46b2-a0e4-a87b41405547'), 'ceef6f1a-895a-46b2-a0e4-a87b41405547')
  assert.equal(toUuid('not-a-page'), 'not-a-page')
})

test('a collection row maps to the blog post shape', () => {
  const row = mapRow({
    value: {
      value: {
        id: '985f575f-ff8e-4026-ac18-1d6765924786',
        properties: {
          '0#}p': [['‣', [['d', { start_date: '2021-01-03' }]]]],
          'IWg]': [['A vue and django post']],
          MpSo: [['using-vuejs-alongside-django-template']],
          'u\\k=': [['vue-django.webp', [['a', 'https://s3-us-west-2.amazonaws.com/secure.notion-static.com/file.webp']]]],
          'v<K]': [['django,vuejs,axios']],
          'ysX^': [['Yes']],
          title: [['Using Vue.js alongside Django Template']]
        }
      }
    }
  }, schema)

  assert.equal(row.created_at, '2021-01-03')
  assert.equal(row.slug, 'using-vuejs-alongside-django-template')
  assert.equal(row.public, true)
  assert.deepEqual(row.tags, ['django', 'vuejs', 'axios'])
  assert.equal(row.thumbnail[0].name, 'vue-django.webp')
  assert.equal(row.thumbnail[0].url.includes('notion.so/image/'), true)
  assert.equal(row.thumbnail[0].rawUrl.includes('file.webp'), true)
})

test('an empty checkbox is not public', () => {
  const row = mapRow({
    value: {
      id: 'page',
      properties: { 'ysX^': [['No']], title: [['Hidden']] }
    }
  }, schema)
  assert.equal(row.public, false)
  assert.equal(row.slug, undefined)
})
