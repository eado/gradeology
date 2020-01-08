import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonList, IonItem, IonLabel, IonInput, IonButton, IonAlert } from '@ionic/react';
import React, { useState } from 'react';
import { refreshCreds, testCreds } from '../Schoology';
import { Redirect } from 'react-router';

const Creds: React.FC = () => {
  const [key, setKey] = useState("")
  const [secret, setSecret] = useState("")
  const [uid, setUid] = useState("")

  const [goHome, setGoHome] = useState(false)
  const [showAlert, setShowAlert] = useState(false)

  const signIn = () => {
    window.localStorage.setItem("key", key)
    window.localStorage.setItem("secret", secret)
    window.localStorage.setItem("uid", uid)

    refreshCreds()

    testCreds().then(() => setGoHome(true)).catch()
  }

  return (
    <IonPage>
      {goHome ? <Redirect to="/home" /> : null}
      <IonAlert isOpen={showAlert} header="Error" message="Those credentials didn't work. Please try again." buttons={['Okay']} onDidDismiss={() => setShowAlert(false)}></IonAlert>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Welcome to Gradeology!</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonList>
            <IonItem>
                <IonLabel position="stacked">Key</IonLabel>
                <IonInput onChange={(ev) => setKey((ev.target as HTMLInputElement).value)}></IonInput>
            </IonItem>
            <IonItem>
                <IonLabel position="stacked">Secret</IonLabel>
                <IonInput onChange={(ev) => setSecret((ev.target as HTMLInputElement).value)}></IonInput>
            </IonItem>
            <IonItem>
                <IonLabel position="stacked">User ID</IonLabel>
                <IonInput onChange={(ev) => setUid((ev.target as HTMLInputElement).value)}></IonInput>
            </IonItem>
            <br />
            <IonButton onClick={() => signIn()} expand="full">Sign In</IonButton>
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Creds;
