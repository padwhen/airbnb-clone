import { Outlet } from "react-router-dom";
import Header from "./Header";
import { ContinentProvider } from "./pages/Components/AnywhereOptions";

export default function Layout() {
    return (
        <div className="p-4 flex flex-col min-h-screen">
            <ContinentProvider>
                <Header />
                <Outlet />                
            </ContinentProvider>
        </div>
    )
}