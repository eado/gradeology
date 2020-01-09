import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonList, IonItem, IonNote, IonProgressBar } from '@ionic/react';
import React, { useState, useEffect } from 'react';
import { getSections, getGrades, getFinalGrades, getLetterGradeFromPercent } from '../Schoology';

const Home: React.FC = () => {
  const [sections, setSections] = useState([] as any[])

  useEffect(() => {
    if (sections.length < 1) {
      getGrades().then(() => {
        setSections(getFinalGrades())
      })
    }
  })
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Grades</IonTitle>
        </IonToolbar>
        {sections.length < 1 ? <IonProgressBar type="indeterminate"></IonProgressBar>: null}
      </IonHeader>
      <IonContent className="ion-padding">
        <IonList>
          {sections.map((section, i) => <IonItem key={i}>
            {section.name}
            <IonNote slot="end">
              <b>{getLetterGradeFromPercent(section.grade)}&nbsp;</b> 
              {section.grade}
            </IonNote>
          </IonItem>)}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Home;
