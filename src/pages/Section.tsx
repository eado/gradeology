import React, { useState, useEffect } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonProgressBar, IonContent, IonList, IonButtons, IonBackButton, IonItem, IonNote } from '@ionic/react';
import { sections, getAssignments, getGrades, getLetterGradeFromPercent } from '../Schoology';
import moment from 'moment';

export const round = (value: number, decimals: number) => {
    return Number(Math.round(Number(String(value)+'e'+String(decimals)))+'e-'+decimals);
}

const Section: React.FC<{match: any}> = (props) => {
    const [categories, setCategories] = useState([] as any[])

    useEffect(() => {
        if (sections.length < 1) {
            getGrades().then(() => {
                getAssignments(props.match.params.id).then((categories) => {
                    setCategories(categories)
                })
            })
        } else {
            getAssignments(props.match.params.id).then((categories) => {
                setCategories(categories)
            })
        }
    }, [])

    const gfa = (a: any) => {
        let string = ""
        let percent = 0
        let letterGrade = ""
        if (a.grade) {
            percent = round(a.grade*100 / Number(a.max_points), 2)
            letterGrade = getLetterGradeFromPercent(percent)
            string += a.grade
        } else {
            string += "*"
        }
        string += "/" + a.max_points + " (" + percent + "%)"

        return [letterGrade, string]
    }

    const checkIfMissing = (a: any) => {        
        return moment(a.due).diff(moment(Date.now())) < 0 && !(a.grade)
    }

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>{props.match.params.name}</IonTitle>
                    <IonButtons slot="start">
                        <IonBackButton />
                    </IonButtons>
                </IonToolbar>
                {categories.length < 1 ? <IonProgressBar type="indeterminate"></IonProgressBar>: null}
            </IonHeader>
            <IonContent className="ion-padding">
                {categories.map((cat, i) => {
                    return cat.weight != 0 ? <IonList key={i}>
                                <IonItem lines={cat.assignments.length > 0  ? "full" : "none"}><b>{cat.title} ({cat.weight}%)</b> {cat.grade ? <IonNote slot="end"><b>{getLetterGradeFromPercent(cat.grade)} {cat.points}/{cat.totalPoints} ({cat.grade}%) </b></IonNote>: null}</IonItem>
                                {cat.assignments.map((a: any, t: number) => {
                                    return <IonItem lines="none" key={t}>
                                        {checkIfMissing(a) ? <>
                                            <i>{a.title}</i>
                                            <IonNote slot="end"><i><b>{gfa(a)[0]}</b> {gfa(a)[1]}</i></IonNote>
                                        </> : <>
                                            {a.title}
                                            <IonNote slot="end"><b>{gfa(a)[0]}</b> {gfa(a)[1]}</IonNote>
                                        </>
                                        }
                                       
                                    </IonItem>
                                })}
                    </IonList>: null
                })}
            </IonContent>
        </IonPage>
    )
}

export default Section;