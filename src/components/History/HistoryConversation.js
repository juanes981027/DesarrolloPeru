import React, { useEffect } from "react";
import './HistoryConversation.css';
import axios from 'axios';
import { withTaskContext } from "@twilio/flex-ui";
import moment from "moment";


import "./HistoryConversation.css";

const baseURL = "https://fn-ms-historychattwilio-v1-prd-ol.azurewebsites.net/api/ReadMessages?code=EmaKw1qoBNILECL76MdYRwHlsSsWAAaGyg599bW/KMj7zpZQ6MAIsw=="

const digitalHiringPhoneNumber = "whatsapp:+50325045510";

class HistoryConversation extends React.Component {
    constructor(props) {
        super(props);
        this.taskName = this.props.task.attributes.name;
        this.state = {
            name: "History",
            taskName: this.props.task.attributes.name,
            isLoading: false
        };
        this.getMessages = this.getMessages.bind(this);
        //console.log("Task from constructor: " + props.task.attributes.name);
    }

    componentDidMount() {
        this.setState({isLoading:true})
        this.getMessages();
    }

    componentWillReceiveProps(nexProps) {
        if(this.props.task.attributes.name !== nexProps.task.attributes.name) {
            this.taskName = nexProps.task.attributes.name;
            this.getMessages(this.taskName);
        }
    } 

    /* 
    componentDidUpdate(prevProps, prevState){
        if(prevState.isLoading !== this.state.isLoading){
            this.getMessages(this.taskName);
        } 
        if (prevProps.taskName !== this.props.task.attributes.name) {
          this.getMessages(this.taskName);
            console.log("Printing from DidUpdate: " +this.taskName);
        }
    } */

    async getMessages(phoneNumber) {

        this.setState({ isLoading: true })

        
        if (this.taskName) {
            phoneNumber = this.taskName;
            //console.log("Phone Number Inside getMessage: " + phoneNumber);

            let isNumberCorrectFormated = phoneNumber.includes("whatsapp:+");
            //console.log("Phone Number is formated: " + isNumberCorrectFormated);

            phoneNumber = isNumberCorrectFormated ? phoneNumber : phoneNumber.substring(0, 9) + "+" + phoneNumber.substring(9, phoneNumber.length);
            //console.log("Now the Phone Number Format is: " + phoneNumber);

            let data = await axios
                .post(baseURL, {
                    "FromPhoneNumber": digitalHiringPhoneNumber,
                    "ToPhoneNumber": phoneNumber
                })
                .then(function (response) {
                    return response;
                })
                .catch(function (error) {
                    console.log(error);
                });
            this.setState({ messages: data.data, isLoading: false })
        }
    }


    

    render() {
        const { messages, isLoading } = this.state
        //console.log("Mi lista de Mensajes: " + messages);

        const { task } = this.props;
        //console.log("Task Name:" + task.attributes.name);
        //this.getMessages(task.attributes.name);
        //console.log("Updated prop: "+this.taskName);

        if(isLoading && task.channelType==="whatsapp") {
            return (
                <div className="container">
                    <p className="loadingMessage"> Loading... </p>
                </div>
            );
        } else {

        return ( task && task.channelType ==="whatsapp" ?
            <div className="container">
                {messages && messages.map(message =>
                    <div>
                        {
                            (function () {
                                if (message.from === digitalHiringPhoneNumber) {
                                    return (
                                        <div>
                                        <div className="columns">
                                            <div className="column">
                                                <div className="card is-primary-sender is-small is-pulled-left">
                                                    <div className="card-content">
                                                        <div className="content has-text-white">
                                                        <div className="chat-friendly-name">Webhelp El Salvador: {message.from}</div>
                                                        <div className="chat-message-body">{message.body}</div>
                                                        <div className="time-left">{moment.utc(message.date_sent).subtract(6,"hours").format("MM-DD-YYYY - hh:mm A")}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        </div>
                                    )
                                } else {
                                    return (
                                        <div>
                                        <div className="columns">
                                            <div className="column">
                                                <div className="card is-not-primary-sender is-small is-pulled-right">
                                                    <div className="card-content">
                                                        <div className="content has-text-black">
                                                        <span><div className="chat-friendly-name">Applicant: {message.from}</div> </span>
                                                        <div className="chat-message-body">{message.body}</div>
                                                        <div className="time-left">{moment.utc(message.date_sent).subtract(6,"hours").format("MM-DD-YYYY - hh:mm A")}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <br />
                                        </div>
                                        </div>
                                    )
                                }
                            })()
                        }
                    </div>
                )}
                <footer className="chat-footer"></footer>
            </div>: ""
        );
    }
    }
}

export default withTaskContext(HistoryConversation);