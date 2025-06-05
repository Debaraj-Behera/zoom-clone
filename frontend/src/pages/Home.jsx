import React, { useContext, useState } from 'react';
import withAuth from '../utils/withAuth';
import { useNavigate } from 'react-router-dom';
import { Button, IconButton, TextField } from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import { AuthContext } from '../contexts/AuthContext';
import '../styles/Home.css'; 

function Home() {
  const navigate = useNavigate();
  const [meetingCode, setMeetingCode] = useState('');
  const { addToUserHistory } = useContext(AuthContext);

  const handleJoinVideoCall = async () => {
    await addToUserHistory(meetingCode);
    navigate(`/${meetingCode}`);
  };

  return (
    <>
      <div className="navBar">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <h2>Debaraj's VC App</h2>
        </div>

        <div className="navRight">
          <IconButton onClick={() => navigate('/history')}>
            <RestoreIcon />
          <p style={{margin: '0 8px'}}>History</p>
          </IconButton>
          <Button
            onClick={() => {
              localStorage.removeItem('token');
              navigate('/auth');
            }}
          >
            Logout
          </Button>
        </div>
      </div>

      <div className="meetContainer">
        <div className="leftPanel">
          <div className="leftContent">
            <h2>Providing Quality Video Call Just Like Quality Education.</h2>
            <div className="inputGroup">
              <TextField
                onChange={(e) => setMeetingCode(e.target.value)}
                label="Meeting Code"
                variant="outlined"
                fullWidth
              />
              <Button onClick={handleJoinVideoCall} variant="contained">
                Join
              </Button>
            </div>
            <p className='meeting-instructions'>Write the <span style={{ fontWeight: 'bold', color: '#1d82ee' }}>Meeting Code</span> and Click on <span style={{ fontWeight: 'bold', color: '#1d82ee' }}>Join</span> button to join the meeting.</p>
          </div>
        </div>

        <div className="rightPanel">
          <img src="/logo.png" alt="Logo" />
        </div>
      </div>
    </>
  );
}

export default withAuth(Home);
