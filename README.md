# w-ldap
A LDAP tool for windows.

![language](https://img.shields.io/badge/language-JavaScript-orange.svg) 
[![npm version](http://img.shields.io/npm/v/w-ldap.svg?style=flat)](https://npmjs.org/package/w-ldap) 
[![license](https://img.shields.io/npm/l/w-ldap.svg?style=flat)](https://npmjs.org/package/w-ldap) 
[![gzip file size](http://img.badgesize.io/yuda-lyu/w-ldap/master/dist/w-ldap.umd.js.svg?compression=gzip)](https://github.com/yuda-lyu/w-ldap)
[![npm download](https://img.shields.io/npm/dt/w-ldap.svg)](https://npmjs.org/package/w-ldap) 
[![jsdelivr download](https://img.shields.io/jsdelivr/npm/hm/w-ldap.svg)](https://www.jsdelivr.com/package/npm/w-ldap)

## Documentation
To view documentation or get support, visit [docs](https://yuda-lyu.github.io/w-ldap/global.html).

## Core
> `w-ldap` is basing on the `Microsoft .Net Framework`.

## Installation
### Using npm(ES6 module):
> **Note:** `w-ldap` is mainly dependent on `lodash` and `wsemi`, and should run in `Windows`.

```alias
npm i w-ldap
```

#### Example:
> **Link:** [[dev source code](https://github.com/yuda-lyu/w-ldap/blob/master/g.mjs)]
```alias
import WLdap from 'w-ldap'

async function test() {
    let inp
    let r
    let account = '{account}'
    let password = '{password}'
    let ldappath = 'LDAP://{PATH}'

    inp = {
        mode: 'logIn',
        account,
        password,
        ldappath,
    }
    r = await WLdap(inp)
    console.log('logIn', r)
    w.fsWriteText('logIn.txt', w.o2j(r, true))

    inp = {
        mode: 'listUsers',
        account,
        password,
        ldappath,
    }
    r = await WLdap(inp)
    w.fsWriteText('listUsers.txt', w.o2j(r, true))

}
test()
    .catch((err) => {
        console.log('catch', err)
    })

// => logIn {
//     //LDAP user information
// }
// see logIn.txt and listUsers.txt for details
```
