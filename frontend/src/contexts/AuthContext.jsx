import { createContext, useContext, useState } from "react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import httpStatus from 'http-status';
import server from "../environment";


export const AuthContext = createContext({});

const client = axios.create({
    baseURL: `${server}/api/v1/user`,

});

export const AuthProvider = ({children}) => {
    const authContext = useContext(AuthContext);

    const [userData, setUserData] = useState(authContext);

    const router = useNavigate();

    const handleRegister = async (name, username, password) => {
        try {
            const request = await client.post('/register', {
                name: name,
                username: username,
                password: password
            });

            if(request.status === httpStatus.CREATED){
                router('/login');
                return request.data.message;
            }
        } catch (error) {
            throw error;
        }
    }

    const handleLogin = async (username, password) => {
        try {
            const request = await client.post('/login', {
                username: username,
                password: password
            });

            if(request.status === httpStatus.OK){
                localStorage.setItem("token", request.data.token);
                router('/home');
            }
        } catch (error) {
            throw error;
        }
    }

    const getHistoryOfUser = async () => {
        try {
            let request = await client.get("get_all_activities", {
                params: {
                    token: localStorage.getItem("token")
                }
            });
            return request.data;
        } catch (error) {
            throw error;
        }
    };

    let addToUserHistory = async (meetingCode) => {
        try {
            let request = await client.post("/add_to_activity", {
                token: localStorage.getItem("token"),
                meeting_code: meetingCode
            });
            return request;
        } catch (error) {
            throw error;
        }
    };

    const data ={ 
        userData, setUserData, handleRegister, handleLogin, getHistoryOfUser, addToUserHistory
    }

    return (
        <AuthContext.Provider value={data}>
            {children}
        </AuthContext.Provider>
    )
}