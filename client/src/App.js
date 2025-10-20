import './App.css';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import Fib from './Pages/Fib';
import OtherPage from './Pages/OthePage';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          Fibonacci Calculator
          <Link to="/">Home</Link>
          <Link to="/otherpage">Other Page</Link>
        </header>
        <div>
          <Route exact path="/" element={<Fib />} />
          <Route path="/otherpage" element={<OtherPage />} />
        </div>
      </div>
    </Router>
  );
}

export default App;
