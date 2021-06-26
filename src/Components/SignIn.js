
/*****************************Imports************************* */
import { useState } from "react";
import {Link, useHistory} from "react-router-dom";
import { getCookies, emailRegex } from "../Services/Services";

/*****************************Variables************************* */
const errorMessages = ["User with given email does not exist.", "Incorrect password. ", "Failed to sign in. Try again later. "]; //The different error messages to be shown
const loginApiUrl = "http://localhost:5000/auth/signin"; //The api endpoint url to be used for signing in the user

/*****************************Component************************* */
function SignIn()
{
    const [errors, setErrors] = useState([]);
    const history = useHistory();

    //Checking if user is already logged in
    const cookieMap = getCookies();
    if(cookieMap.has("auth"))
        history.replace("/"); //Redirecting to home page
    
    return (
        <div className="sign-in">
            <div className="auth-box">
                <p>Sign In</p>
                <form onSubmit={(event) => {
                    event.preventDefault();
                    signInUser(setErrors, history);
                }}>
                    <label for="email">Email</label>
                    <input type="text" id="email" placeholder="Email" className={errors[0] ? "invalid-input" : ""}/>
                    <label for="pss">Password</label>
                    <input type="password" id="pss" placeholder="Password" className={errors[1] ? "invalid-input" : ""} />
                    <div className="auth-submit-btn-div">
                        <button type="submit">Sign In</button>
                    </div>
                </form>
                
                {errors.map((error,i) => {
                    if(error)
                    {
                        return <h5>{errorMessages[i]}</h5>
                    }
                })}

                <h4>Do not have an account ? <Link to="/signup">Sign Up</Link></h4>

            </div>
        </div>
    );
}

/*****************************Functions************************* */
function signInUser(setErrors, history)
{
    /*Signs the user in*/

    //Getting the entered details
    const userDetails = {
        email : document.getElementById("email").value.trim(),
        password: document.getElementById("pss").value.trim()
    };

    //Checking if the details are valid
    const errorFlag = validDetails(userDetails);
    if(errorFlag === 0)
    {
        //Clearing all errors
        const errors = errorMessages.map((msg) => false);

        //Logging in the user
        const loginFetchPromise = fetch(loginApiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify(userDetails)
        });
        loginFetchPromise.then((resp) => resp.json())
            .then((data) => {
                if(data.success)
                {
                    //User Successfully logged in
                    history.replace("/"); //Redirecting to home page
                }
                else
                {
                    switch(data.code)
                    {
                        case 1: errors[0] = true; break;
                        case 3: errors[1] = true; break;
                    }
                    setErrors(errors);
                }
            })
            .catch((err) => {
                errors[2] = true;
                setErrors(errors);
            });


    }
    else
    {
        //Diplaying the errors
        const errors = []
        for(let i = 0; i < errorMessages.length; ++i)
        {
            errors.push((errorFlag & (1 << i)) !== 0);
        }
        setErrors(errors);
    }

}

function validDetails(userDetails)
{
    /*Checks if the entered details are valid*/

    let errorFlag = 0;

    //Checking if email is valid
    errorFlag |= (userDetails.email.search(emailRegex) === -1);

    //Checking if the password is valid
    errorFlag |= ((userDetails.password.length < 6) << 1);

    return errorFlag;
}

/*****************************Exports************************* */
export default SignIn;
