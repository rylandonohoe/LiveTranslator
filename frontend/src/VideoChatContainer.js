import React, { useContext } from 'react'; // Add React import to resolve JSX errors
import './App.css';
import { 
  createOffer, 
  initiateConnection, 
  startCall, 
  sendAnswer, 
  addCandidate, 
  initiateLocalStream, 
  listenToConnectionEvents, 
  sendAudioStream
} from './modules/RTCModule'; // Make sure the relative paths are correct
import { initializeApp } from 'firebase/app'; 
import { getDatabase } from 'firebase/database';
import config from './config'; // Ensure config file is available
import { doOffer, doAnswer, doLogin, doCandidate } from './modules/FirebaseModule'; // Correct path for Firebase modules
import 'webrtc-adapter';
import VideoChat from './VideoChat'; // Make sure VideoChat is correctly imported

class VideoChatContainer extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      database: null,
      connectedUser: null,
      localStream: null,
      localConnection: null,
      audioContext: null,
      audioSource: null,
      wavBuffer: null,
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
    
    // Initialize Web Audio API context
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.setState({ audioContext });

    // Load the .wav file and prepare it for playback
    this.loadWavFile(audioContext);

    localStream.getAudioTracks().muted = true;
    this.localVideoRef.muted = true;

  
    // Establish WebSocket connection
    const websocket = new WebSocket('ws://localhost:5000');
    
    websocket.onopen = () => {
      console.log('WebSocket connected');
      sendAudioStream(localStream, websocket, 'en'); // Still send the audio data for other purposes
    };
    websocket.onmessage = async (event) => {
      console.log(event.data);
      
      if (typeof event.data === 'string') {
        console.log('Metadata:', event.data); // Handle metadata
      } else if (event.data instanceof Blob) {
        // If the received data is a Blob (audio), convert it into a MediaStream
        const audioBuffer = await this.convertBlobToAudioBuffer(event.data);
        this.playIncomingAudio(audioBuffer);
      }
    };
  
    const localConnection = await initiateConnection();
    this.setState({
      database,
      localStream,
      localConnection,
      websocket,
    });
  };

  async convertBlobToAudioBuffer(blob) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Convert Blob to ArrayBuffer
    const arrayBuffer = await blob.arrayBuffer();
    
    // Decode the ArrayBuffer to get the AudioBuffer
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    return audioBuffer;
  }

  loadWavFile = async (audioContext) => {
    try {
      const response = await fetch('./pumpkin_FL.wav');
      // console.log("yay")
      const arrayBuffer = await response.arrayBuffer();
      const wavBuffer = await audioContext.decodeAudioData(arrayBuffer);

      // Create a buffer source node for looping
      const audioSource = audioContext.createBufferSource();
      audioSource.buffer = wavBuffer;
      audioSource.loop = true; // Loop the audio

      // Connect to the destination (speakers)
      audioSource.connect(audioContext.destination);
      audioSource.start(0); // Start playback immediately

      this.setState({ wavBuffer, audioSource });
    } catch (error) {
      console.error('Error loading .wav file:', error);
    }
  };

  playIncomingAudio(audioBuffer) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Create an AudioBufferSourceNode and connect it to the audio context
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    
    // Create a MediaStreamAudioDestinationNode to generate the stream
    const destination = audioContext.createMediaStreamDestination();
    
    // Connect the source to the destination
    source.connect(destination);
    
    // Start playing the audio
    source.start();
    
    // You now have a MediaStream (destination.stream) that you can use for WebRTC
    const mediaStream = destination.stream;
    
    // Here you can attach `mediaStream` to your WebRTC connection
    this.sendAudioToWebRTC(mediaStream);
  }

  sendAudioToWebRTC(mediaStream) {
    const { localConnection } = this.state;

    // Add the audio stream to the peer connection
    mediaStream.getAudioTracks().forEach(track => {
      localConnection.addTrack(track, mediaStream);
    });

    // Send the offer to the remote peer
    localConnection.createOffer().then(offer => {
      localConnection.setLocalDescription(offer);}
    );
  }
  

  shouldComponentUpdate (nextProps, nextState) {
    if (this.state.database !== nextState.database) {
      return false;
    }
    if (this.state.localStream !== nextState.localStream) {
      return false;
    }
    if (this.state.localConnection !== nextState.localConnection) {
      return false;
    }
    return true;
  }

  startCall = async (username, userToCall) => {
    const { localConnection, database, localStream } = this.state;
    listenToConnectionEvents(localConnection, username, userToCall, database, this.remoteVideoRef, doCandidate);

    createOffer(localConnection, localStream, userToCall, doOffer, database, username);
  };

  onLogin = async (username) => {
    return await doLogin(username, this.state.database, this.handleUpdate);
  };

  setLocalVideoRef = ref => {
    this.localVideoRef = ref;
  };

  setRemoteVideoRef = ref => {
    this.remoteVideoRef = ref;
  };

  handleUpdate = (notif, username) => {
    const { localConnection, database, localStream } = this.state;

    if (notif) {
      switch (notif.type) {
        case 'offer':
          this.setState({ connectedUser: notif.from });
          listenToConnectionEvents(localConnection, username, notif.from, database, this.remoteVideoRef, doCandidate);
          sendAnswer(localConnection, localStream, notif, doAnswer, database, username);
          break;
        case 'answer':
          this.setState({ connectedUser: notif.from });
          startCall(localConnection, notif);
          break;
        case 'candidate':
          addCandidate(localConnection, notif);
          break;
        default:
          break;
      }
    }
  };

  render () {
    return (
      <VideoChat
        startCall={this.startCall}
        onLogin={this.onLogin}
        setLocalVideoRef={this.setLocalVideoRef}
        setRemoteVideoRef={this.setRemoteVideoRef}
        connectedUser={this.state.connectedUser}
      />
    );
  }
}

export default VideoChatContainer;
