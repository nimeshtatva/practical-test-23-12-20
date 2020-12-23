import React, { useState, useEffect } from 'react'
import Log from '../types/Log';
import SocketUIType from '../types/SocketUIType'
import {SocketState} from '../util/Enum'
import {CONNECTED_MSG,DISCONNECTED_MSG} from '../util/Constants'
import './SocketUI.css'

export const SocketUI = () => {
    const [socketState, setSocketState] = useState<SocketUIType>({
        Url: '',
        showLog: false,
        message: ''
    });
    const [logs, setLogs] = useState<Log[]>([]);
    const [connected, setConnected] = useState<boolean>(false);
    const [clientSocket, setClientSocket] = useState<WebSocket | null>(null);
    
    const onUrlChange = (e: any) => {
        setSocketState({
            ...socketState,
            Url: e.target.value
        })
    }
    const onMessageChange = (e : any) => {
        setSocketState({
            ...socketState,
            message: e.target.value
        })              
    }
    const toggleOnOff = (e: any) => {
        setSocketState({
            ...socketState,
            showLog: e.target.checked
        })
    }
    
    useEffect(() => {
        if (clientSocket != null) {
            clientSocket.onopen = () => {
                if (clientSocket != null && clientSocket.readyState === SocketState.OPEN) {                    
                    setLogs((logs)=>[...logs, {message: CONNECTED_MSG}]);
                    setConnected(true);
                }                            
            };      
            clientSocket.onclose= () => {
                if (clientSocket != null && clientSocket.readyState === SocketState.CLOSED) {                    
                    setLogs((logs)=>[...logs, {message: DISCONNECTED_MSG}]);
                    setConnected(false);
                }                
            };      
            clientSocket.onmessage = (message) => {
                setLogs((logs)=>[...logs, {message: `RECEIVE: ${message.data}`}]);
            };
        }
    }, [clientSocket])

    const onConnect = () => {
        if (socketState.Url) {
            setClientSocket(new WebSocket(socketState.Url));                        
        }        
    }
    const onDisconnect = () => {
        if (clientSocket != null && clientSocket.readyState === SocketState.OPEN) {            
            clientSocket.close();                  
        }
    }
    const onSend = () => {
        if (clientSocket && clientSocket.readyState === SocketState.OPEN) {
            setLogs((logs)=>[...logs, {message: `SEND: ${socketState.message}`}])
            clientSocket.send(socketState.message)
        }        
    }
    

    

    return (
        <div className="container">
            <div className="form-group">                
                <input type="text" value={socketState.Url} onChange={onUrlChange} placeholder="wss url field" />
                <button type="button" onClick={onConnect} disabled={connected}>Connect</button>
                <button type="button" onClick={onDisconnect} >Disconnect</button>
            </div>
            <div className="form-group">                
                <input type="text" value={socketState.message} onChange={onMessageChange} placeholder="event payload" />
                <button type="button" onClick={onSend} disabled={!connected}>Send</button>                
            </div>
            <div className="form-group">
                <label>
                    Show Log
                    <input type="checkbox" name="OnOff" onChange={toggleOnOff} />
                    {
                        (socketState.showLog ? "ON" : "OFF")
                    }
                </label>                
            </div>
                {
                    (socketState.showLog) ? (
                        <div className="form-group">
                            <div className="chat-panel">
                                {
                                    logs.map((log : Log) => (
                                        <span>{log.message}</span>
                                    ))
                                }
                            </div>
                        </div>
                    ) : <></>
                }
        </div>
    )
}
