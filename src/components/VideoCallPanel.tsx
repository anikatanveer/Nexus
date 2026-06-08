import React, { useEffect, useRef, useState } from 'react';
import { Button } from './ui/Button';
import { Card, CardBody, CardHeader } from './ui/Card';
import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';

export const VideoCallPanel: React.FC = () => {
  const [callActive, setCallActive] = useState(false);
  const [callType, setCallType] = useState<'video' | 'audio'>('video');
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Ready to start a call.');
  const [webrtcSupported, setWebrtcSupported] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const localPcRef = useRef<RTCPeerConnection | null>(null);
  const remotePcRef = useRef<RTCPeerConnection | null>(null);

  useEffect(() => {
    setWebrtcSupported(
      typeof navigator !== 'undefined' &&
      !!navigator.mediaDevices?.getUserMedia &&
      typeof RTCPeerConnection === 'function'
    );
  }, []);

  const handleRequestAccess = async () => {
    if (!webrtcSupported) {
      setStatusMessage('WebRTC not supported in this browser.');
      return;
    }

    const requestMessage = callType === 'audio'
      ? 'Requesting microphone permission…'
      : 'Requesting camera and microphone permission…';

    setStatusMessage(requestMessage);

    try {
      const stream = await navigator.mediaDevices.getUserMedia(
        callType === 'audio' ? { audio: true } : { video: true, audio: true }
      );

      stream.getTracks().forEach(track => track.stop());
      setPermissionGranted(true);
      setStatusMessage('Access granted. You can now start the call.');
    } catch (error) {
      console.error(error);
      setPermissionGranted(false);
      setStatusMessage('Access denied. Please allow permissions to use the call feature.');
    }
  };

  const handleStartCall = async () => {
    if (!webrtcSupported) {
      setStatusMessage('WebRTC not supported in this browser.');
      return;
    }

    const requestingMessage = callType === 'audio'
      ? 'Starting audio call… requesting microphone.'
      : 'Starting video call… requesting camera and microphone.';

    setStatusMessage(requestingMessage);

    try {
      const stream = await navigator.mediaDevices.getUserMedia(
        callType === 'audio' ? { audio: true } : { video: true, audio: true }
      );
      localStreamRef.current = stream;

if (callType === 'video' && localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const localPc = new RTCPeerConnection();
      const remotePc = new RTCPeerConnection();
      localPcRef.current = localPc;
      remotePcRef.current = remotePc;

      stream.getTracks().forEach(track => localPc.addTrack(track, stream));

      remotePc.ontrack = event => {
        if (event.streams[0]) {
          if (callType === 'audio') {
            if (remoteAudioRef.current) {
              remoteAudioRef.current.srcObject = event.streams[0];
            }
          } else if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
          }
        }
      };

      localPc.onicecandidate = event => {
        if (event.candidate) {
          remotePc.addIceCandidate(event.candidate).catch(console.error);
        }
      };

      remotePc.onicecandidate = event => {
        if (event.candidate) {
          localPc.addIceCandidate(event.candidate).catch(console.error);
        }
      };

      const offer = await localPc.createOffer();
      await localPc.setLocalDescription(offer);
      await remotePc.setRemoteDescription(offer);

      const answer = await remotePc.createAnswer();
      await remotePc.setLocalDescription(answer);
      await localPc.setRemoteDescription(answer);

      setCallActive(true);
      setVideoEnabled(callType === 'video');
      setAudioEnabled(true);
      setPermissionGranted(true);
      setStatusMessage(
        callType === 'audio'
          ? 'Audio call connected. Microphone is active.'
          : 'Call connected. Your camera and microphone are active.'
      );
    } catch (error) {
      console.error(error);
      setStatusMessage('Unable to start the call. Please allow camera and mic access and try again.');
    }
  };

  const handleEndCall = () => {
    if (localPcRef.current) {
      localPcRef.current.close();
      localPcRef.current = null;
    }

    if (remotePcRef.current) {
      remotePcRef.current.close();
      remotePcRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null;
    }

    setCallActive(false);
    setVideoEnabled(true);
    setAudioEnabled(true);
    setStatusMessage('Call ended. Ready to start another session.');
  };

  const toggleAudio = () => {
    if (!localStreamRef.current) return;
    localStreamRef.current.getAudioTracks().forEach(track => {
      track.enabled = !audioEnabled;
    });
    setAudioEnabled(prev => !prev);
    setStatusMessage(audioEnabled ? 'Microphone muted.' : 'Microphone unmuted.');
  };

  const toggleVideo = () => {
    if (!localStreamRef.current || callType === 'audio') return;
    localStreamRef.current.getVideoTracks().forEach(track => {
      track.enabled = !videoEnabled;
    });
    setVideoEnabled(prev => !prev);
    setStatusMessage(videoEnabled ? 'Video turned off.' : 'Video turned on.');
  };

  return (
    <Card className="border border-slate-200 shadow-sm">
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Audio & Video Call</h2>
            <p className="text-sm text-slate-500">Choose audio or video, then start a call with local controls.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              {callActive ? 'In call' : 'Ready'}
            </span>
            <div className="flex items-center rounded-full border border-slate-200 bg-white px-2 py-1">
              <Button
                variant={callType === 'video' ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => setCallType('video')}
                disabled={callActive}
              >
                Video
              </Button>
              <Button
                variant={callType === 'audio' ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => setCallType('audio')}
                disabled={callActive}
              >
                Audio
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardBody className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-2">
          {callType === 'video' ? (
            <>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                {callActive ? (
                  <video
                    ref={localVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className="h-64 w-full rounded-3xl bg-black object-cover"
                  />
                ) : (
                  <div className="h-64 w-full rounded-3xl border border-dashed border-slate-300 bg-white grid place-items-center text-slate-500">
                    Local camera preview will appear here.
                  </div>
                )}
                <div className="mt-3 text-sm text-slate-700">Local preview</div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                {callActive ? (
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="h-64 w-full rounded-3xl bg-black object-cover"
                  />
                ) : (
                  <div className="h-64 w-full rounded-3xl border border-dashed border-slate-300 bg-white grid place-items-center text-slate-500">
                    Remote participant video will appear here.
                  </div>
                )}
                <div className="mt-3 text-sm text-slate-700">Remote mock peer</div>
              </div>
            </>
          ) : (
            <>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-slate-700 text-sm">
                <p className="font-semibold text-slate-900">Local audio source</p>
                <p className="mt-2">Microphone will transmit audio once the call starts.</p>
                <p className="mt-2 text-xs text-slate-500">No black preview box is shown in audio mode.</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-slate-700 text-sm">
                <p className="font-semibold text-slate-900">Remote audio peer</p>
                <p className="mt-2">This panel represents the remote participant in the audio call.</p>
                <p className="mt-2 text-xs text-slate-500">Only voice is transmitted in audio mode.</p>
              </div>
            </>
          )}
        </div>

        <audio ref={remoteAudioRef} autoPlay className="hidden" />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2 text-sm text-slate-600">
            <p className="font-medium text-slate-900">Status</p>
            <p>{statusMessage}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              variant={callActive ? 'secondary' : 'primary'}
              onClick={callActive ? handleEndCall : handleStartCall}
              leftIcon={callActive ? <PhoneOff size={16} /> : (callType === 'audio' ? <Mic size={16} /> : <Video size={16} />)}
            >
              {callActive ? 'End call' : 'Start call'}
            </Button>
            <Button
              variant="outline"
              onClick={handleRequestAccess}
              leftIcon={<Mic size={16} />}
              disabled={callActive}
            >
              Allow access
            </Button>
            <Button
              variant="outline"
              onClick={toggleAudio}
              leftIcon={audioEnabled ? <Mic size={16} /> : <MicOff size={16} />}
              disabled={!callActive}
            >
              {audioEnabled ? 'Mute audio' : 'Unmute audio'}
            </Button>
            {callType === 'video' ? (
              <Button
                variant="outline"
                onClick={toggleVideo}
                leftIcon={videoEnabled ? <Video size={16} /> : <VideoOff size={16} />}
                disabled={!callActive}
              >
                {videoEnabled ? 'Stop video' : 'Start video'}
              </Button>
            ) : null}
          </div>
        </div>
      </CardBody>
    </Card>
  );
};
