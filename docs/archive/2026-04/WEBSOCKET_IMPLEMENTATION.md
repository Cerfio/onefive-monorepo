# 🔌 WebSocket Implementation - OneFive Messaging

## 📋 Vue d'ensemble

Implémentation des WebSockets pour la messagerie temps réel avec **Approche Hybride** :
- **REST API** pour les opérations CRUD (messages, read receipts)
- **WebSocket** pour les notifications temps réel + typing + présence

**Sécurité renforcée** : utilisation de `profileId` au lieu de `userId` pour éviter l'exposition des identifiants internes.

---

## 🎯 Architecture (Approche 1 : REST + WS notification)

```
┌─────────────┐                                    ┌─────────────┐
│   Client A  │                                    │   Client B  │
│ (ProfileID) │                                    │ (ProfileID) │
└──────┬──────┘                                    └──────┬──────┘
       │                                                  │
       │  POST /messaging/messages (REST)                │
       ├──────────────────────────────►────┐              │
       │                                   │              │
       │                        ┌──────────▼──────────┐  │
       │                        │   REST Controller   │  │
       │                        │   (SessionGuard)    │  │
       │                        │         ↓           │  │
       │                        │   Save to Database  │  │
       │                        │         ↓           │  │
       │                        │   Gateway.notify()  │  │
       │                        └──────────┬──────────┘  │
       │                                   │              │
       │◄──Response (message)──────────────┘              │
       │                                                  │
       │                        ┌─────────────────────┐  │
       │                        │  WebSocket Gateway  │  │
       │                        │  (broadcast event)  │  │
       │                        └──────────┬──────────┘  │
       │                                   │              │
       │◄──────────────────────────────────┴──────────────┤
       │  socket.on('message:new')                        │
       │                                                  │
```

### Pourquoi cette approche ?

| Aspect | REST API | WebSocket pur |
|--------|----------|---------------|
| **Messages** | ✅ Validation SessionGuard existante | ❌ Duplication logique |
| **Persistence** | ✅ Un seul point d'entrée DB | ⚠️ Risque doublon |
| **Anti-spam** | ✅ Rate limiting HTTP natif | ❌ Client peut spam sans effet |
| **Debug** | ✅ Logs REST classiques | ⚠️ Plus complexe |

---

## 🔧 Fonctionnalités

### REST API (CRUD) → Notification WebSocket

| Action | REST API | WS Notification |
|--------|----------|-----------------|
| **Envoyer message** | `POST /messaging/messages` | `message:new` aux autres |
| **Éditer message** | `PUT /messaging/messages/:id` | `message:edited` aux autres |
| **Supprimer message** | `DELETE /messaging/messages/:id` | `message:deleted` aux autres |
| **Marquer comme lu** | `POST /messaging/conversations/:id/read` | `message:read` à l'expéditeur |

### WebSocket pur (éphémère)

| Action | Client → Server | Server → Clients |
|--------|-----------------|------------------|
| **Typing indicator** | `typing:start` / `typing:stop` | `typing:start` / `typing:stop` |
| **Présence** | `presence:heartbeat` | `presence:update` (seulement aux contacts en relationship) |
| **Conversation** | `conversation:join` / `conversation:leave` | - |

---

## 📁 Fichiers modifiés

### Backend

| Fichier | Modifications |
|---------|---------------|
| `messaging.gateway.ts` | Supprimé handlers CRUD, ajouté méthodes `notifyX()` publiques |
| `messaging.controller.ts` | Appelle Gateway après chaque opération DB |
| `messaging.module.ts` | Ajouté `ProfileConnectionModule` pour vérifier les relationships |
| `messaging.service.ts` | Retourne `conversationId` dans `deleteMessage` |

### Frontend

| Fichier | Modifications |
|---------|---------------|
| `useWebSocket.ts` | Supprimé `sendMessage()` et `markAsRead()`, gardé typing/presence |
| `useMessaging.ts` | Ajouté **optimistic update** dans `useSendMessage()` |

---

## 🚀 Utilisation

### Envoyer un message (avec optimistic update)

```typescript
import { useSendMessage } from '@/hooks/useMessaging';
import { useWebSocket, useWebSocketMessages } from '@/hooks/useWebSocket';

function ChatInput({ conversationId, currentUser }) {
  const { mutate: sendMessage, isPending } = useSendMessage();
  const { startTyping, stopTyping } = useWebSocket(currentUser.profileId);
  
  const handleSend = (content: string) => {
    // ✅ Envoyer via REST API avec optimistic update
    sendMessage({
      conversationId,
      content,
      _optimistic: {
        tempId: `temp-${Date.now()}`,
        sender: {
          id: currentUser.profileId,
          firstName: currentUser.firstName,
          lastName: currentUser.lastName,
          avatarUrl: currentUser.avatarUrl,
          isMe: true,
        },
      },
    });
  };
  
  // Typing indicator via WebSocket
  const handleTyping = () => {
    startTyping(conversationId);
    setTimeout(() => stopTyping(conversationId), 3000);
  };
  
  return (
    <input
      onChange={handleTyping}
      onKeyPress={(e) => e.key === 'Enter' && handleSend(e.currentTarget.value)}
      disabled={isPending}
    />
  );
}
```

