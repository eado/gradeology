import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonList, IonItem } from '@ionic/react';
import React, { useState, useEffect } from 'react';
import { getSections } from '../Schoology';

const Home: React.FC = () => {
  const [sections, setSections] = useState([] as any[])

  useEffect(() => {
    if (sections.length < 1) {
      getSections().then((s) => {
        setSections(s)
      })
    }
  })
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Grades</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonList>
          {sections.map((section, i) => <IonItem key={i}>{section.name + ", " + section.id}</IonItem>)}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Home;
