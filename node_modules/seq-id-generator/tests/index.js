const path = '/tmp/seq-id-generator-test.txt'

const test = require('tape')
const fs = require('fs')

const seqIdGenerator = require('../index')

test('with no file', (assert) => {
  if (fs.existsSync(path)) fs.unlinkSync(path)

  seqIdGenerator(path)
    .then((generator) => generator.next())
    .then((id) => {
      assert.equal(id, 1)
      assert.end()
    })
    .catch((error) => assert.error(error))
})

test('with file', (assert) => {
  seqIdGenerator(path)
    .then((generator) => generator.next())
    .then((id) => {
      assert.equal(id, 2)
      assert.end()
    })
    .catch((error) => assert.error(error))
})

test('with file and formating', (assert) => {
  seqIdGenerator(path, (id) => `A-${id}`)
    .then((generator) => generator.next())
    .then((id) => {
      assert.equal(id, 'A-3')
      assert.end()
    })
    .catch((error) => assert.error(error))
})

test('with file and formating callback style', (assert) => {
  seqIdGenerator(path, (id) => `A-${id}`, (error, generator) => {
    if (error) return assert.error(error)
    generator.next((error, id) => {
      if (error) return assert.error(error)
      assert.equal(id, 'A-4')
      assert.end()
    })
  })
})

test('paralell test', (assert) => {
  seqIdGenerator(path, (id) => `A-${id}`, (error, generator) => {
    if (error) return assert.error(error)

    generator.next()
    generator.next()
    generator.next()
    generator.next()
    generator.next()

    generator.next((error, id) => {
      if (error) return assert.error(error)
      assert.equal(id, 'A-10')
      assert.end()
    })
  })
})