### Écouter les messages des autres

```typescript
import { useWebSocketMessages } from '@/hooks/useWebSocket';

function MessageList({ conversationId, profileId }) {
  // ✅ Écoute automatiquement 'message:new', 'message:read', etc.
  const { isTyping, typingProfiles } = useWebSocketMessages(conversationId, profileId);
  
  return (
    <div>
      <Messages />
      {isTyping && <TypingIndicator profiles={typingProfiles} />}
    </div>
  );
}
```

### Vérifier la présence (seulement contacts en relationship)

```typescript
import { useWebSocketPresence } from '@/hooks/useWebSocket';

function ContactStatus({ contactProfileId, myProfileId }) {
  // ✅ Reçoit 'presence:update' seulement pour les contacts en relationship
  const { isOnline } = useWebSocketPresence(myProfileId);
  
  return (
    <span className={isOnline(contactProfileId) ? 'text-green-500' : 'text-gray-400'}>
      {isOnline(contactProfileId) ? '●' : '○'}
    </span>
  );
}
```

---

## 🔐 Sécurité

### Authentification

Le WebSocket Gateway utilise le **système de sessions existant** (cookies) :

```typescript
// Backend: Extraction sécurisée du profileId
private async extractProfileIdFromSocket(client: Socket): Promise<string | null> {
  // 1. Extraire le token du cookie
  const cookieHeader = client.handshake.headers.cookie;
  const sessionId = this.parseTokenFromCookie(cookieHeader); // token=xxx
  
  // 2. Valider via SessionsService (comme le SessionGuard REST)
  const profileId = await this.sessionsService.getProfileIdFromSession(sessionId);
  
  return profileId; // ✅ Validé côté serveur
}
```

### Présence filtrée

La présence n'est envoyée qu'aux **contacts en relationship ACCEPTED** :

```typescript
// Backend: broadcastPresenceUpdate
private async broadcastPresenceUpdate(profileId: string, status: 'online' | 'offline') {
  // ✅ Récupérer uniquement les profils en relationship
  const connections = await this.profileConnectionService.getConnections(profileId);
  
  // Notifier seulement ces profils
  for (const connection of connections) {
    const targetProfileId = connection.requesterId === profileId 
      ? connection.accepterId 
      : connection.requesterId;
    
    this.sendToProfile(targetProfileId, 'presence:update', { profileId, status });
  }
}
```

---

## 📊 Events WebSocket

### Server → Client

| Event | Payload | Quand |
|-------|---------|-------|
| `message:new` | `Message` | Nouveau message reçu |
| `message:read` | `{ conversationId, messageId?, readBy, readAt }` | Message lu par quelqu'un |
| `message:edited` | `Message` | Message édité |
| `message:deleted` | `{ messageId }` | Message supprimé |
| `typing:start` | `{ profileId }` | Quelqu'un tape |
| `typing:stop` | `{ profileId }` | Quelqu'un a arrêté |
| `presence:update` | `{ profileId, status, timestamp }` | Contact online/offline |
| `presence:connected` | `{ profileId, status }` | Connexion confirmée |

### Client → Server

| Event | Payload | Action |
|-------|---------|--------|
| `conversation:join` | `{ conversationId }` | Rejoindre pour recevoir les events |
| `conversation:leave` | `{ conversationId }` | Quitter |
| `typing:start` | `{ conversationId }` | Signaler qu'on tape |
| `typing:stop` | `{ conversationId }` | Signaler qu'on a arrêté |
| `presence:heartbeat` | `{}` | Maintenir connexion active |

---

## 🔧 Configuration

### Backend (.env)

```env
FRONTEND_URL=https://app.onefive.app  # CORS origin
PORT=3000
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_WS_URL=http://localhost:3000
```

---

## 🧪 Tests

### Test manuel

1. Ouvrir deux navigateurs/onglets
2. Se connecter avec deux comptes différents
3. Ouvrir la même conversation
4. Taper un message → L'autre voit "typing..."
5. Envoyer → Message apparaît immédiatement (optimistic) côté expéditeur
6. L'autre reçoit le message en temps réel via WebSocket

### Logs backend

```bash
LOG_LEVEL=debug pnpm start:dev

# Connexion
✅ Client connected: profileId=prof-abc-123, socketId=xyz

# Message via REST
POST /messaging/messages → 200
Notified new message in conversation conv-456

# Présence (seulement aux contacts)
Presence online for prof-abc-123 sent to 5 connections
```

---

## 📚 Prochaines étapes

- [ ] Implémenter rate limiting sur les événements WebSocket
- [ ] Ajouter Redis pour la scalabilité (multi-instances)
- [ ] Ajouter des métriques de monitoring
- [ ] Implémenter la reconnexion automatique améliorée côté client
- [ ] Ajouter des tests E2E WebSocket

---

## 📞 Support

| Sujet | Fichier |
|-------|---------|
| Backend Gateway | `onefive-back/src/messaging/messaging.gateway.ts` |
| Backend Controller | `onefive-back/src/messaging/messaging.controller.ts` |
| Frontend Hooks | `onefive-front/src/hooks/useWebSocket.ts` |
| Frontend Mutations | `onefive-front/src/hooks/useMessaging.ts` |
