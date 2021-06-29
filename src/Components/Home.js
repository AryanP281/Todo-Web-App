
/*****************************Imports*********************/
import { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { getCookies } from "../Services/Services";
import { Dashboard } from "./Dashboard";
import LoadingDialog from "./LoadingDialog";
import NewListDialog from "./NewListDialog";

/*****************************Component*********************/
let popupSetter;

/*****************************Component*********************/
function Home()
{
    const [popup, setPopup] = useState(<LoadingDialog />);
    const history = useHistory();

    popupSetter = setPopup;

    //Checking if user has logged in
    /*
    const cookiesMap = getCookies();
    if(!cookiesMap.has("auth"))
        history.replace("/signin"); //Redirecting to sign in page
    */ 

    return (
        <div className="home">
            <Dashboard />
            {popup && (popup)}
        </div>
    );
}

function displayPopup(popup)
{
    /*Displays the provided popup component*/

    popupSetter(popup);
}

/*****************************Exports*********************/
export default Home;
export {displayPopup};
