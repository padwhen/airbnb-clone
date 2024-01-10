import { useEffect, useState } from "react";
import AccountNav from "../AccountNav";
import axios from "axios";
import PlaceImg from "../PlaceImg";
import { Link } from "react-router-dom";

export default function BookingsPage() {
    const [bookings, setBookings] = useState([])
    useEffect(() => {
        axios.get('/bookings')
        .then(response => {
            setBookings(response.data)
        })
    }, [])

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    };

    return (
        <div>
            <AccountNav />
            <div>
                {bookings?.length > 0 && bookings.map(booking => (
                    <Link to={`/account/bookings/${booking._id}`} className="flex gap-4 bg-gray-200 rounded-2xl overflow-hidden">
                        <div className="w-48">
                            <PlaceImg place={booking.place} />
                        </div>
                        <div className="py-3 grow pr-3">
                            <h2 className="text-xl">{booking.place.title}</h2>
                            <div className="border-t border-gray-300 mt-2 py-2">
                            {formatDate(booking.checkIn)} &rarr; {formatDate(booking.checkOut)}
                            </div>
                            <div className="text-xl">
                                Total price: €{booking.price}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}