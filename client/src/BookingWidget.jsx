import { useContext, useEffect, useState } from "react"
import axios from "axios";
import { Navigate } from "react-router-dom";
import { UserContext } from "./UserContext";

export default function BookingWidget({place}) {

    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
    const day = String(currentDate.getDate()).padStart(2, '0');
    const dayOut = String(currentDate.getDate() + 2).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    const formattedDateOut = `${year}-${month}-${dayOut}`;
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
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkInDate);
        checkOutDate.setDate(checkInDate.getDate() + 2);
        const yearOut = checkOutDate.getFullYear();
        const monthOut = String(checkOutDate.getMonth() + 1).padStart(2, '0');
        const dayOut = String(checkOutDate.getDate()).padStart(2, '0');
        const formattedDateOut = `${yearOut}-${monthOut}-${dayOut}`;
        setCheckOut(formattedDateOut);
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
                        <input type="text" placeholder="Seol YoonA" value={name} onChange={event => setName(event.target.value)}/>
                        <label>Phone number:</label>
                        <input type="tel" placeholder="+358-XX-XXX-XXXX" value={mobile} onChange={event => setMobile(event.target.value)}/>
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