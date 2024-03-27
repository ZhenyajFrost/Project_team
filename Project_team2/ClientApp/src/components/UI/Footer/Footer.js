import React from 'react';
import css from './Footer.module.css'
import { NavLink } from 'reactstrap';

const Footer = () => {
    return (
        <footer className={css.footer}>
            <div className={`${css.container} ${css.border}`}>
                <div className={css.description}>
                    <h3>Хочете продавати швидше?</h3>
                    <p>Exestick - це український онлайн-аукціон, де ви можете купити і продати все, що завгодно! Тут ви знайдете найкращі пропозиції за привабливими цінами.</p>
                </div>
                <div className={`${css.container} ${css.container2}`} style={{gap: '100px'}}> 
                    <div className={css.menu2}>
                        <h4>Меню</h4>
                        <a href='/howItWorks'>Про компанію</a>
                        <a href='https://t.me/ExesticBot'>Допомога</a>
                        <a href='https://t.me/ExesticBot'>Зв'язатись з нами</a>
                    </div>
                    <div className={css.menu2}>
                        <h4>Слідуйте за нами</h4>
                        <a href='https://www.facebook.com/profile.php?id=61557918862969'>Facebook</a>
                        <a href='https://www.instagram.com/exestick.ua?igsh=MWp4ZzF6NmJoNXRqeA%3D%3D&utm_source=qr'>Instagram</a>
                        <a href='https://t.me/Exestic' target='blank'>Telegram</a>
                    </div>
                </div>
            </div>
            <span>© 2024 Exestick</span>
        </footer>
    );
};

export default Footer;