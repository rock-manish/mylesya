'use strict'

const polygoat = require('polygoat')
const fs = require('fs')

/**
 * Factory function for the generator
 * @param {string} path
 * @param {function} [formatFunc] - optional id formating
 * @param {function} [callback]
 * @return {Promise} if uses without callback
 */
module.exports = function seqIdGenerator (path, formatFunc, callback) {
  const generator = id => {
    return {
      /**
      @param {function} [callback]
      @return {Promise} if uses without callback
      */
      next (callback) {
        return polygoat(done => {
          sequence(cb => {
            id++
            fs.writeFile(path, id, (error) => {
              if (error) return cb(error)
              cb(null, formatFunc ? formatFunc(id) : id)
            })
          }, done)
        }, callback)
      }
    }
  }

  return polygoat((done) => {
    fs.readFile(path, (error, data) => {
      const lastId = error ? 0 : parseInt(data, 10)
      done(null, generator(lastId))
    })
  }, callback)
}

const queue = []
let isRunning = false
const sequence = (func, callback) => {
  const run = () => {
    if (isRunning || queue.length === 0) return

    isRunning = true
    const task = queue.shift()
    process.nextTick(() => {
      task.func((error, result) => {
        task.callback(error, result)
        isRunning = false
        run()
      })
    })
  }

  queue.push({func, callback})
  run()
}
