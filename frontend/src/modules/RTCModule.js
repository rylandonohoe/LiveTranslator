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
          const [remoteStream] = e.streams;
          const remoteAudioStream = new MediaStream(remoteStream.getAudioTracks());
          
          if (!remoteVideoRef.srcObject) {
            remoteVideoRef.srcObject = remoteAudioStream;
          }
        };
        
         conn.ontrack = function (e) {
           if (remoteVideoRef.srcObject !== e.streams[0]) {
             remoteVideoRef.srcObject = e.streams[0]
           }
         }
      }
      
      export const sendAnswer = async (conn, localStream, notif, doAnswer, database, username) => {
        try {
        const websocket = new WebSocket('ws://localhost:5000');
            
            websocket.onopen = () => {
          console.log('WebSocket connected');
          sendAudioStream(localStream, websocket); // Still send the audio data for other purposes
        };
        let combinedStream = new MediaStream();
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
              // const combinedStream = new MediaStream();
              
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
              //   audioSender.replaceTrack(audioTrack);
              // } else {
              //   this.state.localConnection.addTrack(audioTrack, combinedStream);
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
    
    
    
    
          conn.addStream(combinedStream)
      
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