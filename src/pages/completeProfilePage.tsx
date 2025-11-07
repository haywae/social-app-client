import { useState, useRef, useEffect, type ChangeEvent, type FormEvent, type JSX } from "react";
import { useNavigate } from "react-router-dom";

import { completeOnboardingThunk } from "../thunks/userThunks/completeOnBoardingThunk";
import { setError } from "../slices/ui/uiSlice";
import { useAppDispatch, useAppSelector } from "../utils/hooks";
import { allCountries, type CountryItem } from "../assets/countries";
import CountryDropdown from "../components/common/countryDropdown";
import { getDaysInMonth } from "./authPages/register";
import "../styles/auth-container.css";

// --- Helper Data  ---
const MONTHS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 101 }, (_, i) => currentYear - i);

/**
 * A functional component for the mandatory user onboarding page.
 * It collects Date of Birth, Country, and Base Currency.
 * This component is only shown when onboarding is required.
 */
const CompleteProfilePage = (): JSX.Element => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    //-----Redux State-----
    const { loading } = useAppSelector((state) => state.auth);
    const isLoading = loading === 'pending';

    //-----React State-----
    const [formData, setFormData] = useState({
        dobMonth: '',
        dobDay: '',
        dobYear: '',
        country: '',
    });

    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedCountry = allCountries.find(c => c.name === formData.country) || undefined;

    // --- Generate dynamic day list based on state ---
    const daysInSelectedMonth = getDaysInMonth(formData.dobYear, formData.dobMonth);
    const DYNAMIC_DAYS = Array.from({ length: daysInSelectedMonth }, (_, i) => i + 1);

    // --- Effect to reset day if it becomes invalid ---
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
     */
    const handleCountrySelect = (country: CountryItem) => {
        setFormData(prev => ({ ...prev, country: country.name }));
    };

    /**
     * Handles the form submission for user onboarding.
     */
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const { dobDay, dobMonth, dobYear, country } = formData;

        if (!dobDay || !dobMonth || !dobYear || !country ) {
            dispatch(setError('All fields are required.'));
            return;
        }

        const paddedDay = String(dobDay).padStart(2, '0');
        const formattedDOB = `${dobYear}-${dobMonth}-${paddedDay}`;
        
        try {
            await dispatch(completeOnboardingThunk({ 
                dateOfBirth: formattedDOB, 
                country
            })).unwrap();

            // --- On success, just navigate to the dashboard.
            navigate('/'); 

        } catch (err: any) {
            dispatch(setError(err)); 
        }
    };

    return (
        <div className="auth-container">
            <h2 className="auth-container-title">Complete Your Profile</h2>
            <p className="auth-container-subtitle" style={{ marginBottom: '1.5rem' }}>
                We just need a few more details to get you started.
            </p>

            <form onSubmit={handleSubmit}>
                
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
                        <select name="dobYear" value={formData.dobYear} onChange={handleInputChange} required aria-label="Year of birth">
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

                {/* Submit Button */}
                <button type="submit" className="btn-primary" disabled={isLoading}>
                    {isLoading ? 'Saving...' : 'Save and Continue'}
                </button>
            </form>
            
        </div>
    );
};

export default CompleteProfilePage;