import React from 'react'
import './App.css'
import { createOffer, initiateConnection, startCall, sendAnswer, addCandidate, initiateLocalStream, listenToConnectionEvents, sendAudioStream, endCall, cleanupMediaDevices } from './modules/RTCModule'
import { initializeApp } from 'firebase/app'; // Import initializeApp from 'firebase/app'
import { getDatabase } from 'firebase/database';



import config from './config'
import { doOffer, doAnswer, doLogin, doCandidate } from './modules/FirebaseModule'
import 'webrtc-adapter'
import VideoChat from './VideoChat'

class VideoChatContainer extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      database: null,
      connectedUser: null,
      localStream: null,
      localConnection: null
    }
    this.localVideoRef = React.createRef()
    this.remoteVideoRef = React.createRef()
  }

  componentDidMount = async () => {
    const app = initializeApp(config);
    const database = getDatabase(app); // Get the Realtime Database instance
  
    // getting local video stream
    const localStream = await initiateLocalStream()
    this.localVideoRef.srcObject = localStream
    localStream.getAudioTracks().muted = true;
    this.localVideoRef.muted = true;

  
    // Establish WebSocket connection
    const websocket = new WebSocket('ws://localhost:5000');
  
    // Wait for the WebSocket to open before sending audio
    websocket.onopen = () => {
      console.log('WebSocket connected');
      
      // Start sending audio data only after the connection is open
      sendAudioStream(localStream, websocket);
    };

    websocket.onmessage = async (event) => {
      if (typeof event.data === 'string') {
        console.log('Metadata:', event.data); // Handle metadata (e.g., sample width, channels, etc.)
      } else if (event.data instanceof ArrayBuffer) {
        this.playIncomingAudio(event.data);
      }
    };
  
    const localConnection = await initiateConnection();
  
    this.setState({
      database: database,
      localStream,
      localConnection,
      websocket,  // Store the WebSocket in state
    });
  }
  
  playIncomingAudio = async (audioBuffer) => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const decodedData = await audioContext.decodeAudioData(audioBuffer);
  
      const source = audioContext.createBufferSource();
      source.buffer = decodedData;
      source.connect(audioContext.destination);
  
      source.start();
    } catch (error) {
      console.error('Error playing incoming audio:', error);
    }
  };

    shouldComponentUpdate (nextProps, nextState) {
      if (this.state.database !== nextState.database) {
        return false
      }
      if (this.state.localStream !== nextState.localStream) {
        return false
      }
      if (this.state.localConnection !== nextState.localConnection) {
        return false
      }

      return true
    }

    startCall = async (username, userToCall) => {
      const { localConnection, database, localStream } = this.state
      listenToConnectionEvents(localConnection, username, userToCall, database, this.remoteVideoRef, doCandidate)
      // create an offer
      createOffer(localConnection, localStream, userToCall, doOffer, database, username)
    }

    onLogin = async (username) => {
      return await doLogin(username, this.state.database, this.handleUpdate)
    }

    setLocalVideoRef = ref => {
      this.localVideoRef = ref
    }

    setRemoteVideoRef = ref => {
      this.remoteVideoRef = ref
    }

    handleUpdate = (notif, username) => {
      const { localConnection, database, localStream } = this.state

      if (notif) {
        switch (notif.type) {
          case 'offer':
            this.setState({
              connectedUser: notif.from
            })

            listenToConnectionEvents(localConnection, username, notif.from, database, this.remoteVideoRef, doCandidate)

            sendAnswer(localConnection, localStream, notif, doAnswer, database, username)
            break
          case 'answer':

            this.setState({
              connectedUser: notif.from
            })
            startCall(localConnection, notif)
            break
          case 'candidate':
            addCandidate(localConnection, notif)
            break
          default:
            break
        }
      }
    }

    render () {
      return <VideoChat
        startCall={this.startCall}
        onLogin={this.onLogin}
        setLocalVideoRef={this.setLocalVideoRef}
        setRemoteVideoRef={this.setRemoteVideoRef}
        connectedUser={this.state.connectedUser}
      />
    }
}

export default VideoChatContainer