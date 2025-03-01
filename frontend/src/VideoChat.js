import React, {useState} from 'react'
import './App.css'
import 'firebase/database'
import classnames from 'classnames'

export default class VideoChat extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
    isLoggedIn: false,
    userToCall: "",   
    username: "",     
    errorMessage: null,
    showModal: false, 
    selectedLangPic: '/america.jpg',
    selectedLang: 'en'
    }
  }

  toggleModal = () => {
    this.setState((prevState) => ({ showModal: !prevState.showModal }));
  };

  sendRequest = async (method, body) => {
    try {
      const response = await fetch('http://0.0.0.0:8001/set-lang', {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      return await response.json();
    } catch (error) {
      console.error(error);
    }
  };

  selectLanguage = (lang) => {
    let langCode = 'en'; 
    if (lang === '/america.jpg') {
      langCode = 'en';
    } else if (lang === '/spain.png') {
      langCode = 'es';
    } else if (lang === '/france.png') {
      langCode = 'fr';
    } else if (lang === '/china.jpg') {
      langCode = 'zh';
    } else if (lang === '/germany.jpg') {
      langCode = 'de';
    } else if (lang === '/india.jpg') {
      langCode = 'hi';
    } else if (lang === '/italy.jpg') {
      langCode = 'it';
    } else if (lang === '/russia.jpg') {
      langCode = 'ru';
    }

    this.setState({
      selectedLangPic: lang,
      selectedLang: langCode,
      showModal: false,
      selectedLangPic: lang,
      selectedLang: langCode,
      showModal: false,
    });
  };

  componentDidMount() {
    // Call selectLanguage with default values
    this.selectLanguage('/america.jpg');
  }

  // Handles the login process
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

  // Handles the start call process
  onStartCallClicked = () => {
    this.props.startCall(this.state.username, this.state.userToCall)
  }

  // Renders the video section
  renderVideos = () => {
    return <>
    {this.state.isLoggedIn ? 
    <div className='lang-toggle-container'>
      <div className='lang-toggle'>
            <button onClick={this.toggleModal} className="toggle-btn">
                <img
                  src={this.state.selectedLangPic}
                  alt="Selected Language"
                  className="flag"
                />
              </button>
                </div></div> : null}

        <div className={classnames('videos', { active: this.state.isLoggedIn })}>
          <div className='my-video'>
            <video ref={this.props.setLocalVideoRef} autoPlay playsInline></video>
            <div className='name-container'>
              <label id='username' className='username'>{this.state.username}</label>
            </div>
          </div>
          <div className='my-video'>
            <video ref={this.props.setRemoteVideoRef} autoPlay playsInline></video>
            {this.props.connectedUser ? 
              <div className='name-container'>
                <label id='username' className='username'>{this.props.connectedUser}</label> 
              </div> : null}
          </div>
        </div>
        {this.state.showModal && (
              <div className="modal">
                <div className="modal-content">
                  <p>Select Language</p>
                  <div className="modal-languages">
                    <button onClick={() => this.selectLanguage('/america.jpg')}>
                      <img src="/america.jpg" alt="English" className="flag" />
                    </button>
                    <button onClick={() => this.selectLanguage('/france.png')}>
                      <img src="/france.png" alt="French" className="flag" />
                    </button>
                    <button onClick={() => this.selectLanguage('/spain.png')}>
                      <img src="/spain.png" alt="Spanish" className="flag" />
                    </button>
                    <button onClick={() => this.selectLanguage('/china.jpg')}>
                      <img src="/china.jpg" alt="China" className="flag" />
                    </button>
                    <button onClick={() => this.selectLanguage('/germany.jpg')}>
                      <img src="/germany.jpg" alt="Germany" className="flag" />
                    </button>
                    <button onClick={() => this.selectLanguage('/india.jpg')}>
                      <img src="/india.jpg" alt="India" className="flag" />
                    </button>
                    <button onClick={() => this.selectLanguage('/italy.jpg')}>
                      <img src="/italy.jpg" alt="Italy" className="flag" />
                    </button>
                    <button onClick={() => this.selectLanguage('/russia.jpg')}>
                      <img src="/russia.jpg" alt="Rusia" className="flag" />
                    </button>
                  </div>
                  <button onClick={this.toggleModal} className="close-btn">
                    Close
                  </button>
                </div>
              </div>
            )}
        </>
  }

  // Renders the login or call input forms
  renderForms = () => {
    const { isLoggedIn, username, userToCall, errorMessage } = this.state;

    return isLoggedIn ? (
      <div key="a" className="form2">
        <input
          className="form3"
          value={userToCall}
          type="text"
          onChange={(e) => this.setState({ userToCall: e.target.value })}
          placeholder="Enter username to call"
        />
        <button onClick={this.onStartCallClicked} id="call-btn" className="call">
          Call
        </button>
      </div>
    ) : (
      <div key="b" className="form">
        <label>Please enter your name</label>
        <input
          className="form-input"
          value={username}
          type="text"
          onChange={(e) => this.setState({ username: e.target.value })}
          placeholder="Enter your name"
        />
        {errorMessage && (
          <p style={{ color: '#bf0000', fontSize: '1rem' }}>{errorMessage}</p>
        )}
        <button onClick={this.onLoginClicked} id="login-btn" className="button2">
          Login
        </button>
      </div>
    );
  };

  // Main render function
  render () {
    return <section id="container">
      {this.props.connectedUser ? null : this.renderForms()}

      {this.renderVideos()}

    </section>
  }
}