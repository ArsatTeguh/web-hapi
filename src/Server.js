const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');

// Notes
const NotesService = require('./Services/Postgres/NotesService');
const notes = require('./Api/Notes/Index');
const NotesValidator = require('./Validator/notes');

// Users
const users = require('./Api/Users/Index');
const UsersService = require('./Services/Postgres/Users');
const UsersValidator = require('./Validator/users');
require('dotenv').config();

// Authentications
const authentications = require('./Api/Authentications/Index');
const AuthenticationsService = require('./Services/Postgres/AuthenticationsService');
const TokenManager = require('./Tokenize/managerToken');
const AuthenticationsValidator = require('./Validator/authentications');

const init = async () => {
  const notesService = new NotesService();
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();
  const server = Hapi.server({
    host: process.env.HOST,
    port: process.env.PORT,
    routes: true,
  });

  // registrasi plugin eksternal
  await server.register([
    {
      plugin: Jwt,
    },
  ]);

  // mendefinisikan strategy autentikasi jwt
  server.auth.strategy('notesapp_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  await server.register([{
    plugin: notes,
    options: {
      service: notesService,
      validator: NotesValidator,
    },
  },
  {
    plugin: users,
    options: {
      service: usersService,
      validator: UsersValidator,
    },
  },
  {
    plugin: authentications,
    options: {
      authenticationsService,
      usersService,
      tokenManager: TokenManager,
      validator: AuthenticationsValidator,
    },
  },
]);
  await server.start();
  console.log(`Server Berjalan Di Port ${server.info.uri}`);
};
init();