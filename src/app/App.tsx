import React from 'react'
import './App.css';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import { Menu } from '@mui/icons-material';
import {TaskType} from '../api/todolists-api'
import {ToDoListsList} from "../features/Todolists/ToDoListsList";
import {LinearProgress} from "@material-ui/core";
import CustomizedSnackbars from "../components/ErrorSnackBar/ErrorSnackBar";
import {useSelector} from "react-redux";
import {AppRootStateType} from "../state/store";
import {RequestStatusType} from "../state/app-reducer";


export type TasksStateType = {
    [key: string]: Array<TaskType>
}


function App() {

    const status = useSelector<AppRootStateType, RequestStatusType>((state=>state.app.status))

    return (
        <div className="App">
            <CustomizedSnackbars />
            <AppBar position="static">
                <Toolbar>
                    <IconButton edge="start" color="inherit" aria-label="menu">
                        <Menu/>
                    </IconButton>
                    <Typography variant="h6">
                        News
                    </Typography>
                    <Button color="inherit">Login</Button>
                </Toolbar>
                {status === 'loading' && <LinearProgress />}
            </AppBar>
            <Container fixed>
                <ToDoListsList />
            </Container>
        </div>
    );
}

export default App;
