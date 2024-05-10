import { useContext, useEffect, useState } from "react"
import axios from "axios";
import { Navigate } from "react-router-dom";
import { UserContext } from "./UserContext";
import { getCurrentTime, setCheckOutDate } from './Functions'

const { formattedDate, formattedDateOut } = getCurrentTime()

export default function BookingWidget({place}) {

    const [checkIn, setCheckIn] = useState(formattedDate);
    const [checkOut, setCheckOut] = useState(formattedDateOut);
    const [numberOfGuests, setNumberOfGuests] = useState(1) 

    const calculateTime = () => {
        const checkInDate = new Date(checkIn)
        const checkOutDate = new Date(checkOut)
        const timeDifference = (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 3600 * 24)
        return Math.max(2,Math.floor(timeDifference));
    }

    const [name, setName] = useState('')
    const [mobile, setMobile] = useState('')
    const [redirect, setRedirect] = useState('')

    const {user} = useContext(UserContext)

    useEffect(() => {
        if (user) {
            setName(user.name)
        }
    }, [])

    useEffect(() => {
        setCheckOutDate(checkIn, setCheckOut)
    }, [checkIn]);

    async function bookThisPlace() {
        const response = await axios.post('/booking', {checkIn, checkOut, 
            numberOfGuests, name, mobile, place: place._id,
            price:place.price * calculateTime() })
        const bookingId = response.data._id;
        setRedirect(`/account/bookings/${bookingId}`)
    }
    if (redirect) {
        return <Navigate to={redirect} />
    }

    return (
        <div>
        <div className="bg-white shadow p-4 rounded-2xl">
            <div className="text-2xl text-center">
            Price: ${place.price} / per night
            </div>
            <div className="border rounded-2xl mt-4">
                <div className="flex">
                    <div className="py-3 px-4">
                    <label>Check in:</label>
                    <input type="date" min={checkIn} value={checkIn} onChange={event => setCheckIn(event.target.value)} />
                    </div>

                    <div className="py-3 px-4 border-l">
                    <label>Check out:</label>
                    <input type="date" min={checkOut} value={checkOut} onChange={event => setCheckOut(event.target.value)} name="" id="" />
                    </div>
                </div>

                <div className="py-3 px-4 border-t">
                    <label>Number of guests:</label>
                    <input type="number" min={1} max={place.maxGuests} value={numberOfGuests} onChange={event => setNumberOfGuests(event.target.value)} />
                </div>
                <div className="py-3 px-4 border-t">
                {calculateTime() > 0 && (
                    <div>
                        <label>Your full name:</label>
                        <input type="text" placeholder="First Name - Last Name" value={name} onChange={event => setName(event.target.value)}/>
                        <label>Phone number:</label>
                        <input type="tel" placeholder="+[CountryCode]-XX-XXX-XXXX" value={mobile} onChange={event => setMobile(event.target.value)}/>
                    </div>
                )}
                </div>

            </div>
            <button onClick={bookThisPlace} className="primary mt-4">Reserve</button>
            <div className="py-3 px-4 border-t text-center">
                    You won't be charged yet
                <p className="text-sm">2 days minimum in our system</p>
            </div>

                <div className="py-3 px-4 border-t d-flex justify-content-between">
                        <u>€ {place.price} x {calculateTime()} nights </u>
                        € {place.price * calculateTime()}
                </div>

        </div>
    </div>
    )
}