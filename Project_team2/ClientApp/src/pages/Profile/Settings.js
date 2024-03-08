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
import ModalWindow from "../../components/ModalWindow/ModalWindow.js";

import { getLocalStorage, setLocalStorage } from '../../utils/localStorage';
import ImageUpload from '../../components/ImageUpload/ImageUpload';
import useUpdateUser from '../../API/User/useUpdateUser';
import useUpdatePasswordToken from '../../API/User/useUpdatePasswordToken.js';
import useUpdateEmail from '../../API/User/useUpdateEmail';
import useToggleNotification from '../../API/User/useToggleNotification';
import { State, City } from 'country-state-city';
import useDeleteUser from '../../API/User/useDeleteUser';
import { useHistory } from 'react-router-dom/cjs/react-router-dom';
import EmailConfirm from '../../components/EmailConfirm/EmailConfirm.js';

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
    const user = getLocalStorage('user');
    const token = getLocalStorage('token');

    const history = useHistory();
    const [modalEmailVisible, setModalEmailVisible] = useState(false)
    const [modalDeleteVisible, setModalDeleteVisible] = useState(false)

    const [updateUser, isLoading, error] = useUpdateUser();
    const [deleteUser, isLoadingDel, errorDel] = useDeleteUser();
    const [updatePassword, isLoadingPass, errorPass] = useUpdatePasswordToken();
    const [updateEmail, isLoadingEmail, errorEmail] = useUpdateEmail();
    const [toggleNotification, isLoadingNotifi, errorNotifi] = useToggleNotification();

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

    const { validationErrors, validateForm } = useRegistrationValidation();

    const [selectedRegion, setSelectedRegion] = useState(''); // For Select component
    const [selectedCity, setSelectedCity] = useState(user.city); // For Select component

    useEffect(() => {
        console.log(`user: ${JSON.stringify(user)}`);
        console.log(user);
        if (user) {
            setFormData(prev => ({
                ...prev,
                ...user,
                notifications: {
                    ...prev.notifications,
                    ...(user.notifications || {}),
                },
            }));

            State.getStatesOfCountry('UA').map((state) => {
                if (state.name === user.region) {
                    setSelectedRegion({
                        value: state.isoCode,
                        label: state.name,
                    });
                }
            });

            setSelectedCity({
                value: user.city,
                label: user.city
            });

        }
    }, []);

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
            city: '',
            notifications: {
                ...prev.notifications
            },
        }));
        setSelectedCity(null);
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

    const handleContactSubmit = async (e) => {
        e.preventDefault();
        var dataToUpdate = {
            lastName: formData.lastName,
            firstName: formData.firstName,
            login: formData.login,
            region: formData.region,
            city: formData.city,
            phone: formData.phone
        }

        if (!validateForm(dataToUpdate)) {
            return;
        }

        console.log(dataToUpdate);

        await updateUser(token, dataToUpdate); //TOKEN IN THE FUTURE
        console.log(error);

        State.getStatesOfCountry('UA').map((state) => {
            if (state.name === dataToUpdate.region) {
                setSelectedRegion({
                    value: state.isoCode,
                    label: state.name,
                });
            }
        });

        setSelectedCity({
            value: dataToUpdate.city,
            label: dataToUpdate.city
        });
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        var dataToUpdate = {
            oldPassword: formData.oldPassword,
            password: formData.password
        }

        if (!validateForm(dataToUpdate)) {
            console.log(validationErrors);
            return;
        }

        console.log(dataToUpdate);

        await updatePassword(token, dataToUpdate.oldPassword, dataToUpdate.password);
        console.log(error);

        setFormData({
            ...user,
            oldPassword: '',
            password: '',
        });
    }

    const handleModalEmail = async (e) => {
        e.preventDefault();
        setModalEmailVisible(true);
    }

    const onEmailConfirmed = async () => {
        var dataToUpdate = {
            password: formData.oldPassword,
            currentEmail: user.email,
            newEmail: formData.email
        }

        console.log(dataToUpdate);
        console.log("token " + token);

        await updateEmail(token, dataToUpdate);

        window.location.reload();
        setFormData((prev) => ({
            ...prev,
            oldPassword: '' 
        }))
    }

    const handleNotificationsChanged = async (e) => {
        const { name, checked } = e.target;
        console.log(`name: ${name}, checked: ${checked}`);

        await toggleNotification(token, name);

        setFormData(prevFormData => ({
            ...prevFormData,
            notifications: {
                ...prevFormData.notifications,
                [name]: checked,
            },
        }));
    };

    const handleDeleteProfile = async () => {
        history.push('/');
        await deleteUser(token);
        window.location.reload();
    }

    return (
        <div className={css.container}>
            <CustomAccordion id="contactData">
                <CustomAccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="contactData-content"
                    id="ContactData-header"
                >
                    {isLoading ? 'Loading...' : 'Змінити контактні дані'}
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
                        <Button type="submit" diabled={isLoading}>Зберегти</Button>
                    </form>
                </CustomAccordionDetails>
            </CustomAccordion>

            <CustomAccordion id="password">
                <CustomAccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="password-content"
                    id="password-header"
                >
                    {isLoadingPass ? "Loading..." : "Змінити пароль"}
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
                    {isLoadingEmail ? 'Loading...' : 'Змінити пошту'}
                </CustomAccordionSummary>
                <CustomAccordionDetails>
                    <form onSubmit={handleModalEmail}>
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
                    {isLoadingNotifi ? "Loading..." : "Сповіщення"}
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
                        <Button onClick={() => setModalDeleteVisible(true)} className={css.delete}>Видалити профіль</Button>
                    </div>
                </CustomAccordionDetails>
            </CustomAccordion>

            <ModalWindow visible={modalEmailVisible} setVisible={setModalEmailVisible}>
                <EmailConfirm
                    email={formData.email}
                    setModalVisible={setModalEmailVisible}
                    onEmailConfirmed={onEmailConfirmed}
                    modalVisible={modalEmailVisible}
                />
            </ModalWindow>

            <ModalWindow visible={modalDeleteVisible} setVisible={setModalDeleteVisible}>
                <EmailConfirm
                    email={user.email}
                    setModalVisible={setModalDeleteVisible}
                    onEmailConfirmed={handleDeleteProfile}
                    modalVisible={modalDeleteVisible}
                />
            </ModalWindow>
        </div>
    );

}

export default Settings;