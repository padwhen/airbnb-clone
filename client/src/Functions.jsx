export const shuffleArray = array => {
    const shuffledArray = [...array];
    for (let i = shuffledArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
    }
    return shuffledArray;
}
export const getCurrentTime = () => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const dayOut = String(currentDate.getDate() + 2).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    const formattedDateOut = `${year}-${month}-${dayOut}`;
    return { formattedDate, formattedDateOut };
}

export const setCheckOutDate = (checkIn, setCheckOut) => {
    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkInDate)
    checkOutDate.setDate(checkInDate.getDate() + 2)
    const yearOut = checkOutDate.getFullYear()
    const monthOut = String(checkOutDate.getMonth() + 1).padStart(2, '0')
    const dayOut = String(checkOutDate.getDate()).padStart(2, '0')
    const formattedDayOut = `${yearOut}-${monthOut}-${dayOut}`
    setCheckOut(formattedDayOut)
}

export const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
};

export const isPast = (date) => {
    const currentDate = new Date()
    return new Date(date.checkOut) < currentDate
}

export const calculateOverallAverage = (reviews, property) => {
    if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
        return 0;
    }
    const sumOfAverages = reviews.reduce((total, review) => {
        let value;
        if (property === 'average') {
            value = review.review[property];
        } else {
            value = review.review.ratings[property];
        }
        return total + value;
    }, 0);
    const overallAverage = sumOfAverages / reviews.length;
    return overallAverage;
}
