import React, { useState, useEffect } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonProgressBar, IonContent, IonList, IonButtons, IonBackButton, IonListHeader, IonItem, IonNote } from '@ionic/react';
import { sections, getAssignments } from '../Schoology';

const Section: React.FC<{match: any}> = (props) => {
    const [categories, setCategories] = useState([] as any[])

    useEffect(() => {
        console.log(props.match.params.id)
        getAssignments(props.match.params.id).then((categories) => {
            console.log(categories)
            setCategories(categories)
        })
    })

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
                        <IonListHeader>{cat.title} ({cat.weight}%): {cat.grade}</IonListHeader>
                        {cat.assignments.map((a: any, t: number) => {
                            return <IonItem key={t}>
                                {a.title}
                        <IonNote slot="end">{a.grade}/{a.max_points} ({a.grade*100/Number(a.max_points)}%)</IonNote>
                            </IonItem>
                        })}
                    </IonList>
                })}
            </IonContent>
        </IonPage>
    )
}

export default Section;