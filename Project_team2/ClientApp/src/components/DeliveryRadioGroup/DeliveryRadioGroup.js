import React, { useState } from 'react';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import NovaPost from '../NovaPost/NovaPost';

const DeliveryRadioGroup = ({ onDeliveryChange }) => {
    const [selectedDelivery, setSelectedDelivery] = useState('NovaPost');

    const handleChange = (event) => {
        setSelectedDelivery(event.target.value);
    };

    const radioStyle = {
        color: 'rgba(28, 27, 31, 1)', // Custom color for the radio buttons
        '&.Mui-checked': {
            color: 'rgba(28, 27, 31, 1)',
        },
    };

    // Define a function to return the container styles
    const getContainerStyle = (value) => ({
        border: selectedDelivery === value ? '1px solid var(--borderColor)' : 'none',
        borderRadius: selectedDelivery === value ? '12px' : '0',
        padding: '8px',
        marginBottom: '8px',
    });

    return (
        <div>
            <FormControl component="fieldset" style={{ width: '100%' }}>
                <RadioGroup
                    aria-label="delivery"
                    name="delivery"
                    value={selectedDelivery}
                    onChange={handleChange}
                >
                    <div style={getContainerStyle('UkrPost')}>
                        <FormControlLabel value="UkrPost" control={<Radio sx={radioStyle} />} label="Укр Пошта" />
                        {selectedDelivery === 'UkrPost' && <NovaPost post={'ukr'} onDeliveryChange={onDeliveryChange} />}
                    </div>
                    <div style={getContainerStyle('NovaPost')}>
                        <FormControlLabel value="NovaPost" control={<Radio sx={radioStyle} />} label="Нова Пошта" />
                        {selectedDelivery === 'NovaPost' && <NovaPost onDeliveryChange={onDeliveryChange} />}
                    </div>
                </RadioGroup>
            </FormControl>
        </div>
    );
};

export default DeliveryRadioGroup;
