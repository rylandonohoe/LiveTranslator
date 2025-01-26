import React from 'react';
import './App.css';
import VideoChatContainer from './VideoChatContainer';
import Navbar from './components/Navbar';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoggedIn: false, // Tracks login state
    };
  }

  handleLogin = () => {
    this.setState({ isLoggedIn: true }); // Update state when user logs in
  };

  render() {
    return (
      <div className={`app ${this.state.isLoggedIn ? 'logged-in' : ''}`}>
        <Navbar />
        {/* Show the title page if not logged in */}
        {!this.state.isLoggedIn && (
          <div className="title-page">
            <h1 id="title">BREAD</h1>
            <h2 id="subtitle">
              <span className="highlight">BR</span>eaking languag<span className="highlight">E</span> b
              <span className="highlight">A</span>rriers in vi<span className="highlight">D</span>eo calls
            </h2>
          </div>
        )}
        {/* Render VideoChatContainer, passing the handleLogin function */}
        <VideoChatContainer onLogin={this.handleLogin} />
      </div>
    );
  }
}

export default App;
