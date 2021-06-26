
/*****************************Imports*********************/

import Popup from "./Popup";

/*****************************Component*********************/
function LoadingDialog()
{
    return (
        <div>
            <Popup title="Loading">
                <div className="loading-dialog">
                    <div className="loader"></div>
                </div>
            </Popup>
        </div>
    )
}

/*****************************Exports*********************/
export default LoadingDialog;
