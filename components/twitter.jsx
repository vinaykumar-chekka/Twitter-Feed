/*
* @component: Twitter Feed Monitoring
* - Vinay
*/
import React from 'react';


class TwitterFeedMonitor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data : this.props.data
    }
  }

  componentDidMount() {
  }

  render() {
    var posts = [];
    if(typeof(this.state.data) === 'string') {
      posts = JSON.parse(this.state.data);
    }
    else {
      posts = this.state.data;
    }
    var self = this;
    return (
      <div>
        <ul className="feeds ff2">
          {
            posts.map(function(tweet, i) {
              return (
                <li className="feed" key={i}>
                  <div className="feed-img-container">
                    <img src={tweet.user.profile_image_url_https} alt={tweet.user.name}/>
                  </div>
                  <div className="feed-info">
                    <h4><a href={tweet.user.url} target="_blank">{tweet.user.name}</a></h4>
                    <p className="msg">{tweet.text}</p>
                  </div>
                </li>
                )
            })
          }
        </ul>
      </div>
    );
  }
}

if (typeof document !== 'undefined') {
  React.render(<TwitterFeedMonitor {...feedApp.Twitter}/>, document.getElementById('twitter'));
}
