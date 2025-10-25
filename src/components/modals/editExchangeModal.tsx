import { useState, useEffect } from "react";
import { useAppDispatch } from "../../utils/hooks";
import { updateExchangeDetails } from "../../thunks/exchangeThunks/updateExchangeDetailsThunk";
import { type ExchangeData } from "../../types/exchange";
import { allCountries, type CountryItem } from "../../assets/countries";
import CountryDropdown from "../common/countryDropdown";
import { setError, setSuccess } from "../../slices/ui/uiSlice";
import Modal from "./modal";
import "./editExchangeModal.css";

interface EditExchangeModalProps {
    isOpen: boolean;
    onClose: () => void;
    exchangeData: ExchangeData | null;
}

export const EditExchangeModal = ({ isOpen, onClose, exchangeData }: EditExchangeModalProps) => {
    const dispatch = useAppDispatch();
    const [editData, setEditData] = useState({ name: '', country: '' , base_currency: ''});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // When the modal opens, pre-fill the form with the current exchange data
    useEffect(() => {
        if (exchangeData && isOpen) {
            setEditData({
                name: exchangeData.name,
                country: exchangeData.country,
                base_currency: exchangeData.base_currency,
            });
        }
    }, [exchangeData, isOpen]);

    const handleDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditData({ ...editData, [e.target.name]: e.target.value });
    };

    const handleCountrySelect = (country: CountryItem) => {
        setEditData({ ...editData, country: country.name, base_currency: country.currencyCode });
    };

    const handleSave = async () => {
        // Check if the input data was set
        if (!editData.name || !editData.country) {
            dispatch(setError('Exchange Name or Country cannot be empty.'))
            return
        }
        setIsSubmitting(true);

        try {
            // Dispatch the request and show a success message on success
            await dispatch(updateExchangeDetails(editData)).unwrap();
            dispatch(setSuccess('Exchange details updated successfully!'));
            onClose();
        } catch (err: any) {
            // Show an error message on failure
            dispatch(setError(err.message || 'Failed to update details.'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Exchange Details">
            <div className="exchange-edit-modal-body">
                <div className="exchange-edit-form">
                    <div className="form-group">
                        <label htmlFor="name">Exchange Name</label>
                        <input
                            type="text"
                            id="exhcange-name"
                            name="name"
                            value={editData.name}
                            onChange={handleDataChange}
                            className="form-input"
                            
                        />
                    </div>
                    <div className="form-group">
                        <label>Country</label>
                        <CountryDropdown
                            selectedCountry={allCountries.find(c => c.name === editData.country)}
                            onSelect={handleCountrySelect}
                        />
                    </div>
                    <div className="form-actions">
                        <button onClick={onClose} className="cancel-button">Cancel</button>
                        <button onClick={handleSave} className="save-button">
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    )
};

