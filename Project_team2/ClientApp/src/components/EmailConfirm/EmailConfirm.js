import React, { useState, useEffect } from "react";
import classes from "../../styles/LoginAndRegistration.module.css";
import Button from "../UI/Button/Button.js";
import Input from "../UI/Input/Input.js";
import useSendConfirmationEmail from "../../API/useSendConfirmationEmail.js";


function EmailConfirm({ email, modalVisible, setModalVisible, onEmailConfirmed }) {
    const [code, setCode] = useState('');

    const { sendEmail, loading, error, confirmCode } = useSendConfirmationEmail();

    useEffect(() => {
        if(modalVisible === true)
        {
            const fetchData = async () => {
                await sendEmail(email);
            };
            fetchData();
            console.log("Start: " + confirmCode);
        }
        setCode('');
    }, [modalVisible]);

    const onSendEmailAgain = async () => {
        await sendEmail(email);
    }

    useEffect(() => {
        console.log("Effect: " + confirmCode);
    }, [confirmCode]);

    const handleCodeChange = (e) => {
        setCode(e.target.value);
    };

    const onConfirm = () => {
        setModalVisible(false);
        setCode('');
        //setEmailSent(false);
        onEmailConfirmed();
    }

    const onSubmit = (e) => {
        e.preventDefault();

        if (code.includes(confirmCode)) {

            onConfirm();
            console.log(email);

        } else {
            alert("Code is incorrect try again!");
            setCode("");
        }
    };

    return (
        <div>
            <h2>Підтвердіть пошту</h2>
            <div className={classes.container}>
                <form onSubmit={onSubmit}>
                    <div className={classes.container} style={{ flexDirection: 'column', gap: '0.5vw' }}>
                        <div>
                            <p className={classes.secondaryTxt}> {loading ? "Sending..." : "Ми відправили код на вашу почту"}<br />
                                {email}
                            </p>
                            <div className={classes.container + ' ' + classes.text}>
                                {/* <p onClick={onEmailChange}>Змінити пошту</p> */}
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
    );
};

export default EmailConfirm;
