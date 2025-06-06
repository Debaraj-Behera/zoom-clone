import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import TextField from "@mui/material/TextField";
import { Badge, Button, IconButton } from "@mui/material";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import CallEndIcon from "@mui/icons-material/CallEnd";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare";
import ChatIcon from "@mui/icons-material/Chat";
import SendIcon from "@mui/icons-material/Send";

import io from "socket.io-client";
import styles from "../styles/videoComponent.module.css";
import server from "../environment";

const server_url = server;
const peerConfigConnections = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

let connections = {};

export default function VideoMeetComponent() {
  const socketRef = useRef();
  const socketIdRef = useRef();
  const localVideoRef = useRef();
  const videoRef = useRef([]); // Fixed
  const routeTo = useNavigate();

  const [videoAvailable, setVideoAvailable] = useState(true);
  const [audioAvailable, setAudioAvailable] = useState(true);
  const [video, setVideo] = useState(true);
  const [audio, setAudio] = useState(true);
  const [screen, setScreen] = useState(false);
  const [screenAvailable, setScreenAvailable] = useState(false);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [showModel, setShowModel] = useState(false);
  const [username, setUsername] = useState("");
  const [askForUsername, setAskForUsername] = useState(true);
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    getPermissions();
  }, []);

  const getPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setVideoAvailable(true);
      setAudioAvailable(true);
      window.localStream = stream;
      localVideoRef.current.srcObject = stream;
    } catch (e) {
      setVideoAvailable(false);
      setAudioAvailable(false);
      console.error("Permission error:", e);
    }

    setScreenAvailable(!!navigator.mediaDevices.getDisplayMedia);
  };

  const black = ({ width = 640, height = 480 } = {}) => {
    const canvas = Object.assign(document.createElement("canvas"), { width, height });
    canvas.getContext("2d").fillRect(0, 0, width, height);
    const stream = canvas.captureStream();
    return Object.assign(stream.getVideoTracks()[0], { enabled: false });
  };

  const silence = () => {
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const dst = oscillator.connect(ctx.createMediaStreamDestination());
    oscillator.start();
    return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
  };

  const blackSilence = () => new MediaStream([black(), silence()]);

  const getUserMedia = () => {
    if ((video && videoAvailable) || (audio && audioAvailable)) {
      navigator.mediaDevices
        .getUserMedia({ video, audio })
        .then(stream => getUserMediaSuccess(stream))
        .catch(e => console.error("Media error:", e));
    } else {
      if (localVideoRef.current?.srcObject) {
        localVideoRef.current.srcObject.getTracks().forEach(t => t.stop());
      }
      const fakeStream = blackSilence();
      localVideoRef.current.srcObject = fakeStream;
      window.localStream = fakeStream;
    }
  };

  const getUserMediaSuccess = (stream) => {
    try {
      window.localStream?.getTracks().forEach(track => track.stop());
    } catch (e) {
      console.error(e);
    }

    window.localStream = stream;
    localVideoRef.current.srcObject = stream;

    for (const id in connections) {
      if (id === socketIdRef.current) continue;
      const conn = connections[id];
      conn.addStream(stream);
      conn.createOffer().then(desc => {
        conn.setLocalDescription(desc).then(() => {
          socketRef.current.emit("signal", id, JSON.stringify({ sdp: conn.localDescription }));
        });
      });
    }

    stream.getTracks().forEach(track => {
      track.onended = () => {
        const fallback = blackSilence();
        localVideoRef.current.srcObject = fallback;
        window.localStream = fallback;
        getUserMedia();
      };
    });
  };

  const gotMessageFromServer = (fromId, message) => {
    const signal = JSON.parse(message);
    if (fromId === socketIdRef.current) return;

    const conn = connections[fromId];
    if (signal.sdp) {
      conn.setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
        if (signal.sdp.type === "offer") {
          conn.createAnswer().then(desc => {
            conn.setLocalDescription(desc).then(() => {
              socketRef.current.emit("signal", fromId, JSON.stringify({ sdp: desc }));
            });
          });
        }
      });
    }

    if (signal.ice) {
      conn.addIceCandidate(new RTCIceCandidate(signal.ice));
    }
  };

  const connectToSocketServer = () => {
    socketRef.current = io.connect(server_url);
    socketRef.current.on("signal", gotMessageFromServer);
    socketRef.current.on("connect", () => {
      socketIdRef.current = socketRef.current.id;
      socketRef.current.emit("join-call", window.location.href);
      socketRef.current.on("chat-message", addMessage);
      socketRef.current.on("user-left", (id) => {
        setVideos(prev => prev.filter(v => v.socketId !== id));
      });
      socketRef.current.on("user-joined", (id, clients) => {
        clients.forEach(socketListId => {
          if (connections[socketListId]) return;

          const conn = new RTCPeerConnection(peerConfigConnections);
          connections[socketListId] = conn;

          conn.onicecandidate = (e) => {
            if (e.candidate) {
              socketRef.current.emit("signal", socketListId, JSON.stringify({ ice: e.candidate }));
            }
          };

          conn.onaddstream = (event) => {
            const newVideo = {
              socketId: socketListId,
              stream: event.stream,
            };
            setVideos(prev => [...prev.filter(v => v.socketId !== socketListId), newVideo]);
            videoRef.current = [...videoRef.current.filter(v => v.socketId !== socketListId), newVideo];
          };

          conn.addStream(window.localStream || blackSilence());
        });

        if (id === socketIdRef.current) {
          for (let id2 in connections) {
            if (id2 === socketIdRef.current) continue;
            const conn = connections[id2];
            conn.addStream(window.localStream || blackSilence());
            conn.createOffer().then(desc => {
              conn.setLocalDescription(desc).then(() => {
                socketRef.current.emit("signal", id2, JSON.stringify({ sdp: desc }));
              });
            });
          }
        }
      });
    });
  };

  const addMessage = (data, sender, socketIdSender) => {
    setMessages(prev => [...prev, { sender, data }]);
  };

  const connect = () => {
    setAskForUsername(false);
    getUserMedia();
    connectToSocketServer();
  };

  const handleEndCall = () => {
    try {
      localVideoRef.current.srcObject?.getTracks().forEach(track => track.stop());
    } catch (e) {
      console.error("End call error:", e);
    }
    routeTo("/home");
  };

  const handleScreen = () => {
    setScreen(prev => !prev);
  };

  const getDisplayMedia = () => {
    if (!screen) return;

    navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
      .then(getDisplayMediaSuccess)
      .catch(e => console.error(e));
  };

  const getDisplayMediaSuccess = (stream) => {
    localVideoRef.current.srcObject?.getTracks().forEach(t => t.stop());
    localVideoRef.current.srcObject = stream;
    window.localStream = stream;

    for (const id in connections) {
      if (id === socketIdRef.current) continue;
      const conn = connections[id];
      conn.addStream(stream);
      conn.createOffer().then(desc => {
        conn.setLocalDescription(desc).then(() => {
          socketRef.current.emit("signal", id, JSON.stringify({ sdp: desc }));
        });
      });
    }

    stream.getTracks().forEach(track => {
      track.onended = () => {
        const fallback = blackSilence();
        localVideoRef.current.srcObject = fallback;
        window.localStream = fallback;
        getUserMedia();
      };
    });
  };

  useEffect(() => {
    if (screen) {
      getDisplayMedia();
    }
  }, [screen]);

  const sendMessage = () => {
    if (message.trim()) {
      socketRef.current.emit("chat-message", message, username);
      setMessage("");
    }
  };

  return (
    <div>
      {askForUsername ? (
        <div className={styles.lobbyContainer}>
          <h2 className={styles.lobbyHeader}>Enter Into Lobby</h2>
          <div className={styles.lobbyForm}>
            <TextField
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <Button variant="contained" onClick={connect}>
              Connect
            </Button>
          </div>
          <video ref={localVideoRef} autoPlay muted className={styles.lobbyVideo}></video>
        </div>
      ) : (
        <div className={styles.meetVideoContainer}>
          {showModel && (
            <div className={styles.chatRoom}>
              <div className={styles.chatContainer}>
                <h1>Chat</h1>
                <div className={styles.chattingDisplay}>
                  {messages.map((msg, idx) => (
                    <div key={idx}>
                      <p><strong>{msg.sender}</strong>: {msg.data}</p>
                    </div>
                  ))}
                </div>
                <div className={styles.chattingArea}>
                  <input
                    type="text"
                    placeholder="Write a message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    className={styles.messageInput}
                  />
                  <button onClick={sendMessage} className={styles.sendButton}><SendIcon /></button>
                </div>
              </div>
            </div>
          )}
          <div className={styles.buttonContainer}>
            <IconButton onClick={() => setVideo(v => !v)} style={{ color: "white" }}>
              {video ? <VideocamIcon /> : <VideocamOffIcon />}
            </IconButton>
            <IconButton onClick={handleEndCall} style={{ color: "red" }}>
              <CallEndIcon />
            </IconButton>
            <IconButton onClick={() => setAudio(a => !a)} style={{ color: "white" }}>
              {audio ? <MicIcon /> : <MicOffIcon />}
            </IconButton>
            {screenAvailable && (
              <IconButton onClick={handleScreen} style={{ color: "white" }}>
                {screen ? <StopScreenShareIcon /> : <ScreenShareIcon />}
              </IconButton>
            )}
            <Badge badgeContent={showModel ? 0 : messages.length} color="secondary">
              <IconButton onClick={() => setShowModel(!showModel)} style={{ color: "white" }}>
                <ChatIcon />
              </IconButton>
            </Badge>
          </div>

          <video ref={localVideoRef} autoPlay muted className={styles.meetUserVideo}></video>
          <div className={styles.conferenceView}>
            {videos.map((video) => (
              <div key={video.socketId}>
                <h3>{video.socketId}</h3>
                <video
                  autoPlay
                  playsInline
                  ref={(ref) => {
                    if (ref && video.stream) {
                      ref.srcObject = video.stream;
                    }
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
