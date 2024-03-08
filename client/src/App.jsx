import { Route, Routes } from 'react-router-dom';
import './index.css'
import IndexPage from './pages/IndexPage';
import LoginPage from './pages/Account/LoginPage';
import Layout from './Layout';
import RegisterPage from './pages/Account/RegisterPage';
import axios from 'axios';
import { UserContextProvider } from './UserContext';
import AccountPage from './pages/Account/Account';
import PlacesFormPage from './pages/Pages/PlacesFormPage';
import PlacePage from './pages/Pages/PlacePage';
import BookingsPage from './pages/Booking/BookingsPage';
import BookingPage from './pages/Booking/BookingPage';

axios.defaults.baseURL = 'http://localhost:4000/api'
axios.defaults.withCredentials = true

function App() {
  return (
    <UserContextProvider>
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<IndexPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/account/:subpage?" element={<AccountPage />} />
        <Route path="/account/:subpage/:action" element={<AccountPage />} />
        <Route path="/account/places/new" element={<PlacesFormPage />} />
        <Route path="/account/places/:id" element={<PlacesFormPage />} />
        <Route path="/places/:id" element={<PlacePage />} />
        <Route path="/account/bookings" element={<BookingsPage />} />
        <Route path="/account/bookings/:id" element={<BookingPage />} />
      </Route>
    </Routes>
    </UserContextProvider>
  );
}

export default App;