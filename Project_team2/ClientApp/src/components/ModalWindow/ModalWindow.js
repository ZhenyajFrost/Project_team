import React, { useEffect } from 'react';
import classes from './ModalWindow.module.css';

const ModalWindow = ({ children, visible, setVisible }) => {

    const rootClasses = [classes.modalWindow];
    if (visible) {
        rootClasses.push(classes.active);
    }

    useEffect(() => {
        if (visible) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [visible]);
    

    return (
        <div className={rootClasses.join(' ')} onClick={() => { setVisible(false) }}>
            <div className={classes.modalWindowContent} onClick={e => e.stopPropagation()}>
                {children}
            </div>
        </div>
    );
};

export default ModalWindow;
