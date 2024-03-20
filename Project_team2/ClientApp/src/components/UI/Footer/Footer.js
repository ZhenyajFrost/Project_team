import React from 'react';
import css from './Footer.module.css'
import { NavLink } from 'reactstrap';

const Footer = () => {
    return (
        <footer className={css.footer}>
            <div className={css.container}>
                <div className={css.description}>
                    <h3>Хочете продавати швидше?</h3>
                    <p>Exestick - це український онлайн-аукціон, де ви можете купити і продати все, що завгодно! Тут ви знайдете найкращі пропозиції за привабливими цінами.</p>
                </div>
                <div className={css.container} style={{gap: '100px'}}> 
                    <div className={css.menu2}>
                        <h4>Меню</h4>
                        <a >Про компанію</a>
                        <a>Новини</a>
                        <a href='/howItWorks'>Допомога</a>
                    </div>
                    <div className={css.menu2}>
                        <h4>Слідуйте за нами</h4>
                        <a href='https://uk-ua.facebook.com/'>Facebook</a>
                        <a href='https://www.instagram.com/?hl=ru'>Instagram</a>
                        <a href='https://t.me/Exestic' target='blank'>Telegram</a>
                    </div>
                </div>
            </div>
            <span>© 2024 Exestick</span>
        </footer>
    );
};

export default Footer;