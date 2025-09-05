// @ts-nocheck
const WebSocket = require('ws');
const http = require('http');

// Créer un serveur HTTP simple
const server = http.createServer();

// Créer le serveur WebSocket
const wss = new WebSocket.Server({ server });

// Map pour stocker les connexions par conversationId
const connections = new Map();

console.log('🚀 Serveur WebSocket démarré sur le port 3002');

wss.on('connection', (ws, req) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const conversationId = url.searchParams.get('conversationId') || 'default';
  
  console.log(`✅ [WS] Nouvelle connexion pour conversation: ${conversationId}`);
  
  // Ajouter la connexion au map
  if (!connections.has(conversationId)) {
    connections.set(conversationId, new Set());
  }
  connections.get(conversationId).add(ws);
  
  // Envoyer un message de bienvenue
  ws.send(JSON.stringify({
    type: 'connected',
    conversationId,
    message: 'Connexion WebSocket établie',
    timestamp: new Date().toISOString()
  }));
  
  // Gérer les messages du client
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      console.log(`📨 [WS] Message reçu: ${message.type}`);
      
      // Echo à tous les clients de cette conversation
      broadcastToConversation(conversationId, message);
    } catch (error) {
      console.error('❌ [WS] Erreur parsing message:', error);
    }
  });
  
  // Gérer la fermeture
  ws.on('close', () => {
    console.log(`👋 [WS] Connexion fermée pour: ${conversationId}`);
    connections.get(conversationId)?.delete(ws);
    
    // Nettoyer si plus de connexions
    if (connections.get(conversationId)?.size === 0) {
      connections.delete(conversationId);
    }
  });
  
  // Gérer les erreurs
  ws.on('error', (error) => {
    console.error(`❌ [WS] Erreur pour ${conversationId}:`, error.message);
  });
  
  // Heartbeat pour garder la connexion vivante
  const heartbeat = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'heartbeat',
        timestamp: new Date().toISOString()
      }));
    } else {
      clearInterval(heartbeat);
    }
  }, 30000); // 30 secondes
});

// Fonction pour broadcaster à une conversation
function broadcastToConversation(conversationId, message) {
  const clients = connections.get(conversationId);
  
  if (!clients || clients.size === 0) {
    console.log(`⚠️ [WS] Aucune connexion pour: ${conversationId}`);
    return false;
  }
  
  const messageStr = typeof message === 'string' ? message : JSON.stringify(message);
  let sent = 0;
  
  clients.forEach(ws => {
    if (ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(messageStr);
        sent++;
      } catch (error) {
        console.error('❌ [WS] Erreur envoi:', error);
      }
    }
  });
  
  console.log(`📤 [WS] Message envoyé à ${sent}/${clients.size} clients`);
  return sent > 0;
}

// Endpoint HTTP pour recevoir les notifications du webhook
server.on('request', (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  if (req.method === 'POST' && req.url === '/notify') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const { conversationId, data } = JSON.parse(body);
        
        if (!conversationId || !data) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'conversationId et data requis' }));
          return;
        }
        
        console.log(`🔔 [HTTP] Notification reçue pour: ${conversationId}, type: ${data.type}`);
        
        const sent = broadcastToConversation(conversationId, data);
        
        res.writeHead(200);
        res.end(JSON.stringify({
          success: sent,
          message: sent ? 'Message envoyé' : 'Aucune connexion active'
        }));
      } catch (error) {
        console.error('❌ [HTTP] Erreur:', error);
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Erreur serveur' }));
      }
    });
  } else if (req.method === 'GET' && req.url === '/status') {
    // Endpoint de statut
    const status = {
      status: 'running',
      connections: Array.from(connections.entries()).map(([convId, clients]) => ({
        conversationId: convId,
        clients: clients.size
      }))
    };
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(status));
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

// Démarrer le serveur
server.listen(3002, () => {
  console.log('🌐 Serveur HTTP/WebSocket écoute sur http://localhost:3002');
  console.log('📡 WebSocket: ws://localhost:3002');
  console.log('📬 Webhook: POST http://localhost:3002/notify');
  console.log('📊 Status: GET http://localhost:3002/status');
});

// Gérer l'arrêt propre
process.on('SIGINT', () => {
  console.log('\n🛑 Arrêt du serveur WebSocket...');
  
  // Fermer toutes les connexions
  connections.forEach((clients, convId) => {
    clients.forEach(ws => {
      ws.close();
    });
  });
  
  server.close(() => {
    console.log('✅ Serveur arrêté');
    process.exit(0);
  });
});