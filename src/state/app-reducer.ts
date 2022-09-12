export type RequestStatusType = 'idle' | 'loading' | 'succeeded' | 'failed'

const initialState: InitialStateType= {
    status: 'idle',
    error: null
}

type InitialStateType = {
    status: RequestStatusType
    error: string | null
}

export const appReducer = (state: InitialStateType = initialState, action: ActionsType): InitialStateType => {
    switch (action.type) {
        case 'APP/SET-STATUS':
            return {...state, status: action.status}
        case 'APP/SET-ERROR':
            return {...state, error: action.error}
        default:
            return state
    }
}

export type SetErrorType = ReturnType<typeof setError>
export type SetStatusType = ReturnType<typeof setStatus>

type ActionsType = SetErrorType | SetStatusType

// Action creators
export const setError = (error: string | null) => ({type: 'APP/SET-ERROR', error} as const)
export const setStatus = (status: RequestStatusType) => ({type: 'APP/SET-STATUS', status} as const)