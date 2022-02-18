import React from 'react';
import { Component } from 'react';
import './app.css';
import SearchBar from '../searchbar/searchbar';
import SearchResults from '../searchresults/searchresults';
import Playlist from '../playlist/playlist';
import Spotify from '../../util/Spotify';

Spotify.getAccessToken();

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchResults: [],
      playlistName: 'New Playlist',
      playlistTracks: []
    };
    this.addTrack = this.addTrack.bind(this);
    this.removeTrack = this.removeTrack.bind(this);
    this.updatePlaylistName = this.updatePlaylistName.bind(this);
    this.savePlaylist = this.savePlaylist.bind(this);
    this.search = this.search.bind(this);    
  }

  addTrack(track) {
    if (this.state.playlistTracks.find(savedTrack => savedTrack.id === track.id)) {
      return;
    }
    var newPlaylistTracks = this.state.playlistTracks;
    newPlaylistTracks.push(track);
    this.setState({
      playlistTracks: newPlaylistTracks
    });
  }

  removeTrack(track) {
    if (this.state.playlistTracks.find(savedTrack => savedTrack.id === track.id)) {
      var newPlaylistTracks = this.state.playlistTracks.filter(newTrack => newTrack.id !== track.id );
      this.setState({
        playlistTracks: newPlaylistTracks
      });
    }
  }

  updatePlaylistName(name) {
    this.setState({
      playlistName: name
    });
  }


  savePlaylist() {
    var name = this.state.playlistName;
    var trackUris = this.state.playlistTracks.map(track => track.uri);
    Spotify.savePlaylist(name, trackUris);
    this.setState({
      playlistTracks: []
    });
    this.updatePlaylistName('New Playlist');
  }

  async search(term) {
    var newArr = await Spotify.search(term);
    console.log(newArr);
    this.setState({
      searchResults: newArr
    });
  }

  render() {
    return (
      <div>
        <h1>Ja<span className="highlight">mmm</span>ing</h1>
        <div className="App">
          <SearchBar 
            onSearch={this.search} 
          />
          <div className="App-playlist">
            <SearchResults 
              searchResults={this.state.searchResults} 
              onAdd={this.addTrack} 
            />
            <Playlist 
              playlistName={this.state.playlistName} 
              playlistTracks={this.state.playlistTracks} 
              onRemove={this.removeTrack} 
              onNameChange={this.updatePlaylistName} 
              onSave={this.savePlaylist} 
            />
          </div>
        </div>
      </div>
    );
  }
}

export default App;