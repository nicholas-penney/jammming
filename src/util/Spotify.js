import Secrets from './Secrets';

var accessToken = undefined;
var expiresIn = undefined;

const clientId = Secrets.clientID;
const redirectUri = Secrets.URI;
const spotifyUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectUri}`

const Spotify = {
    getAccessToken() {
        if (accessToken) {
            return accessToken;
        }

        const urlAccessToken = window.location.href.match(/access_token=([^&]*)/);
        const urlExpiresIn = window.location.href.match(/expires_in=([^&]*)/);

        if ( urlAccessToken && urlExpiresIn ) {
            accessToken = urlAccessToken[1];
            expiresIn = urlExpiresIn[1];
            window.setTimeout(
                () => 
                accessToken = '', 
                expiresIn * 1000);
            window.history.pushState('Access Token', null, '/');
        } else {
            window.location = spotifyUrl;
        }
    },

    async search(term) {
        const termNoSpace = term.replace(' ', '%20');
        const termClean = termNoSpace.replace('&', 'and');
        const searchUrl = `https://api.spotify.com/v1/search?type=track,artist,album&q=${termClean}`;

        const response = await fetch(searchUrl, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
        const jsonResponse = await response.json();
        if (!jsonResponse) {
            console.log('Oops no jsonTracks');
            return [];
        }
 
        return jsonResponse.tracks.items.map(track => {
            return {
                id: track.id,
                title: track.name,
                artist: track.artists[0].name,
                album: track.album.name,
                uri: track.uri
            };
        });
    },

    savePlaylist(name, trackUris) {
        if (!name || !trackUris || trackUris.length === 0) return;
        const userUrl = 'https://api.spotify.com/v1/me';
        const headers = {
          Authorization: `Bearer ${accessToken}`
        };
        let userId = undefined;
        let playlistId = undefined;
        fetch(userUrl, {
          headers: headers 
        })
        .then(response => response.json())
        .then(jsonResponse => {
          console.log(jsonResponse);
          userId = jsonResponse.id
        })
        .then(() => {
          const createPlaylistUrl = `https://api.spotify.com/v1/users/${userId}/playlists`;
          fetch(createPlaylistUrl, {
              method: 'POST',
              headers: headers,
              body: JSON.stringify({
                name: name
              })
            })
            .then(response => response.json())
            .then(jsonResponse => playlistId = jsonResponse.id)
            .then(() => {
              const addPlaylistTracksUrl = `https://api.spotify.com/v1/users/${userId}/playlists/${playlistId}/tracks`;
              fetch(addPlaylistTracksUrl, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                  uris: trackUris
                })
              });
            })
        })
      }
}

export default Spotify;