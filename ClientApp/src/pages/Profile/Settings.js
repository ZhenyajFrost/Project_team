import React, { useEffect, useState } from 'react'
import useRegistrationValidation from "../../hooks/useRegistrationValidation";
import css from './Settings.module.css';

import { styled } from '@mui/system';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import LocationSelector from '../../components/LocationSelector/LocationSelector'
import "react-country-state-city/dist/react-country-state-city.css";

import Input from '../../components/UI/Input/Input';
import Button from '../../components/UI/Button/Button';
import PhoneInput from '../../components/UI/PhoneInput/PhoneInput';
import Checkbox from '../../components/UI/Checkbox/Checkbox';
import { getLocalStorage } from '../../utils/localStorage';
import ImageUpload from '../../components/ImageUpload/ImageUpload';

const CustomAccordion = styled(Accordion)({
    '&&': {
        borderRadius: '24px',
        boxShadow: 'none',
        overflow: 'hidden', // Ensure border radius is visible
        '&:not(:last-child)': {
            borderBottom: 0,
        },
        '&:before': {
            display: 'none',
        },
        '&.Mui-expanded': {
        },
    },
});

const CustomAccordionSummary = styled(AccordionSummary)({
    position: 'relative',
    fontWeight: '600',
    lineHeight: '24px',
    '.MuiAccordionSummary-expandIconWrapper.Mui-expanded': {},
    '&.Mui-expanded': {
        minHeight: 48,
    },
    '&::after': {
        content: '""',
        position: 'absolute',
        left: '2.5%',
        bottom: 0,
        width: '95%',
        borderBottom: '2px solid var(--gray)',
    }
});

const CustomAccordionDetails = styled(AccordionDetails)({
});

