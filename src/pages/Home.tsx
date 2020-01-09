import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonList, IonItem, IonNote, IonProgressBar } from '@ionic/react';
import React, { useState, useEffect } from 'react';
import { getGrades, getFinalGrades, getLetterGradeFromPercent } from '../Schoology';

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
          <IonTitle>Classes</IonTitle>
        </IonToolbar>
        {sections.length < 1 ? <IonProgressBar type="indeterminate"></IonProgressBar>: null}
      </IonHeader>
      <IonContent className="ion-padding">
        <IonList>
          {sections.map((section, i) => <IonItem key={i} routerLink={"/home/section/" + section.name + "/" + section.id}>
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
