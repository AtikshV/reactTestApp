import 'react-native-gesture-handler';
/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */


import React, { useEffect, useRef, useState } from 'react';
import type {PropsWithChildren} from 'react';

import Voice, { SpeechEndEvent, SpeechRecognizedEvent, SpeechResultsEvent } from '@react-native-community/voice'; 

import Tts from 'react-native-tts'
Tts.setDefaultLanguage('en-GB');
Tts.setDucking(true);
Tts.addEventListener('tts-start', (event) => console.log("start", event));
Tts.addEventListener('tts-finish', (event) => console.log("finish", event));
Tts.addEventListener('tts-cancel', (event) => console.log("cancel", event));




import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  TouchableOpacity,
  TextInput,
  ActivityIndicator
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';



type SectionProps = PropsWithChildren<{
  title: string;
}>;

function Section({children, title}: SectionProps): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}>
        {children}
      </Text>
    </View>
  );
}

var testid:any;
var testdate:any;
var spokenText:any; 

function App(): React.JSX.Element {

  const [result, setResult] = useState('');
  const [isLoading, setLoading] = useState(false);


  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };



  const speechStartHandler = (e: any) => {
    console.log('speechStart successful', e);  
    // startSpeech(); 
    let test = setInterval(detectSilence, 2000); 
    testid = test;
    console.log(testid);
  };
  

  const speechEndHandler = (e: SpeechEndEvent) => {
    setLoading(false);
    console.log('stop handler', e);
    //
    // !Call a function here that will
    // !call GPT api, then text to speech
    // !then call start recording again
    console.log("end handler: " + spokenText);
    
    startSpeech(); 
    // ? startSpeech doesnt work here

  };

  const speechResultsHandler = (e: SpeechResultsEvent) => {
    const text = e.value ? e.value[0]: "";
    setResult(text);
    spokenText = text;
    testdate = Date.now()
    console.log("timestamp " + testdate); 
    // console.log("Text: " + text);
    
    // console.log("speech results handler", e);
  };

  const detectSilence =  () => {
    if((Date.now() - testdate) > 2000) {
      console.log("STOP");
      console.log("Test ID --> " + testid);
      
      
      clearInterval(testid)
      stopRecording();

    }
  }

  const startRecording = async () => {
    // startSpeech();
    setLoading(true);
    try {
      await Voice.start('en-Us');  
    } catch (error) {
      console.log('error', error);
    } 
  };

  const stopRecording = async () => {
    try {
      await Voice.stop();
      setLoading(false);
    } catch (error) {
      console.log('error', error);
    }
  };

  const clear = async () => {
    setResult('');
    spokenText = ' '

  };

  const startSpeech = async () => {
    Tts.getInitStatus().then(() => {
      Tts.stop();
      console.log("spoken text: " + spokenText);
      
      Tts.speak(spokenText);
      console.log("speech started!\n");


    });    
    // Tts.speak("Hello"); 
    }



  useEffect(() => {

    Voice.onSpeechStart = speechStartHandler;
    Voice.onSpeechEnd = speechEndHandler;
    Voice.onSpeechResults = speechResultsHandler;
    //Voice.onSpeechRecognized = speechRecognizedHandler;
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  useState(() => {

  })

  return (
    <View style={styles.container}>
    <SafeAreaView>
      <Text style={styles.headingText}>Voice to Text Recognition</Text>
      <View style={styles.textInputStyle}>
        <TextInput
          value={result}
          multiline={true}
          placeholder= "say something!"
          style={{
            flex: 1,
            height: '100%',
          }}
          onChangeText={text => setResult(text)}
        />
      </View>
      <View style={styles.btnContainer}>
      {isLoading ? (
            <ActivityIndicator size="large" color="black" />
          ) : (
            <TouchableOpacity onPress={startRecording} style={styles.speak}>
              <Text style={{color: 'white', fontWeight: 'bold'}}>Speak</Text>
            </TouchableOpacity>
          )}
        <TouchableOpacity style={styles.stop} onPress={stopRecording}>
          <Text style={{color: 'white', fontWeight: 'bold'}}>Stop</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.clear} onPress={clear}>
        <Text style={{color: 'white', fontWeight: 'bold'}}>Clear</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.clear} onPress={() => Tts.speak("hello Atiksh")}>
        <Text style={{color: 'white', fontWeight: 'bold'}}>Hello</Text>
      </TouchableOpacity>
    </SafeAreaView>
  </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
  },
  headingText: {
    alignSelf: 'center',
    marginVertical: 26,
    fontWeight: 'bold',
    fontSize: 26,
  },
  textInputStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    height: 300,
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 16,
    shadowOffset: {width: 0, height: 1},
    shadowRadius: 2,
    elevation: 2,
    shadowOpacity: 0.4,
  },
  speak: {
    backgroundColor: 'black',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 8,
  },
  stop: {
    backgroundColor: 'red',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 8,
  },
  clear: {
    backgroundColor: 'black',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 8,
    marginTop: 15,
  },
  btnContainer: {
    display: 'flex',
    flexDirection: 'row',
    width: '50%',
    justifyContent: 'space-evenly',
    marginTop: 24,
  },
});

export default App;
