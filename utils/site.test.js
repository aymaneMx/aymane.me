const test = require('node:test')
const assert = require('node:assert/strict')
const { SITE_ORIGIN, postUrl, isGa4MeasurementId } = require('./site')

test('site origin is the current domain', () => {
  assert.equal(SITE_ORIGIN, 'https://aymane.me')
  assert.equal(SITE_ORIGIN.includes('aymanemx.com'), false)
})

test('post canonical urls use aymane.me', () => {
  assert.equal(
    postUrl('graphql-in-django-an-overview'),
    'https://aymane.me/posts/graphql-in-django-an-overview'
  )
  assert.equal(postUrl('set-up-vue-app-running-on-vite').includes('aymanemx.com'), false)
})

test('only GA4 measurement ids are accepted', () => {
  assert.equal(isGa4MeasurementId('G-ABC123XYZ'), true)
  assert.equal(isGa4MeasurementId('UA-166756582-1'), false)
  assert.equal(isGa4MeasurementId(''), false)
  assert.equal(isGa4MeasurementId(undefined), false)
  assert.equal(isGa4MeasurementId('G-'), false)
  assert.equal(isGa4MeasurementId('g-abc123'), false)
})
