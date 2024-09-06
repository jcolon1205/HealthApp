import React from 'react';
import './Home.css';

function Home() {
  const backgroundImageUrl = "https://images.pexels.com/photos/281260/pexels-photo-281260.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2";

  const backgroundStyle = {
    backgroundImage: `url(${backgroundImageUrl})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  };

  return (
    <div className="home-container" style={backgroundStyle}>
      <div className="content">
        <h1>Welcome to EHR Case Worker Portal</h1>
        <p>Manage your cases efficiently and securely.</p>
      </div>
    </div>
  );
}

export default Home;