import logo from './logo.svg';
import './App.css';
import Dataform from './components/FormComponent/Dataform.js';
import React, { useState } from 'react';
import DataChart from './components/ChartComponent/DataChart.js';

function App() {
  const [submitButtonClicked, setSubmitButtonClicked] = useState(null);
  const [scatterPointClicked, setScatterPointClicked] = useState({
    id: '',
    x: '',
    y: '',
    label: '',
  });
  return (
    <div className="App">
      <header className="App-header">
        <div className="chart-container">
          <DataChart
            submitButtonClickRecord={submitButtonClicked}
            scatterPointEmit={setScatterPointClicked}
          />
        </div>
        <div className="form-container">
          <Dataform
            submitButtonEmit={setSubmitButtonClicked}
            clickedScatterPointData={scatterPointClicked}
          />
        </div>
      </header>
    </div>
  );
}

export default App;
