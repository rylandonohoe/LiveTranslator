import React from 'react'; // Add React import to resolve JSX errors
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
      mediaStream: null,
    }
    this.localVideoRef = React.createRef()
    this.remoteVideoRef = React.createRef()
  }

  createAudioTrackFromBuffer = async (audioContext, arrayBuffer) => {
    try {
      // Decode audio data
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  
      // Create audio destination to generate a media stream track
      const audioDestination = audioContext.createMediaStreamDestination();
  
      // Create buffer source and connect to destination
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioDestination);
      source.start();
  
      // Return the first audio track from the generated stream
      return audioDestination.stream.getAudioTracks()[0];
    } catch (error) {
      console.error('Error creating audio track:', error);
      return null;
    }
  };
  
  createMediaStreamFromArrayBuffer = async (arrayBuffer) => {
    const { audioContext } = this.state;
    
    try {
      // Decode the audio data into an AudioBuffer
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      const audioSource = audioContext.createBufferSource();
      audioSource.buffer = audioBuffer;
  
      // Create a MediaStream destination
      const destination = audioContext.createMediaStreamDestination();
  
      // Connect the audio source to the destination
      audioSource.connect(destination);
      audioSource.start();
  
      // Return the MediaStream from the destination
      return destination.stream;
    } catch (error) {
      console.error('Error creating media stream:', error);
      return null;
    }
  };

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
      sendAudioStream(localStream, websocket); // Still send the audio data for other purposes
    };

    websocket.onmessage = async (event) => {
      console.log('Received message:', event.data);
    
      if (typeof event.data === 'string') {
        console.log('Metadata:', event.data);
        return;
      }
  
      try {
        // Handle blob or arraybuffer data
        const arrayBuffer = event.data instanceof Blob 
          ? await event.data.arrayBuffer() 
          : event.data;
  
        // Create audio track
        const audioTrack = await this.createAudioTrackFromBuffer(this.state.audioContext, arrayBuffer);
        
        if (!audioTrack) {
          console.error('Failed to create audio track');
          return;
        }
  
        // Create media stream with the audio track
        const modifiedMediaStream = new MediaStream([audioTrack]);
  
        if (this.remoteVideoRef) {
          // Combine incoming audio with existing stream
          const combinedStream = new MediaStream();
          
          // Add incoming audio track
          modifiedMediaStream.getTracks().forEach(track => combinedStream.addTrack(track));
  
          // Preserve existing video tracks if present
          if (this.state.localStream) {
            this.state.localStream.getVideoTracks().forEach(track => combinedStream.addTrack(track));
          }
          // this.setState({ localStream: combinedStream });
          // const senders = this.state.localConnection.getSenders();
          // const audioSender = senders.find(sender => sender.track.kind === 'audio');
          // if (audioSender) {
          //   audioSender.replaceTrack(audioTrack);
          // } else {
          //   this.state.localConnection.addTrack(audioTrack, combinedStream);
          // }
  
          // Update remote video source
          this.state.localStream = combinedStream;
          this.remoteVideoRef.srcObject = combinedStream;
          console.log('Updated remote video srcObject:', this.remoteVideoRef.srcObject);
        } else {
          console.error('remoteVideoRef is undefined');
        }
      } catch (error) {
        console.error('Error processing incoming audio data:', error);
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

  playIncomingAudio = async (audioBuffer) => {
    try {
      // Here you can collect the incoming audio data (for monitoring or other purposes)
      // But don't play it through speakers
      console.log('Processing live audio data...');

      // If needed, you could store or process the incoming audio data here.
    } catch (error) {
      console.error('Error processing incoming audio:', error);
    }
  };
  // createMediaStreamFromArrayBuffer = (arrayBuffer) => {
  //   const audioContext = this.state.audioContext;
  
  //   // Decode the audio data into an AudioBuffer
  //   return audioContext.decodeAudioData(arrayBuffer).then((audioBuffer) => {
  //     const audioSource = audioContext.createBufferSource();
  //     audioSource.buffer = audioBuffer;
  
  //     // Create a MediaStream destination
  //     const destination = audioContext.createMediaStreamDestination();
  
  //     // Connect the audio source to the destination
  //     audioSource.connect(destination);
  //     audioSource.start();
  
  //     // Return the MediaStream from the destination
  //     return destination.stream;
  //   });
  // };
  

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
    const { localConnection, database, localStream, mediaStream } = this.state;

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
