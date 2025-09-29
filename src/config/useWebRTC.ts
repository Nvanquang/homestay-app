import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { notification } from 'antd';
import { useChatWebSocket, CallSignal } from '@/contexts/ChatWebSocketContext';

export type CallState = 'IDLE' | 'OUTGOING' | 'INCOMING' | 'CONNECTED' | 'ENDING';

interface UseWebRTCParams {
  conversationId: string;
  localUserId: string;
  remoteUserId?: string; // optional for 1-1; backend can route by conversation
}

interface UseWebRTCResult {
  callState: CallState;
  isVideo: boolean;
  isCaller: boolean;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  muted: boolean;
  cameraOff: boolean;
  hasConnected: boolean;
  incomingCall: { fromUserId: string; isVideo: boolean } | null;
  startCall: (isVideo: boolean) => Promise<void>;
  acceptCall: () => Promise<void>;
  rejectCall: () => Promise<void>;
  endCall: () => Promise<void>;
  toggleMute: () => void;
  toggleCamera: () => void;
  getLastCallDurationSeconds: () => number | null;
}

export function useWebRTC({ conversationId, localUserId, remoteUserId }: UseWebRTCParams): UseWebRTCResult {
  const { sendCallSignal, onCallSignalReceived } = useChatWebSocket();

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const [localStreamState, setLocalStreamState] = useState<MediaStream | null>(null);
  const [remoteStreamState, setRemoteStreamState] = useState<MediaStream | null>(null);
  const isCallerRef = useRef<boolean>(false);
  const hasConnectedRef = useRef<boolean>(false);
  const [callState, setCallState] = useState<CallState>('IDLE');
  const [isVideo, setIsVideo] = useState<boolean>(true);
  const [incomingCall, setIncomingCall] = useState<{ fromUserId: string; isVideo: boolean } | null>(null);
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const startTimeRef = useRef<number | null>(null);
  const incomingNotifyKeyRef = useRef<string>(`incoming-${conversationId}`);

  useEffect(() => {
    incomingNotifyKeyRef.current = `incoming-${conversationId}`;
  }, [conversationId]);

  // Create/Recreate RTCPeerConnection and bind handlers
  const reInitPeer = useCallback((): RTCPeerConnection => {
    if (pcRef.current) {
      try { pcRef.current.close(); } catch {}
    }
    const peer = new RTCPeerConnection({
      iceServers: [ { urls: 'stun:stun.l.google.com:19302' } ]
    });
    pcRef.current = peer;

    // Bind track -> update remote stream state
    peer.addEventListener('track', (e: RTCTrackEvent) => {
      if (!remoteStreamRef.current) {
        remoteStreamRef.current = new MediaStream();
      }
      const [stream] = e.streams;
      remoteStreamRef.current = stream ?? remoteStreamRef.current;
      setRemoteStreamState(remoteStreamRef.current);
    });

    // Bind ICE
    peer.addEventListener('icecandidate', (e: RTCPeerConnectionIceEvent) => {
      if (e.candidate) {
        const signal: CallSignal = {
          conversationId,
          fromUserId: localUserId,
          toUserId: remoteUserId,
          type: 'CANDIDATE',
          payload: e.candidate.toJSON(),
          isVideo,
          timestamp: Date.now(),
        };
        sendCallSignal(signal).catch(() => {});
      }
    });

    return peer;
  }, [conversationId, localUserId, remoteUserId, sendCallSignal, isVideo]);

  const cleanup = useCallback(() => {
    pcRef.current?.close();
    pcRef.current = null;
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    localStreamRef.current = null;
    remoteStreamRef.current = null;
    setMuted(false);
    setCameraOff(false);
  }, []);

  // No global effects for track/ICE; binding happens in reInitPeer()

  // Listen signaling
  useEffect(() => {
    onCallSignalReceived(async (signal) => {
      // Debug log
      // eslint-disable-next-line no-console
      if (signal.conversationId !== conversationId) return;
      const localIdStr = (localUserId as any)?.toString?.() ?? (localUserId as any);
      const fromIdStr = (signal.fromUserId as any)?.toString?.() ?? signal.fromUserId;
      const toIdStr = signal.toUserId ? ((signal.toUserId as any)?.toString?.() ?? signal.toUserId) : undefined;
      // Ignore self-sent signals
      if (fromIdStr === localIdStr) return;
      // If routing is targeted and I'm not the target, ignore
      if (toIdStr && toIdStr !== localIdStr) return;

      switch (signal.type) {
        case 'CALL_INIT': {
          setIncomingCall({ fromUserId: signal.fromUserId, isVideo: !!signal.isVideo });
          setIsVideo(!!signal.isVideo);
          setCallState('INCOMING');
          try {
            notification.open({
              key: incomingNotifyKeyRef.current,
              message: signal.isVideo ? 'Cuộc gọi video đến' : 'Cuộc gọi thoại đến',
              description: 'Người kia đang gọi cho bạn. Vào cửa sổ chat để trả lời.',
              duration: 0
            });
          } catch {}
          break;
        }
        case 'CALL_ACCEPT': {
          // callee accepted -> create and send offer
          try {
            let peer = pcRef.current;
            if (!peer || peer.signalingState === 'closed') peer = reInitPeer();
            const offer = await peer!.createOffer();
            await peer!.setLocalDescription(offer);
            // eslint-disable-next-line no-console
            await sendCallSignal({
              conversationId,
              fromUserId: localUserId,
              toUserId: signal.fromUserId,
              type: 'OFFER',
              payload: offer,
              isVideo,
              timestamp: Date.now()
            });
          } catch {}
          break;
        }
        case 'CALL_REJECT': {
          setCallState('IDLE');
          setIncomingCall(null);
          cleanup();
          break;
        }
        case 'OFFER': {
          try {
            let peer = pcRef.current;
            if (!peer || peer.signalingState === 'closed') peer = reInitPeer();
            await peer!.setRemoteDescription(new RTCSessionDescription(signal.payload));
            const answer = await peer!.createAnswer();
            await peer!.setLocalDescription(answer);
            // eslint-disable-next-line no-console
            await sendCallSignal({
              conversationId,
              fromUserId: localUserId,
              toUserId: signal.fromUserId,
              type: 'ANSWER',
              payload: answer,
              isVideo,
              timestamp: Date.now()
            });
            setCallState('CONNECTED');
            startTimeRef.current = Date.now();
            hasConnectedRef.current = true;
          } catch {}
          break;
        }
        case 'ANSWER': {
          try {
            let peer = pcRef.current;
            if (!peer || peer.signalingState === 'closed') peer = reInitPeer();
            await peer!.setRemoteDescription(new RTCSessionDescription(signal.payload));
            setCallState('CONNECTED');
            startTimeRef.current = Date.now();
            hasConnectedRef.current = true;
          } catch {}
          break;
        }
        case 'CANDIDATE': {
          try {
            let peer = pcRef.current;
            if (!peer || peer.signalingState === 'closed') peer = reInitPeer();
            await peer!.addIceCandidate(new RTCIceCandidate(signal.payload));
          } catch {}
          break;
        }
        case 'CALL_END': {
          setCallState('IDLE');
          setIncomingCall(null);
          cleanup();
          try { notification.destroy(incomingNotifyKeyRef.current); } catch {}
          break;
        }
        default:
          break;
      }
    });
  }, [onCallSignalReceived, conversationId, localUserId, sendCallSignal, cleanup, isVideo, reInitPeer]);

  const getMedia = useCallback(async (wantVideo: boolean) => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: wantVideo,
    });
    localStreamRef.current = stream;
    setLocalStreamState(stream);
    // Ensure peer exists and is usable
    let peer = pcRef.current;
    if (!peer || peer.signalingState === 'closed') {
      // eslint-disable-next-line no-console
      peer = reInitPeer();
    }
    stream.getTracks().forEach(track => peer!.addTrack(track, stream));
    setMuted(false);
    setCameraOff(!wantVideo);
    return stream;
  }, [reInitPeer]);

  const startCall = useCallback(async (wantVideo: boolean) => {
    setIsVideo(wantVideo);
    setCallState('OUTGOING');
    isCallerRef.current = true;
    await getMedia(wantVideo);
    await sendCallSignal({
      conversationId,
      fromUserId: localUserId,
      toUserId: remoteUserId,
      type: 'CALL_INIT',
      isVideo: wantVideo,
      timestamp: Date.now(),
    });
  }, [conversationId, localUserId, remoteUserId, sendCallSignal, getMedia]);

  const acceptCall = useCallback(async () => {
    if (!incomingCall) return;
    await getMedia(incomingCall.isVideo);
    setIsVideo(incomingCall.isVideo);
    setCallState('OUTGOING'); // will move to CONNECTED after ANSWER/OFFER exchange
    isCallerRef.current = false;
    try { notification.destroy(incomingNotifyKeyRef.current); } catch {}
    await sendCallSignal({
      conversationId,
      fromUserId: localUserId,
      toUserId: incomingCall.fromUserId,
      type: 'CALL_ACCEPT',
      isVideo: incomingCall.isVideo,
      timestamp: Date.now(),
    });
  }, [incomingCall, getMedia, conversationId, localUserId, sendCallSignal]);

  const rejectCall = useCallback(async () => {
    if (!incomingCall) return;
    await sendCallSignal({
      conversationId,
      fromUserId: localUserId,
      toUserId: incomingCall.fromUserId,
      type: 'CALL_REJECT',
      timestamp: Date.now(),
    });
    setIncomingCall(null);
    setCallState('IDLE');
    try { notification.destroy(incomingNotifyKeyRef.current); } catch {}
  }, [incomingCall, conversationId, localUserId, sendCallSignal]);

  const endCall = useCallback(async () => {
    await sendCallSignal({
      conversationId,
      fromUserId: localUserId,
      toUserId: remoteUserId,
      type: 'CALL_END',
      timestamp: Date.now(),
    });
    setCallState('ENDING');
    cleanup();
    setCallState('IDLE');
    setIncomingCall(null);
    try { notification.destroy(incomingNotifyKeyRef.current); } catch {}
  }, [conversationId, localUserId, remoteUserId, sendCallSignal, cleanup]);

  // Close notification when state transitions away from INCOMING
  useEffect(() => {
    if (callState === 'CONNECTED' || callState === 'IDLE') {
      try { notification.destroy(incomingNotifyKeyRef.current); } catch {}
    }
  }, [callState]);

  const getLastCallDurationSeconds = useCallback(() => {
    if (startTimeRef.current) {
      const diff = Math.floor((Date.now() - startTimeRef.current) / 1000);
      return diff >= 0 ? diff : 0;
    }
    return null;
  }, []);

  const toggleMute = useCallback(() => {
    const st = localStreamRef.current;
    if (!st) return;
    st.getAudioTracks().forEach(t => (t.enabled = !t.enabled));
    setMuted(prev => !prev);
  }, []);

  const toggleCamera = useCallback(() => {
    const st = localStreamRef.current;
    if (!st) return;
    st.getVideoTracks().forEach(t => (t.enabled = !t.enabled));
    setCameraOff(prev => !prev);
  }, []);

  return {
    callState,
    isVideo,
    isCaller: isCallerRef.current,
    localStream: localStreamState,
    remoteStream: remoteStreamState,
    muted,
    cameraOff,
    hasConnected: hasConnectedRef.current,
    incomingCall,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleCamera,
    getLastCallDurationSeconds,
  };
}
