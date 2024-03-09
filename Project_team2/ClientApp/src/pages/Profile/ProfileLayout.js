import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import Button from '../../components/UI/Button/Button';
import css from './Profile.module.css';
import { Container } from 'reactstrap';

class ProfileLayout extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedPage: window.location.href.split('/').pop(),
        };
        console.log(this.state.selectedPage)
    }

    componentDidUpdate(prevProps) {
        if (this.props.location !== prevProps.location) {
            this.setState({
                selectedPage: window.location.href.split('/').pop(),
            });
        }
    }

    onLots = () => {
        this.setState({ selectedPage: 'lots' });
        this.props.history.push('/profile/lots');
    }

    onSettings = () => {
        this.setState({ selectedPage: 'settings' });

        this.props.history.push('/profile/settings');

    }

    onFavorites = () => {
        this.setState({ selectedPage: 'favorites' });

        this.props.history.push('/profile/favorites');

    }

    onBids = () => {
        this.setState({ selectedPage: 'bids' });

        this.props.history.push('/profile/bids');

    }

    render() {
        const { selectedPage } = this.state;

        return (
            <div>
                <div className={css.navbar}>
                    <Button onClick={this.onFavorites} className={selectedPage === 'favorites' ? '' : css.selectedPage}>Мої вподобання</Button>
                    <Button onClick={this.onBids} className={selectedPage === 'bids' ? '' : css.selectedPage}>Мої ставки</Button>
                    <Button onClick={this.onLots} className={selectedPage === 'lots' ? '' : css.selectedPage}>Мої оголошення</Button>
                    <Button onClick={this.onSettings} className={selectedPage === 'settings' ? '' : css.selectedPage}>Налаштування</Button>
                </div>

                <Container style={{ padding: '0' }}>
                    {this.props.children}
                </Container>
            </div>
        );
    }
}

export default withRouter(ProfileLayout);
