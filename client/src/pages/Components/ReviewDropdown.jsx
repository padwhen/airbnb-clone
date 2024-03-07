import { useEffect, useState } from "react";
import { AiOutlineCaretUp, AiOutlineCaretDown } from 'react-icons/ai'
import { WriteReview } from "./Review";
import axios from "axios";

export function ReviewDropdown({ onReviewSubmit }) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="relative w-[340px]">
            <button
                onClick={() => setIsOpen((prev) => !prev)}
                className="p-4 w-30 flex justify-center items-center rounded-lg tracking-wider
                    border-4 border-transparent active:border-white
                    duration-300 active:text-white relative"
            >
                <span className="flex items-center">
                    Give your review here!
                    {!isOpen ? (
                        <AiOutlineCaretDown className="h-6 ml-2" />
                    ) : (
                        <AiOutlineCaretUp className="h-6 ml-2" />
                    )}
                </span>
            </button>
            {isOpen && (
                <div className="absolute top-full left-0 bg-white p-2 rounded-lg mt-2">
                    <WriteReview onReviewSubmit={onReviewSubmit} />
                </div>
            )}
        </div>
    );
}

export function ReviewInformation({booking}) {
    const [userReview, setUserReview] = useState('Hello')
    axios.get(`account/bookings/${booking._id}/reviews`)
    .then(response => {
        setUserReview(response.data[0].average)
    })
    
    return (
        <div className="relative w-[340px]">
            <button className="p-4 w-30 flex justify-center items-center rounded-lg tracking-wider
                    border-4 border-transparent active:border-white
                    duration-300 active:text-white relative">
                Your average rating is {userReview}
            </button>
        </div>
    )
}