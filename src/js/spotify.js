const { BrowserWindow } = require('electron');
const fetch = require('electron-fetch').default

const SPOTIFY_CLIENT_ID = '331f622d406c476091927bd984a9ec8c';
const SPOTIFY_CLIENT_SECRET = '5f4ba55bb5364d1eb8d23ce6a0ff386c';
const SPOTIFY_BASE_AUTHORIZE_URL = 'https://accounts.spotify.com/en/authorize';
const SPOTIFY_REDIRECT_URI = 'https%3A%2F%2Fexample.com%2Fcallback';
const SPOTIFY_SCOPES = 'user-read-playback-state%20user-read-private';

exports.manageSpotifyAuthorization = function(window) {
  const spotifyAuthWindow = new BrowserWindow(
    {
      parent: window,
      modal: true,
      show: true,
      alwaysOnTop: true,
      webPreferences: {
        nodeIntegration: false,
        devTools: true
      }
    }
  )

  const spotifyAuthUrl = `${SPOTIFY_BASE_AUTHORIZE_URL}?client_id=${SPOTIFY_CLIENT_ID}&response_type=code&redirect_uri=${SPOTIFY_REDIRECT_URI}&scope=${SPOTIFY_SCOPES}`;
  spotifyAuthWindow.loadURL(spotifyAuthUrl);

  spotifyAuthWindow.once('ready-to-show', () => spotifyAuthWindow.show());
  
  const webContents = spotifyAuthWindow.webContents;
  webContents.on('did-finish-load', () => {
    const url = webContents.getURL();
    const urlQueryParams = url.split('?')[1] || '';
    const urlSearchParams = new URLSearchParams(urlQueryParams);
    const code = urlSearchParams.get('code');

    if(url.split('?')[0] === 'https://example.com/callback' && code) {
      const authCode = code.split('#')[0];

      const body = new URLSearchParams();
      body.append('grant_type', 'authorization_code');
      body.append('code', authCode);
      body.append('client_id', SPOTIFY_CLIENT_ID);
      body.append('client_secret', SPOTIFY_CLIENT_SECRET);
      body.append('redirect_uri', 'https://example.com/callback');

      fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        body: body.toString(),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      })
        .then(res => res.json())
        .then(json => console.log(json));
    }
  })
}