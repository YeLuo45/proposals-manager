import { useState, useEffect, useCallback, useRef } from 'react';

const SHARED_WORKER_URL = '/sw-sync-worker.js';

export function useSyncWorker({ 
  onSyncMessage,
  enabled = true 
}) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const workerRef = useRef(null);
  const portRef = useRef(null);

  // Initialize SharedWorker connection
  useEffect(() => {
    if (!enabled) return;

    try {
      const worker = new SharedWorker(SHARED_WORKER_URL, { name: 'sync-worker' });
      workerRef.current = worker;
      
      worker.port.start();
      portRef.current = worker.port;

      worker.port.addEventListener('message', (event) => {
        const { type, payload } = event.data;
        if (type === 'sync') {
          setLastSyncTime(Date.now());
          onSyncMessage?.(payload);
        } else if (type === 'connected') {
          setIsConnected(true);
        } else if (type === 'disconnected') {
          setIsConnected(false);
        }
      });

      // Send initial ping to confirm connection
      worker.port.postMessage({ type: 'ping' });
      setIsConnected(true);
    } catch (err) {
      console.warn('SharedWorker not available:', err);
      setIsConnected(false);
    }

    return () => {
      if (portRef.current) {
        try {
          portRef.current.close();
        } catch (e) {}
      }
      if (workerRef.current) {
        try {
          workerRef.current.port.close();
        } catch (e) {}
      }
    };
  }, [enabled, onSyncMessage]);

  // Broadcast message to all tabs
  const broadcast = useCallback((payload) => {
    if (portRef.current && isConnected) {
      portRef.current.postMessage({
        type: 'broadcast',
        payload,
        timestamp: Date.now(),
      });
      setLastSyncTime(Date.now());
    }
  }, [isConnected]);

  return {
    isConnected,
    lastSyncTime,
    broadcast,
  };
}

export default useSyncWorker;