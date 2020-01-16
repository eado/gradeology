import React, { useState, useEffect } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonProgressBar, IonContent, IonList, IonButtons, IonBackButton, IonListHeader, IonItem, IonNote } from '@ionic/react';
import { sections, getAssignments, getGrades, getLetterGradeFromPercent } from '../Schoology';

const round = (value: number, decimals: number) => {
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
    })

    const gradeForAssignment = (a: any) => {
        let string = ""
        let percent = 0
        let letterGrade = <b></b>
        if (a.grade) {
            percent = round(a.grade*100 / Number(a.max_points), 2)
            letterGrade = <b>{getLetterGradeFromPercent(percent)}</b>
            string += a.grade
        } else {
            string += "*"
        }
        string += "/" + a.max_points + " (" + percent + "%)"

        return <IonNote slot="end">{letterGrade}&nbsp;{string}</IonNote>
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
                    return <IonList key={i}>
                                <IonItem><b>{cat.title} ({cat.weight}%)</b> {cat.grade ? <IonNote slot="end"><b>{getLetterGradeFromPercent(cat.grade)} ({cat.grade}%) {cat.points}/{cat.totalPoints}</b></IonNote>: null}</IonItem>
                                {cat.assignments.map((a: any, t: number) => {
                                    return <IonItem key={t}>
                                        {a.title}
                                        {gradeForAssignment(a)}
                                    </IonItem>
                                })}
                    </IonList>
                })}
            </IonContent>
        </IonPage>
    )
}

export default Section;