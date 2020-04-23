import React, {useState} from "react"
import {MDBInput, MDBBtn, MDBCard, MDBCardBody, MDBIcon, MDBAlert} from 'mdbreact';
import {API} from "aws-amplify"

const MAX_FILE_SIZE = 20 // MB

const Form = () => {
    const [state, setState] = useState({
        emailFrom: "",
        emailTo: "",
        message: "",
        files: [],
        errors: {},
        success: "",
        loading: false
    })

    const handleChange = (e) => {
        const name = e.target.name;

        setState({
            ...state,
            [name]: e.target.value
        });
    }

    const checkFilesSize = files => {
        let totalSize = 0

        for (let idx = 0; idx < files.length; idx++) {
            totalSize += files[idx].size
        }

        return totalSize < MAX_FILE_SIZE
    }

    const handleFiles = files => {
        let allFiles = [];

        for (let i = 0; i < files.length; i++) {
            let file = files[i];
            let reader = new FileReader();
            reader.readAsDataURL(file);

            reader.onload = () => {

                allFiles.push({
                    name: file.name,
                    type: file.type,
                    size: file.size / Math.pow(1024, 2), // bytes to Mb
                    base64: reader.result
                });

                if (allFiles.length == files.length) {
                    if (checkFilesSize(allFiles)) {
                        const errors = {...state.errors}
                        delete errors.maxSizeExceeded

                        setState({...state, files: allFiles, errors: errors})
                    } else {
                        const errors = {...state.errors, maxSizeExceeded: `Max size of files is ${MAX_FILE_SIZE} Mb`}
                        setState({...state, success: "", errors: errors})
                    }
                }
            }
        }
    }

    const onSubmit = async (e) => {
        e.preventDefault()

        setState({...state, loading: true, success: ""})

        API.post("files", "/files", {
            body: {
                emailFrom: state.emailFrom,
                emailTo: state.emailTo,
                message: state.message,
                files: state.files
            },
            headers: {
                "Content-Type": "application/json"
            }
        }).then(async (response) => {
            setState({
                ...state,
                loading: false,
                success: `Your cat pics have been shared! ${await API.endpoint("files")}${response.url}`,
                errors: []
            })

        }).catch((e) => {
            const errors = {...state.errors, serverError: e.response.data.message}

            setState({...state, loading: false, success: "", errors: errors})
        })
    }

    return (
        <MDBCard className={"rounded"}>
            <MDBCardBody cascade className={"p-4"}>
                <form encType="multipart/form-data" onSubmit={onSubmit}>
                    <div className="grey-text">
                        <MDBInput icon="file-image"
                                  name={"files[]"}
                                  validate
                                  required
                                  onChange={(e) => handleFiles(e.target.files)}
                                  type="file"
                                  multiple={true}
                                  error="wrong"
                                  success="right"
                                  accept="image/png, image/jpeg"/>
                        <MDBInput label="Email to"
                                  onChange={handleChange}
                                  value={state.emailTo}
                                  name={"emailTo"}
                                  icon="envelope"
                                  group
                                  type="email"
                                  validate
                                  required
                                  error="wrong"
                                  success="right"/>
                        <MDBInput label="Your email"
                                  onChange={handleChange}
                                  value={state.emailFrom}
                                  name={"emailFrom"}
                                  icon="envelope"
                                  group
                                  type="email"
                                  validate
                                  required
                                  error="wrong"
                                  success="right"/>
                        <MDBInput type="textarea"
                                  onChange={handleChange}
                                  value={state.message}
                                  name={"message"}
                                  rows="4"
                                  label="Your message"
                                  icon="pencil-alt"/>
                    </div>
                    <div className="text-center">
                        <MDBBtn outline color="secondary" disabled={state.loading} type={"submit"}>
                            {state.loading ?
                                <MDBIcon icon="circle-notch" spin/>
                                : "Transfer"
                            }
                        </MDBBtn>

                        {state.success ?
                            <MDBAlert color="success" className={"mt-2"}>
                                {state.success}
                            </MDBAlert>
                            : ""
                        }
                        {Object.keys(state.errors).length ?
                            Object.keys(state.errors).map(errorIdx => (
                                <MDBAlert color="danger" className={"mt-2"} key={state.errors[errorIdx]}>
                                    {state.errors[errorIdx]}
                                </MDBAlert>
                            ))
                            : ""
                        }
                    </div>
                </form>
            </MDBCardBody>
        </MDBCard>
    )
}

export default Form