import rollupFiles from 'w-package-tools/src/rollupFiles.mjs'
import getFiles from 'w-package-tools/src/getFiles.mjs'


let fdSrc = './src'
let fdTar = './dist'


rollupFiles({
    fns: 'WLdap.mjs',
    fdSrc,
    fdTar,
    nameDistType: 'kebabCase',
    globals: {
        'path': 'path',
        'fs': 'fs',
        'process': 'process',
        'child_process': 'child_process',
        'url': 'url',
        'crypto': 'crypto',
        'stream': 'stream',
        'stream/promises': 'stream/promises',
        'os': 'os',
    },
    external: [
        'path',
        'fs',
        'process',
        'child_process',
        'url',
        'crypto',
        'stream',
        'stream/promises',
        'os',
    ],
})

