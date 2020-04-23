import React from 'react';
import Amplify from 'aws-amplify';
import {MDBContainer, MDBRow, MDBCol} from "mdbreact";
import awsconfig from './aws-exports';
import '@fortawesome/fontawesome-free/css/all.min.css'
import 'bootstrap-css-only/css/bootstrap.min.css'
import 'mdbreact/dist/css/mdb.css'
import Form from "./components/Form";
import CenterContainer from "./components/CenterContainer";
import Logo from "./components/Logo";

Amplify.configure(awsconfig);

const App = () => {
    return (
        <CenterContainer>
            <MDBContainer>
                <MDBRow>
                    <MDBCol xs="12" xl="4">
                        <Logo />
                    </MDBCol>
                    <MDBCol xs="0" xl="3"/>
                    <MDBCol xs="12" xl="5">
                        <Form/>
                    </MDBCol>
                </MDBRow>
            </MDBContainer>
        </CenterContainer>
    )
}

export default App;
