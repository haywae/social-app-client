import { useState, useRef, useEffect, type ChangeEvent, type FormEvent, type JSX } from "react";
import { Link, useNavigate } from "react-router-dom";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { registerUser } from "../../thunks/userThunks/registerThunk"; // Adjust import path
import { resetRegistrationState } from "../../slices/user/resgitrationSlice"
import { setError } from "../../slices/ui/uiSlice";
import { useAppDispatch, useAppSelector } from "../../utils/hooks";
import { allCountries, type CountryItem } from "../../assets/countries";
import { CalendarIcon } from "../../assets/icons";
import CountryDropdown from "../../components/common/countryDropdown";
import "../../styles/auth-container.css"
/**
 * A functional component for the user registration page.
 * It handles form input, client-side validation, and dispatches the registration thunk.
 */

const Signup = (): JSX.Element => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    
    //-----Redux State-----
    const { loading } = useAppSelector((state) => state.registration);
    const { isAuthenticated } = useAppSelector((state) => state.auth);

    //-----React State-----
    const [formData, setFormData] = useState({
        displayName: '',
        username: '',
        password: '',
        confirmPassword: '',
        email: '',
        date_of_birth: '',
        country: ''
    });

    const [registrationSuccess, setRegistrationSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedCountry = allCountries.find(c => c.name === formData.country) || undefined;

    // Redirect if already authenticated ---
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/'); // Redirect to the homepage
        }
    }, [isAuthenticated, navigate]);

    /**
     * Handles changes in form input fields.
     * @param e - The change event from the input element.
     */
    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleDateChange = (date: Date | null) => {
        const formattedDate = date ? date.toISOString().split("T")[0] : "";
        setFormData((prevData) => ({
            ...prevData,
            date_of_birth: formattedDate,
        }));
    };


    /**
     * Handles the country selection from the countries' dropdown
     * @param countryName 
     */
    const handleCountrySelect = (country: CountryItem) => {
        setFormData(prev => ({ ...prev, country: country.name }));
    };

    
    const toggleShowPassword = () => {
        setShowPassword(prevState => !prevState);
    };
     
    const toggleShowConfirmPassword = () => {
        setShowConfirmPassword(prevState => !prevState);
    };

    /**
     * Handles the form submission for user registration.
     * @param e - The form submission event.
     */
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault(); 

        const { displayName, username, email, password, confirmPassword, date_of_birth, country } = formData;
        
        if (!username || !email || !password) {
            dispatch(setError('All fields are required.'));
            return;
        }
        if (password !== confirmPassword) {
            dispatch(setError('Passwords do not match.'));
            return;
        }

        try {
            // .unwrap() will throw an error if the thunk is rejected
            await dispatch(registerUser({ displayName, username, email, password, date_of_birth, country })).unwrap();
            
            // On success, reset state and navigate
            dispatch(resetRegistrationState());
            setFormData({
                ...formData,
                displayName: '',
                username: '',
                password: '',
                confirmPassword: '',
                date_of_birth: '',
                country: ''
            });
            setRegistrationSuccess(true); 
        } catch (err: any) {
            dispatch(setError(err));
            // The error from the rejected thunk is caught here.
            // The slice will handle setting the `error` state in Redux.
            setFormData((prevData) => ({
                ...prevData,
                password: '',
                confirmPassword: '',
            }));
        }
    };

    // --- Conditionally render the confirmation message or the form ---
    if (registrationSuccess) {
        return (
            <div className="auth-container">
                <h2 className="auth-container-title">Check Your Email</h2>
                <p className="auth-container-subtitle">
                    We've sent a verification link to <strong>{formData.email}</strong>. Please check your inbox and spam folder to complete your registration.
                </p>
                <button 
                    type="button" 
                    className="btn-primary" 
                    onClick={() => navigate('/login')}
                >
                    Go to Login
                </button>
            </div>
        );
    }


    return (
        <div className="auth-container">
            <h2 className="auth-container-title">Sign Up</h2>
            <form onSubmit={handleSubmit}>
                {/* Display Name Field */}
                <div className="form-group">
                    <label htmlFor="displayName">Display Name</label>
                    <input
                        type="text"
                        id="displayName"
                        name="displayName"
                        value={formData.displayName}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                {/* Username Field */}
                <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                {/* Email Field */}
                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                {/* Date of Birth Field */}
                <div className="form-group">
                    <label htmlFor="date_of_birth">Date of Birth</label>
                    <DatePicker
                        id="date_of_birth"
                        selected={formData.date_of_birth ? new Date(formData.date_of_birth) : null}
                        onChange={handleDateChange}
                        showIcon
                        toggleCalendarOnIconClick
                        dateFormat="yyyy-MM-dd"
                        showMonthDropdown
                        showYearDropdown
                        dropdownMode="select"
                        maxDate={new Date()}
                        placeholderText="Select your birth date"
                        className="date-picker"
                        required
                        icon={<CalendarIcon/>}
                        calendarIconClassName="calendar-icon"
                    />
                </div>
                {/* Country */}
                <div className="form-group" ref={dropdownRef}>
                    <label htmlFor="country">Country</label>
                   <CountryDropdown selectedCountry={selectedCountry} onSelect={handleCountrySelect}/> 
                </div>
                {/* Password Field */}
                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                    />
                    <button type="button" 
                        onClick={toggleShowPassword}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                        {showPassword ? "Hide" : "Show"}
                    </button>
                </div>
                {/* Confirm Password Field */}
                <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required
                    />
                    <button type="button" onClick={toggleShowConfirmPassword}>
                        {showConfirmPassword ? "Hide" : "Show"}
                    </button>
                </div>
                {/* Submit Button */}
                <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Signing Up...' : 'Sign Up'}
                </button>
            </form>
            <div className="links">
                <Link to="/login" className="login-link">
                    Already have an account? Log In
                </Link>
            </div>
        </div>
    );
};

export default Signup;
