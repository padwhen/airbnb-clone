import { useContext, useState} from "react"
import { UserContext } from "../../UserContext"
import { Link, Navigate, useParams } from "react-router-dom"
import axios from "axios";
import PlacesPage from "../Pages/PlacesPage";
import AccountNav from "../../AccountNav";

export default function AccountPage() {
    let {subpage} = useParams();
    const [redirect, setRedirect] = useState(null)
    const {ready, user, setUser} = useContext(UserContext)

    if (!ready) {
        return 'Loading....';
    }

    if (ready && !user && !redirect || ready && user === 'error' && !redirect) {
        return <Navigate to={'/login'} />
    }

    if (subpage === undefined) {
        subpage = 'profile';
    }

    async function logout() {
        await axios.post('/logout')
        setUser(null)
        setRedirect('/')
    }

    if (redirect) {
        return <Navigate to={redirect} />
    }
    return (
        <div>
            <AccountNav />
            {subpage === 'profile' && (
                <div className="text-center max-w-lg mx-auto">
                    Logged in as {user.name} ({user.email})
                    <button onClick={logout} className="primary max-w-sm mt-2">Logout</button>
                </div>
            )}
            {subpage === 'places' && (
                <div>
                    <PlacesPage />
                </div>
            )}
        </div>
    )
}