function Settings() {
    var user = getLocalStorage('user');
    const [formData, setFormData] = useState({
        lastName: '',
        firstName: '',
        login: '',
        region: '',
        city: '',
        phone: '',
        email: '',
        oldPassword: '',
        password: '',
        notifications: {
            advices: false,
            help: false,
            remind: false
        },
    });

    useEffect(() => {
        console.log(`user: ${JSON.stringify(user)}`);
        console.log(user);
        if (user) {
            setFormData(prev => ({
                ...prev,
                ...user, // This assumes `user` has the same top-level fields as `formData`
                notifications: {
                    ...prev.notifications,
                    ...(user.notifications || {}), // Safely spread `user.notifications` if it exists
                },
            }));
        }
    
        // Note: Logging `formData` right after `setFormData` won't reflect changes immediately due to setState being asynchronous
    }, []);
    
    // To observe formData changes, you could use another useEffect
    useEffect(() => {
        console.log(`formData: ${JSON.stringify(formData)}`);
        console.log(formData);
    }, [formData]); // This effect runs whenever `formData` changes

    const { validationErrors, validateForm } = useRegistrationValidation();

    const [selectedRegion, setSelectedRegion] = useState(null); // For Select component
    const [selectedCity, setSelectedCity] = useState(null); // For Select component

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
            notifications: {
                ...e.notifications
            },
        });
    };

    const handleRegionChange = (selectedOption) => {
        setSelectedRegion(selectedOption);
        setFormData(prev => ({
            ...prev,
            region: selectedOption ? selectedOption.label : '',
            city: '', // Reset city value when region changes
            notifications: {
                ...prev.notifications
            },
        }));
        setSelectedCity(null); // Reset city select
    };

    const handleCityChange = (selectedOption) => {
        setSelectedCity(selectedOption);
        setFormData(prev => ({
            ...prev,
            city: selectedOption ? selectedOption.value : '',
            notifications: {
                ...prev.notifications
            },
        }));
    };

    const handleContactSubmit = (e) => {
        e.preventDefault();
        var data = {
            lastName: formData.lastName,
            firstName: formData.firstName,
            login: formData.login,
            region: formData.region,
            city: formData.city,
            phone: formData.phone
        }

        if (validateForm(data)) {
            console.log(validateForm(data));
            console.log("Check")
            return;
        }

        console.log(data);

        //Logic to server

        setFormData({
            lastName: '',
            firstName: '',
            login: '',
            region: '',
            city: '',
        });
        setSelectedRegion(null);
        setSelectedCity(null);
    };

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        var data = {
            oldPassword: formData.oldPassword,
            password: formData.password
        }

        if (validateForm(data)) {
            return;
        }

        console.log(data);

        //Logic to server

        setFormData({
            oldPassword: '',
            password: '',
        });
    }

    const handleEmailSubmit = (e) => {
        e.preventDefault();
        var data = {
            oldPassword: formData.oldPassword,
            email: formData.email
        }

        console.log(data);

        //Logic to server

        setFormData({
            oldPassword: '',
            email: '',
        });
    }

    const handleNotificationsChanged = (e) => {
        const { name, checked } = e.target;
        console.log(`name: ${name}, checked: ${checked}`);
        setFormData(prevFormData => ({
            ...prevFormData,
            notifications: {
                ...prevFormData.notifications,
                [name]: checked,
            },
        }));
    };

    const handleDeleteProfile = () => {
        console.log("Profile delted :0")

        //Delete profile
    }

    return (
        <div className={css.container}>
            <CustomAccordion id="contactData">
                <CustomAccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="contactData-content"
                    id="ContactData-header"
                >
                    Змінити контактні дані
                </CustomAccordionSummary>
                <CustomAccordionDetails>
                    <form onSubmit={handleContactSubmit}>
                        <div className={css.container}>

                            <div className={css.grid}>
                                <div>
                                    {validationErrors.lastName && (
                                        <p className="error">{validationErrors.lastName}</p>
                                    )}
                                    <label htmlFor="surname">Прізвище:</label>
                                    <Input
                                        type="text"
                                        id="lastName"
                                        name="lastName"
                                        placeholder="Введіть прізвище"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    {validationErrors.firstName && (
                                        <p className="error">{validationErrors.firstName}</p>
                                    )}
                                    <label htmlFor="name">Імя:</label>
                                    <Input
                                        type="text"
                                        id="firstName"
                                        name="firstName"
                                        placeholder="Введіть ім'я"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    {validationErrors.login && (
                                        <p className="error">{validationErrors.login}</p>
                                    )}
                                    <label htmlFor="login">Логін:</label>
                                    <Input
                                        type="text"
                                        id="login"
                                        name="login"
                                        placeholder="Введіть логін"
                                        value={formData.login}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="phone">Номер телефону:</label>
                                    <PhoneInput
                                        type="text"
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <LocationSelector
                                onRegionChange={handleRegionChange}
                                onCityChange={handleCityChange}
                                selectedRegion={selectedRegion}
                                selectedCity={selectedCity}
                            />
                        </div>
                        <Button type="submit">Зберегти</Button>
                    </form>
                </CustomAccordionDetails>
            </CustomAccordion>

            <CustomAccordion id="password">
                <CustomAccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="password-content"
                    id="password-header"
                >
                    Змінити пароль
                </CustomAccordionSummary>
                <CustomAccordionDetails>
                    <form onSubmit={handlePasswordSubmit}>
                        <div className={css.container}>
                            {validationErrors.password && (
                                <p className="error">{validationErrors.password}</p>
                            )}
                            <div className={css.grid}>
                                <div>
                                    <label htmlFor="surname">Поточний пароль</label>
                                    <Input
                                        type="password"
                                        id="oldPassword"
                                        name="oldPassword"
                                        placeholder="Введіть поточний пароль"
                                        value={formData.oldPassword}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="name">Новий пароль</label>
                                    <Input
                                        type="password"
                                        id="password"
                                        name="password"
                                        placeholder="Введіть новий пароль"
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>
                        <Button type="submit">Зберегти</Button>
                    </form>
                </CustomAccordionDetails>
            </CustomAccordion>

            <CustomAccordion id="email">
                <CustomAccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="email-content"
                    id="email-header"
                >
                    Змінити пошту
                </CustomAccordionSummary>
                <CustomAccordionDetails>
                    <form onSubmit={handleEmailSubmit}>
                        <div className={css.container}>
                            <div className={css.grid}>
                                <div>
                                    <label htmlFor="password">Поточний пароль</label>
                                    <Input
                                        type="password"
                                        id="oldPassword"
                                        name="oldPassword"
                                        placeholder="Введіть поточний пароль"
                                        value={formData.oldPassword}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email">Нова пошта</label>
                                    <Input
                                        type="email"
                                        id="email"
                                        name="email"
                                        placeholder="Введіть нову пошту"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>
                        <Button type="submit">Зберегти</Button>
                    </form>
                </CustomAccordionDetails>
            </CustomAccordion>

            <CustomAccordion id="notifications">
                <CustomAccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="notifications-content"
                    id="notifications-header"
                >
                    Сповіщення
                </CustomAccordionSummary>
                <CustomAccordionDetails>
                    <div className={css.container}>
                        <Checkbox
                            name='advices'
                            title="Поради від Exestick"
                            info="Корисні поради, цікаві пропозиції, рекомендації від Exestick"
                            checked={formData.notifications.advices}
                            onChange={handleNotificationsChanged} />
                        <Checkbox
                            name='help'
                            title="Допомога від Exestick"
                            info="Сповіщати вас щоразу, коли ваша ставка буде перевищена"
                            checked={formData.notifications.help}
                            onChange={handleNotificationsChanged} />
                        <Checkbox
                            name='remind'
                            title="Нагадування"
                            info="Сповіщати вас щоразу, коли до кінця аукціону залишається 12 годин"
                            checked={formData.notifications.remind}
                            onChange={handleNotificationsChanged} />
                    </div>
                </CustomAccordionDetails>
            </CustomAccordion>

            <CustomAccordion id="avatar">
                <CustomAccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="avatar-content"
                    id="avatar-header"
                >
                    Аватар
                </CustomAccordionSummary>
                <CustomAccordionDetails>
                    <div className={css.container}>
                        <ImageUpload />

                    </div>
                </CustomAccordionDetails>
            </CustomAccordion>

            <CustomAccordion id="payDetails">
                <CustomAccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="payDetails-content"
                    id="payDetails-header"
                >
                    Реквізити
                </CustomAccordionSummary>
                <CustomAccordionDetails>
                    <div className={css.container}>

                    </div>
                </CustomAccordionDetails>
            </CustomAccordion>

            <CustomAccordion id="deleteProfile">
                <CustomAccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="deleteProfile-content"
                    id="deleteProfile-header"
                >
                    Видалити профіль
                </CustomAccordionSummary>
                <CustomAccordionDetails>
                    <div className={css.container}>
                    <Button onClick={handleDeleteProfile} className={css.delete}>Видалити профіль</Button>

                    </div>
                </CustomAccordionDetails>
            </CustomAccordion>
        </div>
    );

}

export default Settings;