import { v4 } from 'uuid';
import { round } from './pages/Section';

let key = ""
let secret = ""
let uid = ""

export function filterUndef<T>(ts: (T | undefined)[]): T[] {
    return ts.filter((t: T | undefined): t is T => !!t)
}

export const refreshCreds = () => {
    key = window.localStorage.getItem("key") ? window.localStorage.getItem("key") as string : ""
    secret = window.localStorage.getItem("secret") ? window.localStorage.getItem("secret") as string : ""
    uid = window.localStorage.getItem("uid") ? window.localStorage.getItem("uid") as string : ""
}
refreshCreds()

export const getEndpoint = (endpoint: string, method='GET', body: string | null = null) => {
    const headers = {
        'Authorization': `OAuth oauth_consumer_key="${key}",oauth_signature_method="PLAINTEXT",oauth_timestamp="${Date.now() / 1000}",oauth_nonce="${v4()}",oauth_version="1.0",oauth_signature="${secret}%26"`,
        'Origin': 'desktop',
        'Content-Type': 'application/json'
    }
    console.log(body)
    return fetch('https://cors-anywhere.herokuapp.com/api.schoology.com/v1/' + endpoint, {
        method,
        headers,
        body
    })
}

function creator<T>(endpoint: string, cb: (data: any, res: (data: T) => void, rej: (data: any) => void) => void) {
    return new Promise<T>((res, rej) => {
        getEndpoint(endpoint).then(resp => {
            console.log(resp)
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


let grades: any[] = []
export const getGradeData = async () => {
    const sections = await getSections()
    const gps = Array.from(new Set(sections.flatMap(section => section.gp) as string[])).filter(val => val != '0')
    gps.push("final")
    const gradeData = await getGrades(gps)
    sections.forEach(s => {
        const gd = gradeData.find(g => g.section_id === s.id)
        if (gd) {
            grades.push({...gd, ...s})
        }
    })
    const assignments = await getAllAssignments(grades.map(g => g.id))
    grades.forEach((grade: any, index: number) => {
        grades[index].assignments = assignments[grade.id]
    });

    console.log(grades)
}

export const getAllAssignments = async (sectionIDs: string[]) => {
    console.log(JSON.stringify({request: sectionIDs.map(s => '/v1/sections/' + s + '/assignments?limit=10000')}))
    let resp = await getEndpoint('multiget', 'POST', JSON.stringify({request: sectionIDs.map(s => '/v1/sections/' + s + '/assignments?limit=10000')}))
    let json = await resp.json()

    const ret: {[key: string]: any[]} = {}
    for (let body of json.response) {
        console.log(body)
        const id = body.location.split("/")[3] as string
        if (sectionIDs.indexOf(id) > 0) {
            ret[id] = body.assignment
        }
    }
    console.log(ret)
    return ret
}

export const getSections = () => creator<any[]>("users/" + uid + "/sections", (d, r, _) => {
    const httpsPU = (pu: string) => {
        return "https:" + pu.split(":")[1]
    }
    r(d.section.map((section: any) => {return {id: section.id, name: section.course_title, gp: section.grading_periods, image: httpsPU(section.profile_url)}}))
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
    } else if (isNaN(percent)) {
        return '?'
    } else {
        return 'F'
    }
}

export const getGrades = (gps: string[]) => creator<any[]>("users/" + uid + "/grades?grading_period_ids=" + gps.join(","), (d, r, _) => {
    r(d.section)
})
export let sections: any[] = []
export const getGrades2 = () => {
    return new Promise<void>((res, rej) => {
        getSections().then(secs => {
            let gradingPeriods = ["final"]
            for (let section of secs) {
                for (let gp of section.gp) {
                    if (gp !== 0 && !(gp in gradingPeriods)) {
                        gradingPeriods.push(gp)
                    }
                }
            }
            creator<void>("users/" + uid + "/grades?grading_period_ids=" + gradingPeriods, (d, r, _) => {
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
                    sections[t].section_id = secs[idx].id
                    sections[t].name = secs[idx].name
                    sections[t].image = secs[idx].image
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
        console.log(section.final_grade)
        let grade = section.final_grade[0].grade
        let examGrade: any = null
        let classGrade: any = null
        const cgrade = section.final_grade.find((i: any) => i.period_id === "final")
        if (cgrade) {
            grade = cgrade.grade
            examGrade = section.final_grade.find((i: any) => i.period_id !== "final" && !i.grading_category)
            if (examGrade && examGrade.grade) { 
                classGrade = section.final_grade.find((i: any) => i.period_id !== "final" && i.grading_category)
            }
        }
        if (grade && section.name) {
            finalGrades.push({grade, examGrade: (examGrade && classGrade) ? round(examGrade.grade / ((examGrade.grade) / (10 * (grade - 0.9 * classGrade.grade))), 2) : null, classGrade: classGrade ? classGrade.grade : null, name: capitalize(section.name), id: section.section_id, image: section.image})
        }
    }

    return finalGrades
}

const capitalize = (str: string) => {
    let capital = ""
    for (let word of str.split(" ")) {
        let w = ""
        if (word.length > 3) {
            w = word.charAt(0).toUpperCase() + word.substring(1).toLowerCase()
        } else {
            w = word
        }
        capital += w + " "
    }
    return capital
}

export const getAssignments = (s: number) => creator<any[]>("/sections/" + s + "/assignments?start=0&limit=10000", (d, r, _) => {
    let categories: any[] = []

    let section: any = {}
    for (let sec of sections) {
        if (sec.section_id === s) {
            section = sec

            let grade = section.final_grade[0].grade
            let examGrade: any = null
            let classGrade: any = null
            const cgrade = section.final_grade.find((i: any) => i.period_id === "final")
            if (cgrade) {
                grade = cgrade.grade
                examGrade = section.final_grade.find((i: any) => i.period_id !== "final" && !i.grading_category)
                if (examGrade && examGrade.grade) { 
                    classGrade = section.final_grade.find((i: any) => i.period_id !== "final" && i.grading_category)
                }
            }

            categories = [{
                title: "Final",
                weight: 100,
                grade: grade,
                points: grade,
                totalPoints: 100,
                assignments: [],
                id: Infinity
            }, (examGrade && classGrade) ? {
                title: "Exam",
                weight: 10,
                grade: round(10 * (grade - 0.9 * classGrade.grade), 2),
                points: examGrade.grade,
                totalPoints: round((examGrade.grade / (grade - 0.9 * classGrade.grade)) * 10, 2),
                assignments: [],
                id: Infinity
            } : null, classGrade ? {
                title: "Class",
                weight: 90,
                grade: classGrade.grade,
                points: classGrade.grade,
                totalPoints: 100,
                assignments: [],
                id: Infinity
            }: null, ...section.grading_category]

            categories = categories.filter(val => val ? val : null)
           
            for (let cat of section.final_grade.find((i: any) => i.grading_category).grading_category) {
                let i = 0
                for (let cat2 of categories) {
                    categories[i]['assignments'] = []
                    if (cat2.id === cat.category_id) {
                        categories[i].grade = cat.grade
                        categories[i]['assignments'] = []
                    }
                    i++
                }
            }
            break
        }
    }
    for (let assignment of d.assignment) {
        for (let a of section.period[0].assignment) {
            if (a.assignment_id === assignment.id) {
                const iassignment = {...a, ...assignment}
                let i = 0
                for (let cat of categories) {
                    if (cat.id === Number(iassignment.grading_category)) {
                        categories[i].assignments.push(iassignment)
                    }
                    i++
                }
            }
        }
    }

    let i = 0
    for (let cat of categories) {
        if (!cat.totalPoints) {
            let totalPoints = 0
            let points = 0

            for (let assignment of cat.assignments) {
                if (assignment.grade) {
                    totalPoints += Number(assignment.max_points)
                    points += Number(assignment.grade)
                }
            }
            console.log(cat.id)
            console.log(totalPoints)
            console.log(points)

            categories[i]['totalPoints'] = round(totalPoints, 2)
            categories[i]['points'] = round(points, 2)
        }
        i++;
    }

    r(categories)
})
