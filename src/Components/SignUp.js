
/*********************************Imports**************************/
import {useState} from "react";
import {Link, useHistory} from "react-router-dom";
import { getCookies, emailRegex } from "../Services/Services";

/*********************************Variables***********************/
const errorMessages = ["First Name cannot be empty. ", "Last name cannot be empty.", "Invalid email format.", 
    "Password has to be atleast 6 characters long.", "Email already exists. ", "Failed to create account. "]; //The different error messages to be shown
const apiUrl = "http://localhost:5000/auth/signup"; //The api url to be used for creating user accounts

/*********************************Component***********************/
function SignUp()
{
    const [errors, setErrors] = useState([]);
    const history = useHistory();

    //Checking if the user is already logged in
    const cookies = getCookies();
    if(cookies.has("auth"))
        history.replace("/"); //Redirecting to home page since user is already logged in
    
    return (
        <div className="sign-up">
            <div className="auth-box">
                <p>Create Your Account</p>
                <form onSubmit={(event) => {
                    event.preventDefault();
                    signupUser(setErrors, history)
                    }}>
                    <label for="fname">First Name</label><br/>
                    <input type="text" id="fname" placeholder="First Name" className={errors[0] ? "invalid-input" : ""}/>
                    <label for="lname">Last Name</label><br/>
                    <input type="text" id="lname" placeholder="Last Name" className={errors[1] ? "invalid-input" : ""}/>
                    <label for="email">Email</label><br/>
                    <input type="text" id="email" placeholder="Email" className={(errors[2] || errors[4]) ? "invalid-input" : ""} />
                    <label for="password">Password</label><br/>
                    <input type="password" id="password" placeholder="Password" className={errors[3] ? "invalid-input" : ""} />
                    <div className="auth-submit-btn-div">
                        <button type="submit">Get Started Free</button>
                    </div>
                </form>
                {errors.map((error,i) => {
                    if(error)
                    {
                        return <h5>{errorMessages[i]}</h5>
                    }
                })}
                <h4>Already have an account ? <Link to="/signin">Sign In</Link></h4>
            </div>
        </div>
    );
}

/*********************************Functions**************************/
function signupUser(setErrors, history)
{
    /*Validates the user info and registers the user*/
    
    //Getting the entered details
    const userDetails = {
        fname: document.getElementById("fname").value.trim(),
        lname: document.getElementById("lname").value.trim(),
        email: document.getElementById("email").value.trim(),
        password: document.getElementById("password").value.trim()
    };

    //Checking if the entered details are valid
    const errorFlag = isValid(userDetails);
    if(errorFlag === 0)
    {
        //Entered details are valid

        //Clearing all errors
        const errors = [];
        for(let i = 0; i < errorMessages.length; ++i)
        {
            errors.push(false);
        }

        //Sending request to create user account
        const fetchPromise = fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify(userDetails)
        });
        fetchPromise.then((resp) => resp.json())
            .then((data) => {
                
                //Checking if the operation was successfull
                if(data.success)
                    history.replace("/"); //Redirecting to home page
                else
                {   
                    //Displaying the error
                    switch(data.code)
                    {
                        case 1: errors[4] = true; break;
                        default: errors[5] = true; break;
                    }
                    setErrors(errors);
                }

            })
            .catch((err) => {
                errors[5] = true;
                setErrors(errors);
            })

    }
    else
    {
        //Invalid details
        
        const errors = [];
        for(let i = 0; i < errorMessages.length; ++i)
        {
            errors.push((errorFlag & (1 << i)) !== 0);
        }

        //Setting the error
        setErrors(errors);
    }

}

function isValid(userDetails)
{
    /*Checks if the entered user details are valid */

    let errorFlag = 0;

    //Checking if the first name is valid
    errorFlag |= (userDetails.fname.length === 0);

    //Checking if the last name is valid
    errorFlag |= (userDetails.lname.length === 0) << 1;
    
    //Checking if the email is valid
    errorFlag |= (userDetails.email.search(emailRegex) === -1) << 2;

    //Checking if the password is valid
    errorFlag |= (userDetails.password.length < 6) << 3;

    return errorFlag;
}

/*********************************Exports**************************/
export default SignUp;
