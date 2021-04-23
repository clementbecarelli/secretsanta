import React, {useState, useEffect} from 'react';
import './App.css';
import Axios from 'axios'
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Table from 'react-bootstrap/Table';
import Form from 'react-bootstrap/Form';
import Tooltip from 'react-bootstrap/Tooltip'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Dropdown from 'react-bootstrap/Dropdown'
import InputGroup from 'react-bootstrap/InputGroup'
const App = () => {

  const [participantName, setParticipantName] = useState('');
  const [idDraw, setIdDraw] = useState(1);
  const [participantsList, setParticipantsList] = useState([]);
  //const [participantsListShuffled, setParticipantsListShuffled] = useState([]);

  const [showDrawLots, setShowDrawLots] = useState(false)
  const [showHistory, setShowHistory] = useState(true)
  const [history, setHistory] = useState([])

  useEffect(() => {
    getHistory()
    updateIdDraw()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Add a participant to the list */
  const addParticipant = () => {
    if ((/[a-zA-Z]/).test(participantName) & !participantsList.includes(participantName)) {
      setParticipantsList([...participantsList, participantName]);
      setParticipantName('')
    } else {
      alert('Just give a new and simple valid name :)')
    }
  };

  /* Erase the current used list */
  const resetParticipants = () => {
    setParticipantsList([])
    setShowDrawLots(false)
  };

  /* Send draw lots to backend, incrementing the draw id */
  const submitDrawLots = () => {
    Axios.post("http://localhost:3001/api/insert", {
      participantsList: participantsList,
      idDraw: idDraw,
    })
    setIdDraw(idDraw+1)
  };

  /* Shuffle array method, used to get random pairs of participants */
  const shuffleArray= (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
  }

  /* Draw the lot and display it */
  const drawLots = () => {
    if (participantsList.length > 1){
      shuffleArray(participantsList);
      setShowDrawLots(true)
      submitDrawLots()
    }
  }

  /* Get last 5 draws from History table in database */
  const getHistory = () => {
    Axios.get("http://localhost:3001/api/get/history").then((response) => {
      setHistory(response.data);
      setShowHistory(!showHistory)
    });
  }

  /* Truncate History table, reinitialize the draw id */
  const deleteHistory = () => {
     Axios.delete("http://localhost:3001/api/delete").then((response) => {
      setIdDraw(1)
    });
  }

  /* Get persistant draw id from database while launching app */
  const updateIdDraw = () => {
    Axios.get("http://localhost:3001/api/get/iddraw").then((response) => {
      typeof(response) == 'undefined' ? setIdDraw(1) : setIdDraw(response.data[0]["max(id_draw)"]+1)
    });
  }

  /* Fancy tooltip (experimenting react-bootstrap) */
  const renderTooltip = (props) => (
    <Tooltip id="button-tooltip" {...props}>
      Last 5 Draws
    </Tooltip>
  );

  return (

    <div>
      <h1>Secret Santa's Draw</h1>
      <hr/>
      <h4>Participants</h4>
      <div>
        <Table striped hover bordered>
          <thead>
            <tr>
              <th>Number</th>
              <th>Name</th>
              <th>Blacklist</th>
            </tr>
          </thead>
          <tbody>
            {participantsList.map((val, id) =>  {
              return (<tr>
                        <td>{++id}</td>
                        <td>{val}</td>
                        <td>
                          <Dropdown>
                            <Dropdown.Toggle size ="sm" variant="dark" id="dropdown-basic">
                              {val}'s Blacklist
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                              {// eslint-disable-next-line
                              participantsList.map((val_2) =>  {
                                if (val !== val_2)
                                  return (
                                    <InputGroup  size="sm" className="mb-1">
                                      <InputGroup.Checkbox aria-label="Checkbox for following text input" />
                                      <InputGroup.Append>
                                        <InputGroup.Text id="basic-addon2">{val_2}</InputGroup.Text>
                                      </InputGroup.Append> 
                                    </InputGroup>
                                  )  
                              })}
                            </Dropdown.Menu>
                          </Dropdown>
                        </td>
                    </tr>)
            })}
          </tbody>
        </Table>
      </div>  

      <div>
        <Form.Control type="text" placeholder="Give a name" name="participantName" value={participantName} onChange={(event)=>{setParticipantName(event.target.value)}}></Form.Control>
        <ButtonGroup vertical>
          <Button variant="success" type="submit" onClick={addParticipant}>Add a participant</Button>
          <Button variant="secondary" onClick={resetParticipants}>Reset</Button>
          <OverlayTrigger
              placement="right"
              delay={{ show: 150, hide: 200 }}
              overlay={renderTooltip}
            >
              <Button variant="dark" onClick={getHistory}>View/Hide history</Button>
            </OverlayTrigger>        
          <Button variant="dark" onClick={deleteHistory}>Delete history</Button>
        </ButtonGroup>
      </div>

      <div>
        {showHistory ?
          <div>
            <h5>History</h5>
            <Table striped hover bordered>
              <thead>
                <tr>
                  <th>Draw n°</th>
                  <th>Giver</th>
                  <th>Receiver</th>
                </tr>
              </thead>
              <tbody>
                {history.map((val) =>  {
                  return <tr>
                          <td> {val.id_draw}</td>
                          <td>{val.name_participant}</td>
                          <td>{val.drawn_participant}</td>
                        </tr>
                })}
              </tbody>
            </Table> 
          </div> : null }
      </div>
            
      <Button style={{marginTop: "8px"}} block onClick={drawLots}>Draw lots</Button>
      <div>
        {showDrawLots ?
        <div>
          <h5>Results</h5>
          <Table striped hover bordered>
            <thead>
              <tr>
                <th>Giver</th>
                <th>Receiver</th>
              </tr>
            </thead>
            <tbody>
              {participantsList.map((giver, id, elements) =>  {
                var receiver = elements[id+1]
                if (id+1 >= elements.length){
                  receiver = elements[0]
                }
                return <tr>
                        <td>{giver}</td>
                        <td>{receiver}</td>
                      </tr>
              })}
            </tbody>
          </Table>
        </div> : null }
      </div>  
    </div>
  )};

export default App;
