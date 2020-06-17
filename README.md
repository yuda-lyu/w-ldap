# w-ldap
A LDAP tool for windows.

![language](https://img.shields.io/badge/language-JavaScript-orange.svg) 
[![npm version](http://img.shields.io/npm/v/w-ldap.svg?style=flat)](https://npmjs.org/package/w-ldap) 
[![Build Status](https://travis-ci.org/yuda-lyu/w-ldap.svg?branch=master)](https://travis-ci.org/yuda-lyu/w-ldap) 
[![license](https://img.shields.io/npm/l/w-ldap.svg?style=flat)](https://npmjs.org/package/w-ldap) 
[![gzip file size](http://img.badgesize.io/yuda-lyu/w-ldap/master/dist/w-ldap.umd.js.svg?compression=gzip)](https://github.com/yuda-lyu/w-ldap)
[![npm download](https://img.shields.io/npm/dt/w-ldap.svg)](https://npmjs.org/package/w-ldap) 
[![jsdelivr download](https://img.shields.io/jsdelivr/npm/hm/w-ldap.svg)](https://www.jsdelivr.com/package/npm/w-ldap)

## Documentation
To view documentation or get support, visit [docs](https://yuda-lyu.github.io/w-ldap/mZip.html).

## Installation
### Using npm(ES6 module):
> **Note:** `w-ldap` depends on `archiver`, `archiver-zip-encrypted` and `unzipper`.

```alias
npm i w-ldap
```

#### Example:
> **Link:** [[dev source code](https://github.com/yuda-lyu/w-ldap/blob/master/scla.mjs)]
```alias
import wz from 'w-ldap'

let fpUnzip = './testData/outputZip'
let fpUnzipExtract = fpUnzip + '/extract'

let fpSrc1 = './testData/input/file1(中文).txt'
let fpZip1 = fpUnzip + '/test1.zip'

let fpSrc2 = './testData/input/folder1'
let fpZip2 = fpUnzip + '/test2.zip'
let fpZip2PW = fpUnzip + '/test2PW.zip'
let pw = 'abc'

async function test() {

    //zipFile
    console.log('zipFile before')
    console.log('zipFile', await wz.mZip.zipFile(fpSrc1, fpZip1))
    console.log('zipFile after')

    //zipFolder
    console.log('zipFolder before')
    console.log('zipFolder', await wz.mZip.zipFolder(fpSrc2, fpZip2))
    console.log('zipFolder after')

    //zipFolder with password
    console.log('zipFolder with password before')
    console.log('zipFolder with password', await wz.mZip.zipFolder(fpSrc2, fpZip2PW, { pw }))
    console.log('zipFolder with password after')

    //unzip
    console.log('unzip1 before')
    console.log('unzip1', await wz.mZip.unzip(fpZip1, fpUnzipExtract + '/test1'))
    console.log('unzip1 after')

    //unzip
    console.log('unzip2 before')
    console.log('unzip2', await wz.mZip.unzip(fpZip2, fpUnzipExtract + '/test2'))
    console.log('unzip2 after')

    //unzip with password
    console.log('unzip2 with password before')
    console.log('unzip2 with password', await wz.mZip.unzip(fpZip2PW, fpUnzipExtract + '/test2PW', { pw }))
    console.log('unzip2 with password after')

}
test()
    .catch((err) => {
        console.log(err)
    })

// zipFile before
// zipFile done: ./testData/outputZip/test1.zip
// zipFile after
// zipFolder before
// zipFolder done: ./testData/outputZip/test2.zip
// zipFolder after
// zipFolder with password before
// zipFolder with password done: ./testData/outputZip/test2PW.zip
// zipFolder with password after
// unzip1 before
// unzip1 done: ./testData/outputZip/extract/test1
// unzip1 after
// unzip2 before
// unzip2 done: ./testData/outputZip/extract/test2
// unzip2 after
// unzip2 with password before
// unzip2 with password done: ./testData/outputZip/extract/test2PW
// unzip2 with password after
```
