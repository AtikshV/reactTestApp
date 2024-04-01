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


import AsyncStorage from '@react-native-async-storage/async-storage';




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
  ActivityIndicator, 
  Image, 
  Alert, 
  Modal,
  Pressable,
  
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import { createAnimatedComponent } from 'react-native-reanimated/lib/typescript/createAnimatedComponent';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';



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
var data:any;
var recordingStarted:boolean;
var hangup:boolean; 
var storedName:String;
var storedPass:String;

const vercel = "https://flask-hello-world-ruby-three.vercel.app/GPT_output"


function App(): React.JSX.Element {

  const [result, setResult] = useState('');
  const [response, setResponse] = useState(''); 
  const [inCall, setCall] = useState(false); 
  const [modalVisible, setModalVisible] = useState(false);
  const [password, setPass] = useState('');
  const [firstName, setName] = useState(''); 



  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };



  const speechStartHandler = (e: any) => {
    console.log('speechStart successful', e);  
    testdate = undefined

    let test = setInterval(detectSilence, 2000); 
    testid = test;
    console.log(testid);
  };
  

  const speechEndHandler = (e: SpeechEndEvent) => {
    console.log('stop handler', e);
    //
    // !Call a function here that will
    // !call GPT api, then text to speech
    // !then call start recording again
    console.log("end handler: " + spokenText);

    transcription(); 

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
    console.log("timestamp detect silence " + testdate + " hangup: " + hangup); 
    
    if(hangup) {
      clearInterval(testid)
      stopRecording(); 
    }
    if((Date.now() - testdate) > 2000) {
      console.log("STOP");
      console.log("Test ID --> " + testid);
      
      clearInterval(testid)
      recordingStarted=false;
      stopRecording();

    } 
  }
  
  const switcher = async (stats:String) => {
    if(stats == "stop") {
      setCall(false)
      hangup = true; 
      
    } else {
      storedName = await getData("name")
      storedPass = await getData("pass")
      console.log("name and pass " + storedName + " " + storedPass);
      

      if(storedName == null || storedName == undefined || storedName == '') {
        setModalVisible(true)
      } else {
        setCall(true)
        hangup = false; 
        recordingStarted = false
        startRecording(); 
      }
     
    }

  }

  const startRecording = async () => {
    if (recordingStarted || hangup ) { console.log("oopsies: " + hangup + recordingStarted);
    } 
    else {
      recordingStarted=true
      try {
        await Voice.start('en-Us');  
      } catch (error) {
        console.log('error', error);
      }
    } 
  };

  const stopRecording = async () => {
    try {
      await Voice.stop();
      testdate = undefined
      console.log("undefined? " + testdate)
    } catch (error) {
      console.log('error', error);
    }
  };

  const clear = async () => {
    setResult('');
    spokenText = ' '
    AsyncStorage.removeItem('name');
    AsyncStorage.removeItem('pass');

  };

  const startSpeech = async () => {
    Tts.getInitStatus().then(() => {
      Tts.stop();      
      Tts.speak(data); 
      console.log("speech started!\n");
    });    

    // Tts.speak("Hello"); 
    }

  const transcription = async () => {

    storedName = await getData("name")
    storedPass = await getData("pass")
    var requestBody = "data="+spokenText+ "&pass=" + storedPass + "&name=" + storedName; //TODO: url encode transcript
    console.log(requestBody);

    const reply = await fetch(vercel, {
      method: "POST",
      body: requestBody,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    })

    data = await reply.text()
    console.log(data);
    setResponse(data)
    
    startSpeech(); 

  }

  const storeData = async (key: string, value: string) => {
    try {
      await AsyncStorage.setItem(key, value);
      console.log("key and pass: " + key + " " + value);
      
      
    } catch (e) {
      // saving error
      console.log("error saving data " + e);
      
    }
  };

  const getData = async (key: string):Promise<string> => {
    try {
      const value = await AsyncStorage.getItem(key);
      console.log(value);
      return(value==null?"":value); 
    } catch (e) {
      // error reading value
      console.log("error reading data " + e);
      return "";
      
    }
  };




  useEffect(() => {
    
    Voice.onSpeechStart = speechStartHandler;
    Voice.onSpeechEnd = speechEndHandler;
    Voice.onSpeechResults = speechResultsHandler;

    Tts.addEventListener('tts-start', (event) => console.log("start", event));
    Tts.addEventListener('tts-finish', (event) => {
      console.log("finish", event);
      startRecording();
    })
    Tts.addEventListener('tts-cancel', (event) => console.log("cancel", event));

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
      <Text style={styles.headingText}>AndyAI</Text>
      <Image
        style={styles.logo}
        source={{
          uri: '/Users/atiksh/Documents/Coding/reactTestApp/public/andy.png',
        }}
      />
      
      <View style={styles.textInputStyle}>
        <ScrollView>
          <Text style={{color:'white'}}>{result}</Text>
        </ScrollView>
      </View>
      <View style={{height: 50 }}>
        <ScrollView style={{flexGrow:1}}>
          <Text style={{color:'white'}}>{response}</Text>
        </ScrollView>
      </View>
      <View style={styles.btnContainer}>
      {inCall ? (
            <TouchableOpacity onPress={() => switcher("stop")} style={styles.speak}>
              <Text style={{color: 'white', fontWeight: 'bold'}}>
              <Image
                style={styles.tinyLogo}
                source={{
                uri: '/Users/atiksh/Documents/Coding/reactTestApp/public/decline.png',
                }}
              />
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => switcher("start")} style={styles.speak}>
              <Image
                style={styles.tinyLogo}
                source={{
                uri: '/Users/atiksh/Documents/Coding/reactTestApp/public/accept.png',
                }}
              />
            </TouchableOpacity>
          )}
      </View>

      {/* <View style={styles.centeredView}> */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onDismiss={() => {
          storeData('pass', password)
          storeData('name', firstName)
          switcher('start')
        }}
        onRequestClose={() => {
          Alert.alert('Modal has been closed.');
          setModalVisible(!modalVisible);

        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Please Give</Text>
            <TextInput style={styles.modalTextInput} placeholder='name'onChangeText={setName} ></TextInput>
            <TextInput style={styles.modalTextInput} placeholder='pass'onChangeText={setPass} autoCapitalize='none'></TextInput>
            <Pressable
              style={[styles.button, styles.buttonClose]}
              onPress={() => setModalVisible(!modalVisible)}>
              <Text style={styles.textStyle}>Login</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      {/* <Pressable
        style={[styles.button, styles.buttonOpen]}
        onPress={() => setModalVisible(true)}>
        <Text style={styles.textStyle}>Show Modal</Text>
      </Pressable> */}
    {/* </View> */}

      <TouchableOpacity style={styles.clear} onPress={clear}>
        <Text style={{color: 'white', fontWeight: 'bold'}}>Clear</Text>
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
    backgroundColor: '#000',
    padding: 24,
  },
  headingText: {
    alignSelf: 'center',
    marginVertical: 26,
    fontWeight: 'bold',
    fontSize: 26,
    color: 'white'
  },
  textInputStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'black',
    color: 'white',
    height: 50,
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
    width: '100%',
    justifyContent: 'space-evenly',
    marginTop: 24,
  },
  logo: {
    width:300,
    height: 300,
    resizeMode: 'center',
    alignSelf: 'center'
  },
  tinyLogo: {
    width: 50, 
    height: 50, 
    alignSelf: 'center'
  },
    centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: '#eee',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#fff',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.50,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 25,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    backgroundColor: '#A196F3',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  modalTextInput: {
    marginBottom: 10,
    textAlign: 'center',
  },
});

export default App;
