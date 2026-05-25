export const environment = {

  production: false,

  apiBaseUrl:
    window.location.hostname === 'localhost'
      ? 'http://localhost:5031/api'
      : 'http://192.168.1.2:5031/api'
};
