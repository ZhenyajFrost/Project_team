import React from 'react';
import css from './Footer.module.css'

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
                        <p>Про компанію</p>
                        <p>Новини</p>
                        <p>Допомога</p>
                        <p>Зв'язатися з нами</p>
                    </div>
                    <div className={css.menu2}>
                        <h4>Слідуйте за нами</h4>
                        <p>Facebook</p>
                        <p>Linkedin</p>
                        <p>Instagram</p>
                        <p>Telegram</p>
                    </div>
                </div>
            </div>
            <div className={css.menu}>
                <div className={css.menuItem}>Privacy Policy</div>
                <div className={css.menuItem}>Terms of Use</div>
                <div className={css.menuItem}>Sales and Refunds</div>
                <div className={css.menuItem}>Legal</div>
                <div className={css.menuItem}>Site Map</div>
            </div>
            <span>© 2021 Exestick</span>
        </footer>
    );
};

export default Footer;