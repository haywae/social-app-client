import { useState, useRef, useEffect, type ChangeEvent, type FormEvent, type JSX } from "react";
import { Link, useNavigate } from "react-router-dom";

import { registerUser } from "../../thunks/userThunks/registerThunk"; // Adjust import path
import { resetRegistrationState } from "../../slices/user/registrationSlice"
import { setError } from "../../slices/ui/uiSlice";
import { useAppDispatch, useAppSelector } from "../../utils/hooks";
import { allCountries, type CountryItem } from "../../assets/countries";
import CountryDropdown from "../../components/common/countryDropdown";
import "../../styles/auth-container.css"

// --- Helper Data ---
const MONTHS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 101 }, (_, i) => currentYear - i);

export const getDaysInMonth = (year: string, month: string): number => {
    const yearNum = parseInt(year, 10);
    const monthNum = parseInt(month, 10);
    if (!isNaN(yearNum) && !isNaN(monthNum)) {
        // new Date(year, monthIndex + 1, 0) gets the last day of the given month
        return new Date(yearNum, monthNum, 0).getDate();
    }
    return 31; 
};
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
        dobMonth: '',
        dobDay: '',
        dobYear: '',
        country: ''
    });

    const [registrationSuccess, setRegistrationSuccess] = useState(false);
    const [successEmail, setSuccessEmail] = useState("");
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedCountry = allCountries.find(c => c.name === formData.country) || undefined;

    // --- CHANGED --- Generate dynamic day list based on state
    const daysInSelectedMonth = getDaysInMonth(formData.dobYear, formData.dobMonth);
    const DYNAMIC_DAYS = Array.from({ length: daysInSelectedMonth }, (_, i) => i + 1);

    // Redirect if already authenticated ---
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/'); // Redirect to the homepage
        }
    }, [isAuthenticated, navigate]);

    // --- CHANGED --- Effect to reset day if it becomes invalid
    useEffect(() => {
        if (parseInt(formData.dobDay, 10) > daysInSelectedMonth) {
            setFormData(prevData => ({
                ...prevData,
                dobDay: '' // Reset day if it's no longer valid
            }));
        }
    }, [daysInSelectedMonth, formData.dobDay]);

    /**
     * Handles changes in form input fields.
     * @param e - The change event from the input element.
     */
    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
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

        const { displayName, username, email, password, confirmPassword, dobDay, dobMonth, dobYear, country } = formData;

        if (!username || !email || !password || !confirmPassword || !displayName || !dobDay || !dobMonth || !dobYear || !country) {
            dispatch(setError('All fields are required.'));
            return;
        }
        if (password !== confirmPassword) {
            dispatch(setError('Passwords do not match.'));
            return;
        }
        // --- CHANGED --- Format the date_of_birth string right before submission
        const paddedDay = String(dobDay).padStart(2, '0');
        const formattedDOB = `${dobYear}-${dobMonth}-${paddedDay}`;
        try {
            // .unwrap() will throw an error if the thunk is rejected
            setSuccessEmail(email);
            await dispatch(registerUser({ displayName, username, email, password, dateOfBirth: formattedDOB, country })).unwrap();

            // On success, reset state and navigate
            dispatch(resetRegistrationState());
            setFormData({
                ...formData,
                displayName: '',
                username: '',
                password: '',
                confirmPassword: '',
                email: '',
                dobDay: '', dobMonth: '', dobYear: '',
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
                    We've sent a verification link to <strong>{successEmail}</strong>. Please check your inbox and spam folder to complete your registration.
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
                    <label>Date of Birth</label>
                    <p className="form-hint">This will not be shown publicly.</p>
                    <div className="dob-container">
                        <select name="dobMonth" value={formData.dobMonth} onChange={handleInputChange} required aria-label="Month of birth">
                            <option value="" disabled>Month</option>
                            {MONTHS.map((month) => (
                                <option key={month} value={month}>{month}</option>
                            ))}
                        </select>
                        <select name="dobDay" value={formData.dobDay} onChange={handleInputChange} required aria-label="Day of birth">
                            <option value="" disabled>Day</option>
                            {DYNAMIC_DAYS.map((day) => (
                                <option key={day} value={day}>{day}</option>
                            ))}
                        </select>
                        <select name="dobYear" value={formData.dobYear} onChange={handleInputChange} requiredaria-label="Year of birth">
                            <option value="" disabled>Year</option>
                            {YEARS.map((year) => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>
                </div>
                {/* Country */}
                <div className="form-group" ref={dropdownRef}>
                    <label htmlFor="country">Country</label>
                    <CountryDropdown selectedCountry={selectedCountry} onSelect={handleCountrySelect} />
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
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {'Sign Up'}
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
