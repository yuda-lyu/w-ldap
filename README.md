# w-ldap
A LDAP tool for windows.

![language](https://img.shields.io/badge/language-JavaScript-orange.svg) 
[![npm version](http://img.shields.io/npm/v/w-ldap.svg?style=flat)](https://npmjs.org/package/w-ldap) 
[![license](https://img.shields.io/npm/l/w-ldap.svg?style=flat)](https://npmjs.org/package/w-ldap) 
[![npm download](https://img.shields.io/npm/dt/w-ldap.svg)](https://npmjs.org/package/w-ldap) 
[![npm download](https://img.shields.io/npm/dm/w-ldap.svg)](https://npmjs.org/package/w-ldap) 
[![jsdelivr download](https://img.shields.io/jsdelivr/npm/hm/w-ldap.svg)](https://www.jsdelivr.com/package/npm/w-ldap)

## Documentation
To view documentation or get support, visit [docs](https://yuda-lyu.github.io/w-ldap/global.html).

## Core
> `w-ldap` is based on the `Microsoft .Net Framework`, and only run in `Windows`.

## Installation

### Using npm(ES6 module):
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

### External executables

The package reaches LDAP through one small .NET program, `connLDAP.net4.x.exe`, which needs its neighbour `Newtonsoft.Json.dll` in the same folder (VB.NET source in `srcVB/`). **They are not part of the npm package**: the package contains only the manifest `bin/manifest.json`, which records the source, SHA-256 and size of every file. The five files form one bundle, `connLDAP`:

| File | Purpose |
|---|---|
| `connLDAP.net4.5.exe`, `connLDAP.net4.6.exe`, `connLDAP.net4.7.2.exe`, `connLDAP.net4.8.exe` | the bridge to LDAP, one per .NET Framework version (`opt.ver`, default `4.8`) |
| `Newtonsoft.Json.dll` | JSON library loaded by the executables; it must sit next to the executable |

Source: `bin/connLDAP/` of the GitHub repository `yuda-lyu/w-ldap`, pinned to the commit recorded in `bin/manifest.json`.

- **First use**: the first call of `WLdap(...)` downloads the five files from `https://raw.githubusercontent.com/yuda-lyu/w-ldap/<commit>/bin/connLDAP/<file>`, checks each one against the SHA-256 and size in `bin/manifest.json`, and publishes them together as one folder `<package root>/bin-cache/<bundle id>/`. Nothing is downloaded when the package is installed. Later calls take the bundle from the cache and check every file again before use (once per process, again if a file changes). A file that does not match the manifest is never used and never left behind; if one file of a cached bundle is tampered with or missing, the whole bundle is fetched again.
- **`WLdap.ensureBins()`** does the same ahead of time (for example on a build machine) and resolves to `{ connLDAP: '<absolute path of the bundle folder>' }`; the file paths are in `bundles.connLDAP.files['connLDAP.net4.8.exe']` (a non enumerable property). It reads the environment variables below.
- **Environment variables** (read by `ensureBins()` and by every call of `WLdap`):
  - `W_BIN_CACHE=<folder>`: keep the cache in `<folder>/w-ldap/<bundle id>/` instead of the package folder (use it when `node_modules` is read-only; several packages can share one folder).
  - `W_BIN_MIRROR=<folder or http(s) base URL>`: look in the mirror before GitHub. The layout is `<mirror>/w-ldap/<bundle id>/<file>` (or `<mirror>/w-ldap/<sha256>/<file>` per file). A file from the mirror is checked against the manifest like any other, so a mirror cannot supply a different file; a file that does not match is refused and the next source is tried.
  - `W_BIN_OFFLINE=1`: never connect to GitHub; use only the cache and the mirror. When a file is missing the call rejects with `ensureBins[E_OFFLINE_MISSING]: ...`, and the message lists the whole bundle (every file with its SHA-256 and size) and the exact cache and mirror paths where it must be put.
- **Offline deployment** (a machine that cannot reach GitHub):
  1. On a machine with network access set `W_BIN_CACHE` to an empty folder and run a script that calls `ensureBins()` once:

     ```alias
     // prepare.mjs
     import WLdap from 'w-ldap'
     console.log(await WLdap.ensureBins())
     ```

     (PowerShell: `$env:W_BIN_CACHE='D:\mirror'; node prepare.mjs`.) The folder now holds `w-ldap/<bundle id>/` with the five files.
  2. Copy the whole folder to the offline machine and set `W_BIN_MIRROR=<that folder>` (and `W_BIN_OFFLINE=1` to forbid any network access). The first use copies the verified bundle into the local cache.
- **Output file**: the executable writes its result to a file next to itself, named from a relative path given by `WLdap`. `WLdap` points it to the operating system's temporary folder (`os.tmpdir()`), reads it and deletes it, so nothing is written into the bundle folder (which may be shared or read-only). If the temporary folder and the bundle folder are on different drives, a relative path does not exist and the file is written into the bundle folder instead (which then must be writable).

### Breaking changes: external executables

- `connLDAP.net4.x.exe` and `Newtonsoft.Json.dll` are no longer inside the npm package (and `srcVB/` is no longer packed). The first call needs network access to GitHub or a mirror (see above); machines that cannot do either must be prepared as described under *Offline deployment*.
- The executable is no longer looked up under the working directory (`./src/` or `./node_modules/w-ldap/src/`): the files `src/connLDAP.net4.x.exe` and `src/Newtonsoft.Json.dll` no longer exist, so code that used those paths must call `WLdap.ensureBins()` and read `bundles.connLDAP.files[...]` instead. The process may run from any working directory.
- The output file of each call is written to the operating system's temporary folder, not next to the executable (see *Output file*).
- A failure to obtain the executable rejects with the string `ensureBins[<code>]: <message>` (`<code>` is `E_OFFLINE_MISSING`, `E_HASH_MISMATCH`, `E_SIZE_MISMATCH`, `E_HTTP`, `E_NETWORK`, ...) before anything is started. Before, a missing executable rejected with the string `can not find folder for connLDAP`.
- `srcVB/connLDAP/connLDAP.vbproj` now builds into `bin/connLDAP/` (was `srcVB/connLDAP/bin/Debug` and `bin/Release`).
