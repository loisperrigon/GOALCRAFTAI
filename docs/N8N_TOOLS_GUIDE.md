# 📘 Guide d'utilisation des outils n8n pour GoalCraftAI

## ⚠️ Format EXACT requis par n8n

n8n utilise un format JSON strict pour les outils. Voici comment les utiliser correctement :

## 🌐 Outil 1 : GETDATAPAGE (Recherche Internet)

### Format correct pour n8n :
```json
{
  "action": "GETDATAPAGE",
  "parameters": {
    "url": "https://example.com",
    "selector": ".content" 
  }
}
```

### ❌ NE PAS utiliser :
```javascript
// Ceci ne fonctionne PAS dans n8n
GETDATAPAGE({
  url: "https://example.com"
})
```

### Exemple concret :
```json
{
  "action": "GETDATAPAGE",
  "parameters": {
    "url": "https://www.google.com/search?q=best+guitar+apps+2024"
  }
}
```

## 📤 Outil 2 : WEBHOOK (Callback vers GoalCraftAI)

### Format correct pour n8n :
```json
{
  "action": "WEBHOOK",
  "parameters": {
    "url": "{{$json.callbackUrl}}",
    "method": "POST",
    "headers": {
      "Content-Type": "application/json"
    },
    "body": {
      "messageId": "{{$json.messageId}}",
      "conversationId": "{{$json.conversationId}}",
      "type": "message",
      "content": "Votre message ici",
      "isFinal": false
    }
  }
}
```

### Exemple pour un message :
```json
{
  "action": "WEBHOOK",
  "parameters": {
    "url": "{{$json.callbackUrl}}",
    "method": "POST",
    "headers": {
      "Content-Type": "application/json"
    },
    "body": {
      "messageId": "{{$json.messageId}}",
      "conversationId": "{{$json.conversationId}}",
      "type": "message",
      "content": "J'ai besoin de quelques informations supplémentaires...",
      "isFinal": false
    }
  }
}
```

### Exemple pour un objectif :
```json
{
  "action": "WEBHOOK",
  "parameters": {
    "url": "{{$json.callbackUrl}}",
    "method": "POST",
    "headers": {
      "Content-Type": "application/json"
    },
    "body": {
      "messageId": "{{$json.messageId}}",
      "conversationId": "{{$json.conversationId}}",
      "type": "objective",
      "objective": {
        "title": "🎸 Maîtriser la guitare",
        "description": "Parcours progressif en 3 mois",
        "category": "learning",
        "difficulty": "medium",
        "estimatedDuration": "3 mois",
        "skillTree": {
          "nodes": [],
          "edges": []
        }
      }
    }
  }
}
```

## 🔧 Configuration dans n8n

### Dans le node "AI Agent" :

1. **Ajouter l'outil GETDATAPAGE** :
   - Type : HTTP Request
   - Name : GETDATAPAGE
   - Description : "Recherche des informations sur internet"
   - Input Schema :
   ```json
   {
     "type": "object",
     "properties": {
       "url": {
         "type": "string",
         "description": "URL à visiter"
       },
       "selector": {
         "type": "string",
         "description": "Sélecteur CSS (optionnel)"
       }
     },
     "required": ["url"]
   }
   ```

2. **Ajouter l'outil WEBHOOK** :
   - Type : HTTP Request
   - Name : WEBHOOK
   - Description : "Envoie la réponse à GoalCraftAI"
   - Input Schema :
   ```json
   {
     "type": "object",
     "properties": {
       "url": {
         "type": "string",
         "description": "URL de callback"
       },
       "method": {
         "type": "string",
         "description": "Méthode HTTP (POST)"
       },
       "headers": {
         "type": "object",
         "description": "Headers HTTP"
       },
       "body": {
         "type": "object",
         "description": "Corps de la requête"
       }
     },
     "required": ["url", "method", "body"]
   }
   ```

## 📝 Prompt pour l'agent IA

Dans le prompt de l'agent, expliquer le format :

```
Pour utiliser les outils, tu dois TOUJOURS retourner un JSON avec cette structure :

{
  "action": "NOM_DE_L_OUTIL",
  "parameters": {
    // paramètres de l'outil
  }
}

Exemple pour rechercher sur internet :
{
  "action": "GETDATAPAGE",
  "parameters": {
    "url": "https://www.example.com"
  }
}

Exemple pour répondre à l'utilisateur :
{
  "action": "WEBHOOK",
  "parameters": {
    "url": "{{$json.callbackUrl}}",
    "method": "POST",
    "headers": {"Content-Type": "application/json"},
    "body": {
      "messageId": "{{$json.messageId}}",
      "conversationId": "{{$json.conversationId}}",
      "type": "message",
      "content": "Ta réponse ici",
      "isFinal": false
    }
  }
}
```

## 🚨 Erreurs communes à éviter

1. **❌ Oublier le format JSON**
   ```javascript
   // MAUVAIS
   WEBHOOK(...)
   ```
   
2. **❌ Oublier l'action wrapper**
   ```json
   // MAUVAIS
   {
     "url": "...",
     "method": "POST"
   }
   ```

3. **❌ Mauvais nom d'action**
   ```json
   // MAUVAIS
   {
     "action": "webhook",  // Doit être WEBHOOK en majuscules
     "parameters": {...}
   }
   ```

4. **✅ Format correct**
   ```json
   {
     "action": "WEBHOOK",
     "parameters": {
       "url": "{{$json.callbackUrl}}",
       "method": "POST",
       "headers": {"Content-Type": "application/json"},
       "body": {
         "messageId": "{{$json.messageId}}",
         "conversationId": "{{$json.conversationId}}",
         "type": "message",
         "content": "Message",
         "isFinal": false
       }
     }
   }
   ```

## 🔄 Variables n8n disponibles

Dans n8n, tu peux accéder aux données du webhook entrant avec :
- `{{$json.messageId}}` - ID du message
- `{{$json.conversationId}}` - ID de la conversation
- `{{$json.userId}}` - ID de l'utilisateur
- `{{$json.message}}` - Message de l'utilisateur
- `{{$json.callbackUrl}}` - URL pour le callback
- `{{$json.context}}` - Contexte de la conversation

## 💡 Conseil important

**TOUJOURS tester le format JSON** avant de l'utiliser dans n8n. Le moindre problème de syntaxe causera l'erreur "Received tool input did not match expected schema".