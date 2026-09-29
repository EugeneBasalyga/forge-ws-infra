const path = require('path');

require('dotenv').config({
  path: path.join(__dirname, './.env'),
});

module.exports = {
  apps: [
    {
      name: 'forge-service-app',
      script: '../forge-service-app/src/main.js',
      watch: '../forge-service-app/src',
    },
  ],
};
