import { useState } from "react";
import "./App.css";

import Ide from "./components/Ide";

function App() {
    const [count, setCount] = useState(0);

    return <Ide />;
}

export default App;
