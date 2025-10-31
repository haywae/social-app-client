import { useAppDispatch } from "../../utils/hooks"
import { checkAuth } from "../../thunks/authThunks/authCheckThunk"
import './connectionError.css'

const ConnectionError = () => {
    const dispatch = useAppDispatch()
    return (
        <div className='connection-error'>
            <h1>Connection Error</h1>
            <p>We couldn't connect to the server. Please check your internet connection.</p>
            <button onClick={() => dispatch(checkAuth())}>Try Again</button>
        </div>
    )
}

export default ConnectionError
