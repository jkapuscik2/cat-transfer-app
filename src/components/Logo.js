import React from "react";
import LogoImg from "../assets/logo.png"
import {MDBCol, MDBRow} from "mdbreact";

const Logo = () => {

    return (
        <MDBRow className={"p-4 rounded"}>
            <MDBCol size={"3"} xl={"0"}/>
            <MDBCol size={"6"} xl={"12"} className="text-center">
                <img src={LogoImg} className="rounded img-fluid"/>
            </MDBCol>
        </MDBRow>
    )
}

export default Logo