import React, {useState} from 'react'
import './App.css'
import 'firebase/database'
import classnames from 'classnames'

export default class VideoChat extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      isLoggedIn: false,
      userToCall: "",   // Default to empty string, not null
      username: "",     // Default to empty string, not null
      errorMessage: null
    }
  }

  onLoginClicked = async () => {
    if (!this.state.username) {
      this.setState({ errorMessage: "Name cannot be empty." });
      return;
    }
    await this.props.onLogin(this.state.username)
    this.setState({
      isLoggedIn: true,
      errorMessage: null
    })
    document.querySelector('#title').style.display = 'none';
    document.querySelector('#subtitle').style.display = 'none';

  }

  onStartCallClicked = () => {
    this.props.startCall(this.state.username, this.state.userToCall)
  }

  renderVideos = () => {
    return <>
    <div className={classnames('videos', { active: this.state.isLoggedIn })}>
      <div className='my-video'>
        <video ref={this.props.setLocalVideoRef} autoPlay playsInline></video>
        <div className='lang-toggle'>
            <button onClick={this.props.toggleLang} className='toggle-btn'>
              <img src="./assets/america.jpg" alt="English" class="flag" />
            </button>
            <button onClick={this.props.toggleLang} className='toggle-btn'></button>
            <button onClick={this.props.toggleLang} className='toggle-btn'></button>
        </div>
        <label id='username' className='username'>{this.state.username}</label>
      </div>
      <div className='my-video'>
        <video ref={this.props.setRemoteVideoRef} autoPlay playsInline></video>
        <label id='username' className='username'>{this.props.connectedUser}</label>
      </div>
    </div>
    </>
  }

  renderForms = () => {
    return this.state.isLoggedIn
      ? <div key='a' className='form2'>
        <input value={this.state.userToCall} type="text" onChange={e => this.setState({ userToCall: e.target.value })} />
        <button onClick={this.onStartCallClicked} id="call-btn" className="btn btn-primary">Call</button>

      </div>
      : <div key='b' className='form'>
        <label>Please enter your name</label>
        <input value={this.state.username} type="text" onChange={e => this.setState({ username: e.target.value })} />
        {this.state.errorMessage && (
            <p style={{ color: '#bf0000', fontSize: '1rem' }}>{this.state.errorMessage}</p>
          )}
        <button onClick={this.onLoginClicked} id="login-btn" className="btn btn-primary">Login</button>

      </div>
  }

  render () {
    return <section id="container">
      {this.props.connectedUser ? null : this.renderForms()}

      {this.renderVideos()}

    </section>
  }
}
