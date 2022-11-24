seq-id-generator
====
generates an sequence id (1, 2, 3, 4...), based on a file

[![bitHound Overall Score](https://www.bithound.io/github/stockulus/seq-id-generator/badges/score.svg)](https://www.bithound.io/github/stockulus/seq-id-generator) [![npm Package](https://img.shields.io/npm/dm/seq-id-generator.svg)](https://www.npmjs.com/package/seq-id-generator) [![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/) [![license](https://img.shields.io/npm/l/seq-id-generator.svg?maxAge=2592000)](https://opensource.org/licenses/MIT)
### Usage

```bash
npm i seq-id-generator
```

```js
const path = '/tmp/file.txt'
const seqIdGenerator = require('seq-id-generator')

seqIdGenerator(path)
  .then((generator) => generator.next())
  .then((id) => console.log(id))
  .catch((error) => console.error(error))

// with formating Function
seqIdGenerator(path, (id) => `A-${id}`)
  .then((generator) => generator.next())
  .then((id) => console.log(id))
  .catch((error) => console.error(error))

// or callback style
seqIdGenerator(path, null, (error, generator) => {
  if (error) return console.error(error)
  generator.next((error, id) => {
    if (error) return console.error(error)
    console.log(id)
  })
})

```

---
[![Twitter URL](https://img.shields.io/twitter/url/http/shields.io.svg?style=social&maxAge=2592000)](https://twitter.com/stockulus)
