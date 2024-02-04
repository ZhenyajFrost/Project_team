import React, { useState, useEffect } from "react";
import axios from "axios";
import LoginSocMed from "../LoginSocMed/LoginSocMed.js";
import classes from "../../styles/LoginAndRegistration.module.css";
import Button from "../UI/Button/Button.js";
import Input from "../UI/Input/Input.js";
import useSendConfirmationEmail from "../../hooks/useSendConfirmationEmail";

function RegistrationConfirm({ user, setEmailSent, setModalVisible, setModalLogVisible}) {
    const [code, setCode] = useState('');
    const { sendEmail, loading, error, confirmCode } = useSendConfirmationEmail();

    useEffect(() => {
        const fetchData = async () => {
          await sendEmail(user.email);
        };
        fetchData();
        console.log("Start: " + confirmCode);

      }, []); // Added dependencies

    const handleSendEmailAgain = async() => {
        await sendEmail(user.email);
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
        setEmailSent(false)
    }

    const onSubmit = (e) => {
        e.preventDefault();

        if(code.includes(confirmCode)){
            console.log(user);
            axios.post("https://localhost:7074/api/auth/register", user).then((result) => {
                console.log('Registration successful:', result.data);
                onConfirm();
            }).catch((err) => {
                console.error('Registration failed:', err);
            });;
        } else {
            alert("Code is incorrect try again!");

            setCode("");
        }
    };

    return (
        <div>
            <h2>Підтвердіть пошту</h2>
            <div className={classes.container}>
                <div className={classes.container}>
                    <form onSubmit={onSubmit}>
                        <div className={classes.container} style={{ flexDirection: 'column', gap: '0.5vw' }}>
                            <div>
                                <p className={classes.secondaryTxt}> {loading ? "Sending..." : "Ми відправили код на вашу почту"}<br />
                                    {user.email}
                                </p>
                                <div className={classes.container + ' ' + classes.text}>
                                    <p>Змінити пошту</p>
                                    <p onClick={handleSendEmailAgain}>Відправити код знову</p>
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

                <div className={classes.contBlock}>або</div>

                <LoginSocMed />
            </div>
        </div>
    );
};

export default RegistrationConfirm;
