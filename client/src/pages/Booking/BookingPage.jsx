import { useEffect } from "react"
import { useParams } from "react-router-dom"
import { useState } from "react"
import axios from "axios"
import AddressLink from "../../AddressLink"
import PlaceGallery from "../Pages/PlaceGallery"

export default function BookingPage() {
    const {id} = useParams()
    const [booking, setBooking] = useState(null)
    useEffect(() => {
        if (id) {
            axios.get('/bookings').then(response => {
                const foundBooking = response.data.find(({_id}) => _id === id)
                if (foundBooking) {
                    setBooking(foundBooking)
                }
            })
        }
    }, [id])

    if (!booking) {
        return ''
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    };

    return (
        <div className="my-8">
            <h1 className="text-3xl">{booking.place.title}</h1>
            <AddressLink className="my-2 block">{booking.place.address}</AddressLink>
            <div className="bg-gray-200 p-4 mb-4 rounded-2xl">
                <h2 className="text-xl">Your booking information: </h2>
                <div className="border-t border-gray-300 mt-2 py-2">
                    {formatDate(booking.checkIn)} &rarr; {formatDate(booking.checkOut)}
                </div>

                <div className="text-xl">
                    Total price: €{booking.price}
                </div>
            </div>
            <PlaceGallery place={booking.place} />
        </div>
    )
}