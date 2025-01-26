export const createOffer = async (connection, localStream, userToCall, doOffer, database, username) => {
    try {
      connection.addStream(localStream)
  
      const offer = await connection.createOffer()
      await connection.setLocalDescription(offer)
  
      doOffer(userToCall, offer, database, username)
    } catch (exception) {
      console.error(exception)
    }
  }
  
  export const initiateLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: {echoCancellation: true, noiseSuppression: true}
      })
      return stream
    } catch (exception) {
      console.error(exception)
    }
  }
  export const initiateConnection = async () => {
    try {
      // using Google public stun server
      var configuration = {
        iceServers: [{ urls: 'stun:stun2.1.google.com:19302' }]
      }
  
      const conn = new RTCPeerConnection(configuration)
  
      return conn
    } catch (exception) {
      console.error(exception)
    }
  }
<<<<<<< HEAD
  
  export const sendAudioStream = async (audioStream, websocket) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioContext.createMediaStreamSource(audioStream);
    const processor = audioContext.createScriptProcessor(4096, 1, 1);
  
    processor.onaudioprocess = (event) => {
      const audioData = event.inputBuffer.getChannelData(0); // Get the audio data
      const audioBuffer = new Float32Array(audioData.length);
      audioBuffer.set(audioData);
  
      // Send the audio buffer over WebSocket
      websocket.send(audioBuffer.buffer);
    };
  
    source.connect(processor);
    processor.connect(audioContext.destination);
=======
}

 export const sendAudioStream = async (audioStream, websocket) => {
   const audioContext = new (window.AudioContext || window.webkitAudioContext)();
   const source = audioContext.createMediaStreamSource(audioStream);
   const processor = audioContext.createScriptProcessor(4096, 1, 1);

   processor.onaudioprocess = (event) => {
     const audioData = event.inputBuffer.getChannelData(0); // Get the audio data
     const audioBuffer = new Float32Array(audioData.length);
     audioBuffer.set(audioData);

     // Send the audio buffer over WebSocket
     websocket.send(audioBuffer.buffer);
   };

   source.connect(processor);
   processor.connect(audioContext.destination);
 };

const arrayBufferToBase64 = (buffer) => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const length = bytes.byteLength;
  for (let i = 0; i < length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
};

//export const sendAudioStream = async (audioStream, websocket, selectedLang) => {
//  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
//  const source = audioContext.createMediaStreamSource(audioStream);
//  const processor = audioContext.createScriptProcessor(4096, 1, 1);
//  console.log(selectedLang);
//
//  processor.onaudioprocess = (event) => {
//    const audioData = event.inputBuffer.getChannelData(0); // Get the audio data
//    const audioBuffer = new Float32Array(audioData.length);
//    audioBuffer.set(audioData);
//    const audioBase64 = arrayBufferToBase64(audioBuffer.buffer);
//
//    // Create a JSON object with the audio and selected language
//    const message = {
//      audio: audioBase64,
//      language: selectedLang
//    };
//
//    // Send the audio buffer over WebSocket
//    websocket.send(JSON.stringify(message));
//  };
//
//  source.connect(processor);
//  processor.connect(audioContext.destination);
//};

export const listenToConnectionEvents = (conn, username, remoteUsername, database, remoteVideoRef, doCandidate) => {
  conn.onicecandidate = function (event) {
    if (event.candidate) {
      doCandidate(remoteUsername, event.candidate, database, username)
    }
  }

  // when a remote user adds stream to the peer connection, we display it
  conn.ontrack = function (e) {
    const [remoteStream] = e.streams;
    const remoteAudioStream = new MediaStream(remoteStream.getAudioTracks());
    
    if (!remoteVideoRef.srcObject) {
      remoteVideoRef.srcObject = remoteAudioStream;
    }
>>>>>>> 14c31707fec00f95fff0a52d217bf74e05ac4ac4
  };
  
  export const listenToConnectionEvents = (conn, username, remoteUsername, database, remoteVideoRef, doCandidate) => {
    conn.onicecandidate = function (event) {
      if (event.candidate) {
        doCandidate(remoteUsername, event.candidate, database, username)
      }
    }
  
  
    // when a remote user adds stream to the peer connection, we display it
    conn.ontrack = function (e) {
      const [remoteStream] = e.streams;
      const remoteAudioStream = new MediaStream(remoteStream.getAudioTracks());
  }
  }
  
  export const sendAnswer = async (conn, localStream, notif, doAnswer, database, username) => {
    try {
    conn.addStream(localStream)
    conn.ontrack = (event) => {
      const [remoteStream] = event.streams;
      if (this.remoteVideoRef) {
        this.remoteVideoRef.srcObject = remoteStream;
      }
    };
      const offer = JSON.parse(notif.offer)
      conn.setRemoteDescription(offer)
  
      // create an answer to an offer
      const answer = await conn.createAnswer()
      conn.setLocalDescription(answer)
  
      doAnswer(notif.from, answer, database, username)
    } catch (exception) {
      console.error(exception)
    }
  }
  
  export const startCall = (yourConn, notif) => {
    const answer = JSON.parse(notif.answer)
    yourConn.setRemoteDescription(answer)
  }
  
  export const addCandidate = (yourConn, notif) => {
    // apply the new received candidate to the connection
    const candidate = JSON.parse(notif.candidate)
    yourConn.addIceCandidate(new RTCIceCandidate(candidate))
  }
  