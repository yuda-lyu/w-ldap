// unit-WLdap 測試之子行程入口: 於沙箱 cwd 載入 WLdap 並呼叫, 以一行 RESULT <json> 回報結局
// 用法: node runWLdap.mjs <WLdap.mjs 路徑> <case.json 路徑>
// case.json: input、opt、freeze、seal、extra('bigint'|'circular')、fakePlatform、parallel(並發次數)
import fs from 'fs'
import util from 'util'
import { pathToFileURL } from 'url'


let [modulePath, fpCase] = process.argv.slice(2)
let c = JSON.parse(fs.readFileSync(fpCase, 'utf8'))

//攔截主控台輸出, 供斷言函式庫不寫 console
let logs = []
for (let k of ['log', 'error', 'warn', 'info']) {
    console[k] = (...args) => {
        logs.push(util.format(...args))
    }
}

//fakePlatform, 模擬非 Windows
if (c.fakePlatform) {
    Object.defineProperty(process, 'platform', { value: c.fakePlatform })
}

let WLdap = (await import(pathToFileURL(modulePath).href)).default

//call, 呼叫一次並把結局轉為可序列化之物件
let call = async (input, opt) => {
    let outcome
    let value
    try {
        value = await WLdap(input, opt)
        outcome = 'resolve'
    }
    catch (err) {
        value = err
        outcome = 'reject'
    }
    return {
        outcome,
        valueType: value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value,
        isError: value instanceof Error,
        value: value instanceof Error ? { name: value.name, code: value.code, message: value.message } : value,
    }
}

let r = {}
if (c.parallel) {
    //並發多次, 每次帳密不同
    let inputs = []
    for (let i = 0; i < c.parallel; i++) {
        inputs.push({ ...c.input, account: `user-${i}`, password: `pw-${i}` })
    }
    r.parallel = await Promise.all(inputs.map((inp) => call(inp, c.opt || {})))
}
else {
    let input = c.input
    if (c.extra === 'bigint') {
        input.extra = 10n
    }
    if (c.extra === 'circular') {
        let o = {}
        o.self = o
        input.extra = o
    }
    //snapshot, 呼叫前後之鍵與值(物件與 BigInt 以標記代之)
    let snapshot = () => Object.keys(input).map((k) => {
        let v = input[k]
        if (typeof v === 'bigint') {
            v = `${v}n`
        }
        else if (v !== null && typeof v === 'object') {
            v = '[object]'
        }
        return [k, v]
    })
    if (c.freeze) {
        Object.freeze(input)
    }
    if (c.seal) {
        Object.seal(input)
    }
    r.before = snapshot()
    Object.assign(r, await call(input, c.opt || {}))
    r.after = snapshot()
}
r.logs = logs
process.stdout.write('RESULT ' + JSON.stringify(r) + '\n')
