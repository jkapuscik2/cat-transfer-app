import React, {useEffect, useState} from "react";
import styled from "styled-components"

const Container = styled.div`
  background-image: ${props => props.img ? `url(${props.img})` : ""};
  background-size: 100%;
`
const CAT_API_URL = "https://api.thecatapi.com/v1/images/search"

const CenterContainer = ({children}) => {
    const [cat, setCat] = useState("");

    useEffect(() => {
        const getCat = async () => {
            return (await fetch(CAT_API_URL)).json();
        }

        getCat().then((data) => {
            setCat(data[0].url)
        })
    }, [])

    return (
        <Container className="d-flex align-items-center min-vh-100" img={cat}>
            {children}
        </Container>
    )
}

export default CenterContainer