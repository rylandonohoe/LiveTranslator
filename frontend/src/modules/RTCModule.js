
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
      audio: {
        echoCancellation: { ideal: true },
        noiseSuppression: { ideal: true },
        autoGainControl: { ideal: true }
      }
    })

    // Mute audio tracks to prevent self-hearing
    stream.getAudioTracks().forEach(track => {
      track.enabled = false;
    });

    return stream;
  } catch (exception) {
    console.error(exception)
  }
}

export const toggleAudioMute = (localStream) => {
  const audioTracks = localStream.getAudioTracks();
  audioTracks.forEach(track => {
    track.enabled = !track.enabled;
  });
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


export const listenToConnectionEvents = (conn, username, remoteUsername, database, remoteVideoRef, doCandidate) => {
  conn.onicecandidate = function (event) {
    if (event.candidate) {
      doCandidate(remoteUsername, event.candidate, database, username)
    }
  }

  // when a remote user adds stream to the peer connection, we display it
  conn.ontrack = function (e) {
    if (remoteVideoRef.srcObject !== e.streams[0]) {
      remoteVideoRef.srcObject = e.streams[0]
    }
  }
}

export const sendAnswer = async (conn, localStream, notif, doAnswer, database, username) => {
  try {
    conn.addStream(localStream)

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