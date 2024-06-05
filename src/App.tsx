import "./App.css";
import {ChakraProvider} from "@chakra-ui/react";
import Navbar from "./components/navbar";

const App = () =>{
    return (
        <ChakraProvider>
            <Navbar />
            This is a test !
        </ChakraProvider>
    );
}

export default App;
