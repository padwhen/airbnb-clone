import { useEffect, useState } from "react";
import { FaStar } from "react-icons/fa";
import { AiOutlineCaretUp, AiOutlineCaretDown } from 'react-icons/ai'

export function Review({ onRate, keyProp }) {
    const [rating, setRating] = useState(null)
    const [rateColor, setColor] = useState(null)

    useEffect(() => {
        setRating(null)
    }, [keyProp])

    const handleRating = (currentRate) => {
        setRating(currentRate)
        onRate(currentRate)
    }
    

    return (
        <div className="flex">
            {[...Array(5)].map((star, index) => {
                const currentRate = index + 1
                return (
                    <label key={index}>
                        <input className='hidden' type='radio' name='rate' onChange={() => handleRating(currentRate)} value={currentRate} />
                        <FaStar size={30} color={currentRate <= (rateColor || rating) ? '#facc15' : 'gray'} />
                    </label>
                )
            })}
        </div>
    )
}

export function WriteReview({ onReviewSubmit }) {
    const criteriaList = ["cleaniness", "accuracy", "location", "checkIn", "value", "checkOut"]
    
    const [criteriaRatings, setCriteriaRatings] = useState({
        cleaniness: null,
        accuracy: null,
        location: null,
        checkIn: null,
        value: null,
        checkOut: null
    })

    const [showAverage, setShowAverage] = useState(false)
    const [currentStep, setCurrentStep] = useState(0)

    const handleCriterionRating = (criterion, rating) => {
        setCriteriaRatings((prevRatings) => ({
            ...prevRatings,
            [criterion]: rating
        }))
        setTimeout(() => {
            setCurrentStep((prevStep) => prevStep + 1)
        }, 500)
        if (currentStep === criteriaList.length - 1) {
            setTimeout(() => {
                setShowAverage(true)
            }, 500)
        }
    }

    const calculateAverateRating = () => {
        const totalRatings = Object.values(criteriaRatings).filter(
            (rating) => rating !== null
        )
        if (totalRatings.length > 0) {
            const averageRating =
                totalRatings.reduce((sum, rating) => sum + rating, 0) / 
                totalRatings.length
            return isNaN(averageRating) ? 0 : averageRating 
        } else {
            return 0;
        }
    }
    const handleSubmitReview = () => {
        const averageRating = calculateAverateRating().toFixed(2)
        onReviewSubmit({
            criteriaRatings,
            averageRating
        })
    }
    return (
        <div>
            {currentStep < criteriaList.length && (
                <div className="duration-300 flex gap-2 items-center justify-center h-full">
                    <span className="font-bold">
                    {(criteriaList[currentStep]).toUpperCase()}                        
                    </span>
                    <Review
                        keyProp={currentStep}
                        onRate={(rating) => handleCriterionRating(criteriaList[currentStep], rating)}
                    />
                </div>
            )}
            {showAverage && (
                <div className="flex justify-center font-bold text-xl mr-7">
                    Average rating: {calculateAverateRating().toFixed(2)} / 5
                </div>           
            )}
            {showAverage && (
                <div className="flex justify-center mt-1">
                    <button
                    onClick={handleSubmitReview}
                    className="px-4 py-2 rounded">
                        Submit review
                    </button>
                </div>
            )}
        </div>
    )
}


