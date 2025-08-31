// Script d'initialisation MongoDB
db = db.getSiblingDB('goalcraft');

// Créer un utilisateur pour l'application
db.createUser({
  user: 'goalcraft_user',
  pwd: 'goalcraft_password',
  roles: [
    {
      role: 'readWrite',
      db: 'goalcraft'
    }
  ]
});

// Créer les collections avec validation
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['email', 'name'],
      properties: {
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
        },
        name: {
          bsonType: 'string',
          minLength: 1
        }
      }
    }
  }
});

db.createCollection('objectives');
db.createCollection('conversations');

// Créer les index
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ createdAt: -1 });

db.objectives.createIndex({ userId: 1, status: 1 });
db.objectives.createIndex({ userId: 1, createdAt: -1 });

db.conversations.createIndex({ userId: 1, status: 1 });
db.conversations.createIndex({ userId: 1, createdAt: -1 });

print('✅ MongoDB initialized successfully');