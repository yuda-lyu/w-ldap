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
    let ver = `4.7.2`
    let fn472 = `connLDAP.net${ver}.exe`
    let fdExeSrc = `${fdSrv}/src/`
    let fdExeNM = `${fdSrv}/node_modules/w-ldap/src/`

    if (fsIsFile(`${fdExeSrc}${fn472}`)) {
        return fdExeSrc
    }
    else if (fsIsFile(`${fdExeNM}${fn472}`)) {
        return fdExeNM
    }
    else {
        return { err: 'can not find executable file for connLDAP' }
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


async function WLdap(input, opt = {}) {

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
        ver = '4.7.2'
    }

    //check
    if (!arrhas(ver, ['4.5', '4.6', '4.7.2'])) {
        return Promise.reject('opt.ver needs to be one of 4.5, 4.6 and 4.7.2')
    }

    //fdExe
    let fdExe = getExecFolder()

    //check
    if (get(fdExe, 'err')) {
        return Promise.reject(fdExe.err)
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

    return output
}


export default WLdap
