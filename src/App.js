import logo from './logo.svg';
import Home from "./Components/Home";
import SignUp from './Components/SignUp';
import SignIn from "./Components/SignIn";
import {BrowserRouter as Router, Route, Switch} from "react-router-dom"

function App() {
  return (
    <Router>
      <div className="App">
        <Switch>
        
          <Route exact path="/">
            <Home />
          </Route>

          <Route path="/signup">
            <SignUp />
          </Route>

          <Route path="/signin">
            <SignIn />
          </Route>

        </Switch>
      </div>
    </Router>
  );
}

export default App;
