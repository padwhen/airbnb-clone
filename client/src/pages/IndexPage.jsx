import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import { useContinent } from "./Components/AnywhereOptions"
import { extractCountryFromAddress } from "./Components/AnywhereOptions"
import countries from '../../country.json'
import {shuffleArray} from "../Functions"

export default function IndexPage() {
    const [places, setPlaces] = useState([])
    const { selectedOption } = useContinent()
    useEffect(() => {
        axios.get('/places').then(response => {
            const fetchedPlaces = [...response.data];
            if (selectedOption !== 'Anywhere') {
                const filteredPlaces = fetchedPlaces.filter(place => {
                    const country = extractCountryFromAddress(place.address, countries);
                    return selectedOption === country;
                });
                setPlaces(shuffleArray(filteredPlaces));
            } else {
                setPlaces(shuffleArray(fetchedPlaces));
            }
        });
    }, [selectedOption]);

    return (
        <div className="mt-8 grid gap-x-6 gap-y-8 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            {places.length > 0 && places.map(place => (
                <Link to={'/places/'+place._id}>
                    <div className="hover:bg-gray-200 rounded-xl transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg">
                        <div className="bg-gray-500 mb-2 rounded-2xl flex">
                        {place.photos?.[0] && (
                            <img className="rounded-2xl object-cover aspect-square" src={place.photos?.[0]} alt="" />
                        )}
                        </div>
                        <h2 className="font-bold">{place.address}</h2>
                        <h3 className="text-sm leading-4">{place.title}</h3>
                        <div className="mt-1">
                            <span className="font-bold">${place.price}</span> per night 
                        </div>                         
                    </div>     
                </Link>
            ))}
        </div>
    )
}