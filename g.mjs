import w from 'wsemi'
import WLdap from './src/WLdap.mjs'
//import WLdap from 'w-ldap/src/WLdap.mjs'
//import WLdap from 'w-ldap'


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
    w.fsWriteText('./logIn.txt', w.o2j(r, true))

    inp = {
        mode: 'listUsers',
        account,
        password,
        ldappath,
    }
    r = await WLdap(inp)
    w.fsWriteText('./listUsers.txt', w.o2j(r, true))

}
test()
    .catch((err) => {
        console.log('catch', err)
    })

//需運行於AD環境，並於測試腳本填入帳密與ldap位址
//node g.mjs
