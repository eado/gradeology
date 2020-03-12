import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonList, IonItem, IonNote, IonProgressBar, IonThumbnail, IonImg, IonLabel } from '@ionic/react';
import React, { useState, useEffect } from 'react';
import { getLetterGradeFromPercent, getGradeData } from '../Schoology';

const Home: React.FC = () => {
  const [sections] = useState([] as any[])

  useEffect(() => {
    if (sections.length < 1) {
      getGradeData().then(() => {
        console.log()
      })
    }
  }, [])
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Classes</IonTitle>
        </IonToolbar>
        {sections.length < 1 ? <IonProgressBar type="indeterminate"></IonProgressBar>: null}
      </IonHeader>
      <IonContent className="ion-padding">
        <IonList>
          {sections.map((section, i) => <IonItem lines="none" key={i} routerLink={"/home/section/" + section.name + "/" + section.id}>
            <IonThumbnail slot="start"><IonImg src={section.image}/></IonThumbnail>
            <IonLabel>{section.name}</IonLabel>
            <IonNote slot="end">
              {section.classGrade ? <>
                <b>{getLetterGradeFromPercent(section.classGrade)}&nbsp;</b> 
                ({section.classGrade}%)&ensp;
              </> : null}
              {section.examGrade ? <>
                <b>{getLetterGradeFromPercent(section.examGrade)}&nbsp;</b> 
                ({section.examGrade}%)&ensp;
              </> : null}
              <b>{getLetterGradeFromPercent(section.grade)}&nbsp;</b> 
              ({section.grade}%)
            </IonNote>
          </IonItem>)}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Home;
