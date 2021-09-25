import path from 'path'
import fs from 'fs'
import process from 'process'
import get from 'lodash/get'
import genID from 'wsemi/src/genID.mjs'
import str2b64 from 'wsemi/src/str2b64.mjs'
import b642str from 'wsemi/src/b642str.mjs'
import j2o from 'wsemi/src/j2o.mjs'
import execScript from 'wsemi/src/execScript.mjs'
import fsIsFile from 'wsemi/src/fsIsFile.mjs'
import arrhas from 'wsemi/src/arrhas.mjs'
import isestr from 'wsemi/src/isestr.mjs'
import iseobj from 'wsemi/src/iseobj.mjs'


let fdSrv = path.resolve()


function isWindows() {
    return process.platform === 'win32'
}


function getExecFolder() {
    let ver = `4.8`
    let fnExe = `connLDAP.net${ver}.exe`
    let fdExeSrc = `${fdSrv}/src/`
    let fdExeNM = `${fdSrv}/node_modules/w-ldap/src/`

    if (fsIsFile(`${fdExeSrc}${fnExe}`)) {
        return fdExeSrc
    }
    else if (fsIsFile(`${fdExeNM}${fnExe}`)) {
        return fdExeNM
    }
    else {
        return { error: 'can not find executable file for connLDAP' }
    }
}


function getExecPath(fd, ver) {

    //fn
    let fn = `connLDAP.net${ver}.exe`

    return `${fd}${fn}`
}


function trimBOM(c) {
    return c.replace(
        String.fromCharCode('65279'), ''
    )
}


/**
 * 呼叫LDAP服務進行登入或取得使用者清單，係呼叫Net程式呼叫LDAP取得資料，故會有Net Framework版本與作業系統限制
 *
 * @param {Object} input 輸入設定物件，預設{}
 * @param {String} [opt.mode] 輸入呼叫方法字串，可有'logIn'與'listUsers'
 * @param {String} [opt.account] 輸入LDAP帳號字串
 * @param {String} [opt.password] 輸入LDAP帳號之密碼字串
 * @param {String} [opt.ldappath] 輸入LDAP伺服器位址字串
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {String} [opt.ver='4.8'] 輸入調用windows程序之Net Framework版本字串，可有'4.5'、'4.6'、'4.7.2'與'4.8'，預設'4.8'
 * @returns {Promise} 回傳Promise，resolve回傳成功訊息，reject回傳錯誤訊息
 * @example
 * import WLdap from 'w-ldap'
 *
 * async function test() {
 *     let inp
 *     let r
 *     let account = '{account}'
 *     let password = '{password}'
 *     let ldappath = 'LDAP://{PATH}'
 *
 *     inp = {
 *         mode: 'logIn',
 *         account,
 *         password,
 *         ldappath,
 *     }
 *     r = await WLdap(inp)
 *     console.log('logIn', r)
 *     w.fsWriteText('logIn.txt', w.o2j(r, true))
 *
 *     inp = {
 *         mode: 'listUsers',
 *         account,
 *         password,
 *         ldappath,
 *     }
 *     r = await WLdap(inp)
 *     w.fsWriteText('listUsers.txt', w.o2j(r, true))
 *
 * }
 * test()
 *     .catch((err) => {
 *         console.log('catch', err)
 *     })
 *
 */
async function WLdap(input = {}, opt = {}) {

    //isWindows
    if (!isWindows()) {
        return Promise.reject('operating system is not windows')
    }

    //check
    if (!iseobj(input)) {
        return Promise.reject('invalid input')
    }

    //check
    let mode = get(input, 'mode')
    if (mode !== 'logIn' && mode !== 'listUsers') {
        return Promise.reject(`input.mode needs to be 'logIn or 'listUsers`)
    }
    if (!isestr(get(input, 'account'))) {
        return Promise.reject('invalid input.account')
    }
    if (!isestr(get(input, 'password'))) {
        return Promise.reject('invalid input.password')
    }
    if (!isestr(get(input, 'ldappath'))) {
        return Promise.reject('invalid input.ldappath')
    }

    //ver
    let ver = get(opt, 'ver', null)
    if (!isestr(ver)) {
        ver = '4.8'
    }

    //check
    if (!arrhas(ver, ['4.5', '4.6', '4.7.2', '4.8'])) {
        return Promise.reject('opt.ver needs to be one of 4.5, 4.6, 4.7.2 or 4.8')
    }

    //fdExe
    let fdExe = getExecFolder()

    //check
    if (get(fdExe, 'error')) {
        return Promise.reject(fdExe.error)
    }

    //prog
    let prog = getExecPath(fdExe, ver)

    //fnOutput
    let fnOutput = `_${genID()}`
    input['__System:OutputFilename'] = fnOutput

    //input to b64
    let cInput = JSON.stringify(input)
    let b64Input = str2b64(cInput)

    //execScript
    await execScript(prog, b64Input)
        .catch((err) => {
            console.log('WLdap execScript catch', err)
        })

    //read output
    let pathOutput = `${fdExe}${fnOutput}`
    let b64Output = fs.readFileSync(pathOutput, 'utf8')
    b64Output = trimBOM(b64Output)
    let cOutput = b642str(b64Output)
    let output = j2o(cOutput)

    //unlinkSync
    fs.unlinkSync(pathOutput)

    //check
    if (get(output, 'error')) {
        return Promise.reject(output.error)
    }

    return get(output, 'success') || output
}


export default WLdap
