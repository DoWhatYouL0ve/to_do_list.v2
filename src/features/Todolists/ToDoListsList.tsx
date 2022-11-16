import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import {Todolist} from "./ToDoList/Todolist";
import React, {useCallback, useEffect} from "react";
import {
    addToDoList,
    changeTodolistFilterAC, changeTodolistTitle, deleteToDoList,
    fetchTodolists,
    FilterValuesType,
    TodolistDomainType
} from "../../state/todolists-reducer";
import {AddItemForm} from "../../components/AddItemForm/AddItemForm";
import {useDispatch, useSelector} from "react-redux";
import {AppRootStateType} from "../../state/store";
import {addTask, deleteTask, updateTask} from "../../state/tasks-reducer";
import {TaskStatuses} from "../../api/todolists-api";
import {TasksStateType} from "../../app/App";
import { Navigate } from "react-router-dom";


export const ToDoListsList: React.FC = () => {

    const todolists = useSelector<AppRootStateType, Array<TodolistDomainType>>(state => state.todolists)
    const tasks = useSelector<AppRootStateType, TasksStateType>(state => state.tasks)
    const isLoggedIn = useSelector((state: AppRootStateType)=>state.auth.isLoggedIn)
    const dispatch = useDispatch();

    useEffect(()=> {
        if(!isLoggedIn) {
            return
        }
        dispatch(fetchTodolists())
    }, [])

    const removeTask = useCallback(function (id: string, todolistId: string) {
        dispatch(deleteTask({todolistId, id}))
    }, []);

    const addTaskHandler = useCallback(function (title: string, todolistId: string) {
        dispatch(addTask({title, todolistId}));
    }, []);

    const changeStatus = useCallback(function (id: string, status: TaskStatuses, todolistId: string) {
        dispatch(updateTask({id, domainModel: {status}, todolistId}));
    }, []);

    const changeTaskTitle = useCallback(function (id: string, newTitle: string, todolistId: string) {
        dispatch(updateTask({id, domainModel: {title: newTitle}, todolistId}));
    }, []);

    const changeFilter = useCallback(function (value: FilterValuesType, todolistId: string) {
        const action = changeTodolistFilterAC({id: todolistId, filter: value});
        dispatch(action);
    }, []);

    const removeTodolist = useCallback(function (id: string) {
        dispatch(deleteToDoList({id}));
    }, []);

    const changeTodolistTitleHandler = useCallback(function (id: string, title: string) {
        dispatch(changeTodolistTitle({id, title}));
    }, []);

    const addTodolist = useCallback((title: string) => {
        dispatch(addToDoList({title}));
    }, [dispatch]);

    if (!isLoggedIn) {
        return <Navigate to={'/login'}/>
    }

    return (
        <>
            <Grid container style={{padding: '20px'}}>
                <AddItemForm addItem={addTodolist}/>
            </Grid>
            <Grid container spacing={3}>
                {
                    todolists.map(tl => {
                        let allTodolistTasks = tasks[tl.id];

                        return <Grid item key={tl.id}>
                            <Paper style={{padding: '10px'}}>
                                <Todolist
                                    todoList={tl}
                                    tasks={allTodolistTasks}
                                    removeTask={removeTask}
                                    changeFilter={changeFilter}
                                    addTask={addTaskHandler}
                                    changeTaskStatus={changeStatus}
                                    removeTodolist={removeTodolist}
                                    changeTaskTitle={changeTaskTitle}
                                    changeTodolistTitle={changeTodolistTitleHandler}
                                />
                            </Paper>
                        </Grid>
                    })
                }
            </Grid>
        </>
    )
}