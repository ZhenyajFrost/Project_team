import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

import Button from '../../components/UI/Button/Button';
import css from './Profile.module.css';
import { Container } from 'reactstrap';
import { Route } from 'react-router-dom/cjs/react-router-dom.min';

class ProfileLayout extends Component {
    constructor(props) {
        super(props);
        this.state = {
            
            selectedPage: false, // false could represent "Lots", true for "Settings"
        };
    }

    onLots = () => {
        this.setState({ selectedPage: false });
        this.props.history.push('/profile/lots');
        
    }

    onSettings = () => {
        this.setState({ selectedPage: true });
        this.props.history.push('/profile/settings');
    }

    render() {
        const { selectedPage } = this.state;

        return (
            <div>
                <div className={css.navbar}>
                    <Button onClick={this.onLots} className={selectedPage ? css.selectedPage : ''}>Мої оголошення</Button>
                    <Button onClick={this.onSettings} className={!selectedPage ? css.selectedPage : ''}>Налаштування</Button>
                </div>

                <Container>
                    {this.props.children}
                </Container>
            </div>
        );
    }
}

export default withRouter(ProfileLayout);