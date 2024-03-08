import { useEffect, useState } from "react";
import AccountNav from "../../AccountNav";
import PlaceImg from "../../PlaceImg";
import { Link } from "react-router-dom";
import { formatDate, isPast } from "../../Functions";
import { ReviewDropdown, ReviewInformation } from "../Components/ReviewDropdown";
import axios from "axios";

export default function BookingsPage() {
    const [bookings, setBookings] = useState([])
    const [reviewedBookings, setReviewedBookings] = useState([])
    const [submitReviewChecked, setSubmitReviewChecked] = useState(false)

    useEffect(() => {
        axios.get('/bookings')
        .then(response => {
            setBookings(response.data)
        })
    }, [submitReviewChecked])

    const currentDate = new Date()
    const pastBookings = bookings.filter(booking => new Date(booking.checkOut) < currentDate)
    const currentBookings = bookings.filter(booking => new Date(booking.checkIn) <= currentDate && new Date(booking.checkOut) >= currentDate)
    const futureBookings = bookings.filter(booking => new Date(booking.checkIn) > currentDate)

    const handleReviewSubmit = (bookingId, reviewData) => {
        axios.post(`/account/bookings/${bookingId}/reviews`, {ratings: reviewData.criteriaRatings, average: reviewData.averageRating})
        .then(response => {
            console.log('ok')
            console.log(submitReviewChecked)
            setSubmitReviewChecked((prev) => !prev)
            console.log(submitReviewChecked)
        })
        .catch(error => {
            console.log('error')
        })
    }
    const isReviewed = async (booking) => {
        const reviewEndpoint = `/account/bookings/${booking._id}/reviews`;
        try {
            const response = await axios.get(reviewEndpoint);
            if (Array.isArray(response.data) && response.data.length > 0 && 'average' in response.data[0]) {
                console.log('true', booking._id);
                return true;
            } else {
                console.log('false', booking._id);
                return false;
            }
        } catch (error) {
            console.error('Error fetching review data for booking:', booking._id, error);
            return false; 
        }
    }
    
    const getReviewedBookings = async (bookings) => {
        const reviewedBookings = [];
        for (const booking of bookings) {
            const reviewEndpoint = `/account/bookings/${booking._id}/reviews`;
            try {
                const response = await axios.get(reviewEndpoint);
                if (Array.isArray(response.data) && response.data.length > 0 && 'average' in response.data[0]) {
                    reviewedBookings.push(booking._id);
                }
            } catch (error) {
                console.error('Error', error);
            }
        }
        return reviewedBookings;
    };
        
    useEffect(() => {
        getReviewedBookings(bookings).then((result) => setReviewedBookings(result))
    }, [bookings])

    const renderBooking = (bookingsArray) => {
        return bookingsArray.map((booking, index) => (
            <div className="flex flex-row">
                <Link to={`/account/bookings/${booking._id}`} 
                    key={booking._id}
                    className="flex gap-4 w-3/4 bg-gray-200 rounded-2xl overflow-hidden mb-4 mr-4">
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
                {isPast(booking) && (
                    reviewedBookings.includes(booking._id) ?  (
                        <div className="flex-grow-1">
                            <ReviewInformation booking={booking} />
                        </div>
                    ) : (
                        <div className="flex-grow-1">
                            <ReviewDropdown onReviewSubmit={(reviewData) =>
                            handleReviewSubmit(booking._id, reviewData)} />
                        </div>
                    )
                )}
            </div>
        ))
    }

    return (
        <div>
            <AccountNav />
            <div>
                {bookings.length == 0 && (
                    <div className="items-center">
                        No booking yet!
                    </div>
                )}
                {currentBookings.length > 0 && (
                    <div>
                      <h1 className="text-2xl hover:italic pb-2 font-semibold">Current Bookings</h1> 
                      {renderBooking(currentBookings)}                   
                    </div>
                )}
                {futureBookings.length > 0 && (
                    <div>
                      <h1 className="text-xl hover:italic pb-2 font-semibold">Future Bookings</h1> 
                      {renderBooking(futureBookings)}                   
                    </div>
                )}                
                {pastBookings.length > 0 && (
                    <div>
                      <h1 className="text-xl hover:italic pb-2 font-semibold">Past Bookings</h1> 
                      {renderBooking(pastBookings)}        
                    </div>
                )}
            </div>
        </div>
    )
}