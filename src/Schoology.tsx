import { v4 } from 'uuid';

let key = ""
let secret = ""
let uid = ""

export const refreshCreds = () => {
    key = window.localStorage.getItem("key") ? window.localStorage.getItem("key") as string : ""
    secret = window.localStorage.getItem("secret") ? window.localStorage.getItem("secret") as string : ""
    uid = window.localStorage.getItem("uid") ? window.localStorage.getItem("uid") as string : ""
}
refreshCreds()

export const getEndpoint = async (endpoint: string) => (await fetch('https://api.schoology.com/v1/' + endpoint, {
    method: 'GET',
    headers: {
        'Authorization': `OAuth oauth_consumer_key=\"${key}\",oauth_signature_method=\"PLAINTEXT\",oauth_timestamp=\"${Date.now() / 1000}\",oauth_nonce=\"${v4()}\",oauth_version=\"1.0\",oauth_signature=\"${secret}%26\"`
    }
})).json()

function creator<T>(endpoint: string, cb: (data: any, res: (data: T) => void, rej: (data: any) => void) => void) {
    return new Promise<T>((res, rej) => {
        getEndpoint(endpoint).then(resp => {
            if (!resp) {
                rej("Invalid Credentials")
            } else {
                cb(resp, res, rej)
                window.localStorage.setItem("verified", "true")
            }
        })
    })
}

export const testCreds = () => creator<void>("users/" + uid, (data, res, rej) => {
    if (data) {
        res()
    } else {
        rej("Invalid Credentials")
    }
})

export const getSections = () => creator<any[]>("users/" + uid + "/sections", (d, r, _) => {
    r(d.section.map((section: any) => {return {id: section.id, name: section.course_title}}))
})
