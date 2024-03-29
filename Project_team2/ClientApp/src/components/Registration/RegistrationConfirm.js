import React, { useState, useEffect } from "react";
import axios from "axios";
import LoginSocMed from "../LoginSocMed/LoginSocMed.js";
import classes from "../../styles/LoginAndRegistration.module.css";
import Button from "../UI/Button/Button.js";
import Input from "../UI/Input/Input.js";
import useSendConfirmationEmail from "../../API/useSendConfirmationEmail.js";
import { AUTH_ENDPOINT } from '../../API/apiConstant'
import Notiflix from "notiflix";
import useBanUser from "../../API/User/useBanUser.js";
import store from "../../utils/Zustand/store.js";

Notiflix.Notify.init({
    timeout: 2000,
});

function RegistrationConfirm({ user, isLogin, setEmailSent, setEmailSet, setModalVisible, setModalLogVisible, onEmailConfirmed }) {
    const [code, setCode] = useState('');
    const { sendEmail, loading, error, confirmCode } = useSendConfirmationEmail();
    const [banUser] = useBanUser()

    const { blockUser } = store()

    const [limitSend, setLimitSend] = useState(3);



    useEffect(() => {
        
        const fetchData = async () => {
            await sendEmail(user.email);
        };
        fetchData();
        console.log("Start: " + confirmCode);

    }, []);

    const onSendEmailAgain = async () => {
        setLimitSend(prev => prev - 1);

        console.log("limit", limitSend)
        console.log('isBlocked',store.isBlocked)

        if (limitSend > 0 && !store.getState().isBlocked) {
            Notiflix.Notify.info(`Залишилось спроб: ${limitSend - 1}`)

            await sendEmail(user.email);
        }
        else {
            await banUser(user.email);
            blockUser();

            setLimitSend(3);
        }


    }

    useEffect(() => {
        console.log("Effect: " + confirmCode);
    }, [confirmCode]);

    const handleCodeChange = (e) => {
        setCode(e.target.value);
    };

    const onConfirm = () => {
        setModalVisible(false);
        setModalLogVisible(true);
        setEmailSent(false);
        //setUser({});
    }

    const onEmailChange = () => {
        setEmailSent(false);
        if (isLogin)
            setEmailSet(false);
    }

    const onSubmit = (e) => {
        e.preventDefault();

        if (code.includes(confirmCode)) {
            if (isLogin) {
                console.log("isLOgin: Succesful")
                onEmailConfirmed();
                return;
            }

            onConfirm();
            console.log(user);
            axios.post(`${AUTH_ENDPOINT}/register`, user).then((result) => {
                console.log('Registration successful:', result.data);
                Notiflix.Notify.success("Ви успішно зареєструвалися!")
                onConfirm();
            }).catch((err) => {
                console.error('Registration failed:', err);
                Notiflix.Notify.failure(`Реєстрація пройшла з помилками! Клікніть для деталей`, () => {
                    Notiflix.Notify.info(`${err.response.data.message}`);
                })
            });;
        } else {
            alert("Code is incorrect try again!");
            setCode("");
        }
    };

    return (
        <div>
            <h2>Підтвердіть пошту</h2>
            <div className={classes.containerMain}>

                <LoginSocMed setModalVisible={setModalVisible}/>

                <div className={classes.contBlock}>або</div>

                <div className={classes.container}>
                    <form onSubmit={onSubmit}>
                        <div className={classes.container} style={{ flexDirection: 'column', gap: '0.5vw' }}>
                            <div>
                                <p className={classes.secondaryTxt}> {loading ? "Sending..." : "Ми відправили код на вашу почту"}<br />
                                    <p style={{ fontWeight: '700' }}>{user.email}</p>
                                </p>
                                <div className={classes.container + ' ' + classes.text}>
                                    <p onClick={onEmailChange}>Змінити пошту</p>
                                    <p onClick={onSendEmailAgain}>Відправити код знову</p>
                                </div>
                            </div>

                            <div>
                                <label>Введіть код</label>
                                <Input
                                    type="text"
                                    id="code"
                                    name="code"
                                    placeholder="Введіть код"
                                    value={code}
                                    onChange={handleCodeChange}
                                    required
                                />
                            </div>
                        </div>

                        <div style={{ textAlign: 'end' }}>
                            <Button>Підтвердити</Button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
};

export default RegistrationConfirm;
