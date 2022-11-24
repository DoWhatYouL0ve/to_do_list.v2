import React, {useCallback, useEffect} from 'react'
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import {Menu} from '@mui/icons-material';
import {TaskType} from '../api/todolists-api'
import {ToDoListsList} from "../features/Todolists/ToDoListsList";
import {CircularProgress, LinearProgress} from "@material-ui/core";
import CustomizedSnackbars from "../components/ErrorSnackBar/ErrorSnackBar";
import {useDispatch, useSelector} from "react-redux";
import {AppRootStateType} from "../state/store";
import {initializedApp, RequestStatusType} from "../state/app-reducer";
import {HashRouter, Navigate, Route, Routes} from "react-router-dom";
import {Login} from "../features/Login/Login";
import {logout} from "../state/login-reducer";



export type TasksStateType = {
    [key: string]: Array<TaskType>
}


function App() {
    const dispatch = useDispatch()
    const status = useSelector<AppRootStateType, RequestStatusType>((state => state.app.status))
    const isInitialized = useSelector<AppRootStateType, boolean>((state => state.app.isInitialized))
    const isLoggedIn = useSelector((state: AppRootStateType) => state.auth.isLoggedIn)

    useEffect(()=>{
        dispatch(initializedApp())
    },[])

    const logOut = useCallback(() => {
        dispatch(logout())
    }, [])

    if (!isInitialized) {
        return <CircularProgress style={{position: 'fixed', top: '40%', textAlign: 'center', marginLeft: '48%'}}/>
    }
    return (
        <HashRouter>
            <div className="App">
                <CustomizedSnackbars/>
                <AppBar position="static">
                    <Toolbar>
                        <IconButton edge="start" color="inherit" aria-label="menu">
                            <Menu/>
                        </IconButton>
                        <Typography variant="h6">
                            News
                        </Typography>
                        {isLoggedIn && <Button color="inherit" onClick={logOut}>Log out</Button>}
                    </Toolbar>
                    {status === 'loading' && <LinearProgress/>}
                </AppBar>
                <Container fixed>
                    <Routes>
                        <Route path={'/login'} element={<Login/>}/>
                        <Route path={'/'} element={<ToDoListsList/>}/>
                        <Route path="/404" element={<h1>404: PAGE NOT FOUND</h1>}/>
                        <Route path="*" element={<Navigate to='/404'/>}/>
                    </Routes>
                </Container>
            </div>
        </HashRouter>
    );
}

export default App;
