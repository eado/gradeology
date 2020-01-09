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

export const getEndpoint = (endpoint: string) => {
    const headers = {
        'Authorization': `OAuth oauth_consumer_key="${key}",oauth_signature_method="PLAINTEXT",oauth_timestamp="${Date.now() / 1000}",oauth_nonce="${v4()}",oauth_version="1.0",oauth_signature="${secret}%26"`
    }
    // console.log(headers)
    return fetch('https://cors-anywhere.herokuapp.com/api.schoology.com/v1/' + endpoint, {
        method: 'GET',
        headers
    })
}

function creator<T>(endpoint: string, cb: (data: any, res: (data: T) => void, rej: (data: any) => void) => void) {
    return new Promise<T>((res, rej) => {
        getEndpoint(endpoint).then(resp => {
            if (resp.status !== 200) {
                rej("Status not 200")
            }
            resp.json().then((data) => {
                if (!data) {
                    rej("Invalid Credentials")
                } else {
                    cb(data, res, rej)
                    window.localStorage.setItem("verified", "true")
                }
            }).catch((e) => {console.log(e); rej(e)})
        }).catch((e) => {console.log(e); rej(e)})
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
    r(d.section.map((section: any) => {return {id: section.id, name: section.course_title, gp: section.grading_periods}}))
})

export const getSectionName = (section: string) => creator<string>("sections/" + section, (d, r, _) => {
    r(d.course_title)
})

export const getLetterGradeFromPercent = (percent: number) => {
    if (percent > 92.44) {
        return 'A'
    } else if (percent > 89.44) {
        return 'A-'
    } else if (percent > 86.44) {
        return 'B+'
    } else if (percent > 82.44) {
        return 'B'
    } else if (percent > 79.44) {
        return 'B-'
    } else if (percent > 76.44) {
        return 'C+'
    } else if (percent > 72.44) {
        return 'C'
    } else if (percent > 69.44) {
        return 'C-'
    } else if (percent > 66.44) {
        return 'D+'
    } else if (percent > 62.44) {
        return 'D'
    } else if (percent > 59.44) {
        return 'D-'
    } else {
        return 'F'
    }
}

export let sections: any[] = []
export const getGrades = () => {
    return new Promise<void>((res, rej) => {
        getSections().then(secs => {
            let gradingPeriods = []
            for (let section of secs) {
                for (let gp of section.gp) {
                    if (gp !== 0 && !(gp in gradingPeriods)) {
                        console.log(gp)
                        gradingPeriods.push(gp)
                    }
                }
            }
            creator<void>("users/" + uid + "/grades?grading_period_ids=" + gradingPeriods, (d, r, _) => {
                console.log(d)
                sections = d.section
                let t = 0
                for (let section of sections) {
                    let difference =  Math.abs(section.section_id - secs[0].id)
                    let idx = 0
                    let i = 0
                    for (let sec of secs) {
                        const diff = Math.abs(section.section_id - sec.id)
                        if (diff < difference) {
                            difference = diff
                            idx = i
                        }
                        i++
                    }
                    sections[t].name = secs[idx].name
                    t++
                }
                res()
                r()
            })
        }).catch(e => rej(e))
    })
}

export const getFinalGrades = () => {
    let finalGrades: any[] = []
    for (let section of sections) {
        if (section.final_grade[0].grade && section.name) {
            finalGrades.push({grade: section.final_grade[0].grade, name: capitalize(section.name)})
        }
    }

    return finalGrades
}

const capitalize = (str: string) => {
    let capital = ""
    for (let word of str.split(" ")) {
        let w = ""
        if (word.length > 3) {
            let i = 0
            for (let char of word.split("")) {
                if (i === 0) {
                    w += char.toUpperCase()
                } else {
                    w+= char.toLowerCase()
                }
                i++
            }
            
        } else {
            w = word
        }
        capital += w + " "
    }
    return capital
}