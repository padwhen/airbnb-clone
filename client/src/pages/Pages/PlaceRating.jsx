import axios from "axios";
import { useState, useEffect } from "react";
import { calculateOverallAverage } from "../../Functions";
import { Line } from 'rc-progress'

export const PlaceRating = ({ placeId }) => {
  const reviewEndpoint = `places/${placeId}/reviews-in-this-place`;
  const [placeReview, setPlaceReview] = useState(null);

  useEffect(() => {
    axios.get(reviewEndpoint)
      .then((response) => setPlaceReview(response.data));
  }, [placeId, reviewEndpoint]);

  const average = calculateOverallAverage(placeReview, "average")
  const cleaniess = calculateOverallAverage(placeReview, "cleaniness")
  const accuracy = calculateOverallAverage(placeReview, "cleaniness")
  const location = calculateOverallAverage(placeReview, "cleaniness")
  const checkIn = calculateOverallAverage(placeReview, "cleaniness")
  const value = calculateOverallAverage(placeReview, "cleaniness")
  const checkOut = calculateOverallAverage(placeReview, "cleaniness")

  const calculateProgressBarWidth = (average) => {
    return average / 5 * 100
  }
  console.log(calculateProgressBarWidth(average))


  return (
    <div>
      {placeReview.length > 0 ? (
        <div className="w-[450px] space-y-2 mt-2">
            <div>
                <span className="text-lg font-bold">Average: {average}</span>
                <Line percent={calculateProgressBarWidth(average)} strokeColor="#F5385D" />
            </div>
            <div>
                Cleaniness: {cleaniess}
                <Line percent={calculateProgressBarWidth(cleaniess)} strokeColor="#F5385D" />
            </div>            
            <div>
                Accuracy: {accuracy}
                <Line percent={calculateProgressBarWidth(accuracy)} strokeColor="#F5385D" />
            </div>            
            <div>
                Location: {location}
                <Line percent={calculateProgressBarWidth(location)} strokeColor="#F5385D" />
            </div>            
            <div>
                Check In Time: {checkIn}
                <Line percent={calculateProgressBarWidth(checkIn)} strokeColor="#F5385D" />
            </div>            
            <div>
                Price: {value}
                <Line percent={calculateProgressBarWidth(value)} strokeColor="#F5385D" />
            </div>            
            <div>
                Check Out Time: {checkOut}
                <Line percent={calculateProgressBarWidth(checkOut)} strokeColor="#F5385D" />
            </div>            
        </div>
      ) : (
        <div className="space-y-2 mt-2">
            <span className="text-lg font-semibold">No one have stayed here YET</span>
        </div>
      )}
    </div>
  );
};
