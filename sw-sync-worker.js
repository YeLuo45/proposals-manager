// SharedWorker for cross-tab synchronization
// Handles broadcasting task changes to all open tabs

const connections = new Map();

self.addEventListener('connect', (event) => {
  const port = event.ports[0];
  const portId = `port-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  connections.set(portId, port);
  
  port.addEventListener('message', (event) => {
    const { type, payload, timestamp } = event.data;
    
    if (type === 'ping') {
      port.postMessage({ type: 'connected', payload: { portId } });
      return;
    }
    
    if (type === 'broadcast') {
      // Broadcast to all connected ports except the sender
      connections.forEach((targetPort, targetId) => {
        if (targetId !== portId) {
          try {
            targetPort.postMessage({
              type: 'sync',
              payload: {
                ...payload,
                broadcastFrom: portId,
                receivedAt: Date.now(),
              },
            });
          } catch (e) {
            // Port might be closed, remove it
            connections.delete(targetId);
          }
        }
      });
    }
  });

  port.start();
  
  port.addEventListener('messageerror', () => {
    connections.delete(portId);
  });
  
  port.addEventListener('close', () => {
    connections.delete(portId);
    // Notify other tabs that this tab disconnected
    connections.forEach((targetPort) => {
      try {
        targetPort.postMessage({ type: 'tab-disconnected', payload: { portId } });
      } catch (e) {}
    });
  });
});

// Heartbeat to clean up dead connections
setInterval(() => {
  connections.forEach((port, id) => {
    try {
      port.postMessage({ type: 'ping' });
    } catch (e) {
      connections.delete(id);
    }
  });
}, 30000);

console.log('Sync Worker initialized');