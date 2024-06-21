import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import News from './components/News';

import './App.css';

const App = () => {
  return (
    <Router>
        <Routes>
          <Route exact path="/" element={<News />} />  
        </Routes>
    </Router>
  );
}

export default App;
