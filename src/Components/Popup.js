
/*****************************Imports*********************/
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faWindowClose} from "@fortawesome/free-solid-svg-icons";

/*****************************Component*********************/
function Popup(props)
{
    return (
        <div className="overlay">
            <div className="popup-box">
                <div className="popup-taskbar">
                    <h3>{props.title}</h3>
                    {props.onClose &&
                        (<button onClick={() => props.onClose()}>
                            <FontAwesomeIcon icon={faWindowClose} size="2x"/>
                        </button>)
                    }
                </div>

                <div className="popup-body">
                    {props.children}
                </div>

            </div>

        </div>
    );
}

/*****************************Exports*********************/
export default Popup;

