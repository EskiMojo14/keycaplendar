import React from 'react';
import { TextField } from '@rmwc/textfield';

import './SearchBar.scss';

export class SearchBarPersistent extends React.Component {
    constructor(props) {
        super(props);
        this.state = { expanded: false };
    }
    handleChange = e => {
        this.setState({
            expanded: (e.target.value.length !== 0 ? true : false)
        });
        this.props.setSearch(e.target.value);
    };
    clearInput = () => {
        this.setState({
            expanded: false
        })
        this.props.setSearch('');
    }
    render() {
        return (
            <div className={'search-bar search-bar--persistent' + (this.state.expanded ? ' search-bar--expanded' : '')}>
                <TextField outlined className="search-bar-field" value={this.props.search} autoComplete="off" placeholder="Search" icon="search" trailingIcon={(this.state.expanded ? ({
                    icon: 'clear',
                    tabIndex: 0,
                    onClick: () => this.clearInput()
                }) : '')} name='search' onChange={this.handleChange}/>
            </div>
        )
    }
}

export class SearchBarModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 
            opening: false, 
            closing: false, 
            animate: false,
            open: false
        };
    }
    componentDidMount() {
        this.setState({open: this.props.open});
    }
    componentDidUpdate(prevProps) {
        if (this.props.open !== prevProps.open) {
            if (this.props.open) {
                this.openBar();
            } else {
                this.closeBar();
            }
        }
    }
    openBar() {
        this.setState({open: true, animate: true});
        setTimeout(() => {
            this.setState({opening: true});
        },1);
        setTimeout(() => {
            this.setState({animate: false, opening: false});
        },250);
    }
    closeBar() {
        this.setState({
            closing: true
        });
        setTimeout(() => {
            this.props.close();
            this.setState({open: false, closing: false});
        },200);
    }
    handleChange = e => {
        this.setState({
            expanded: (e.target.value.length !== 0 ? true : false)
        });
        this.props.setSearch(e.target.value);
    };
    clearInput = () => {
        this.closeBar();
        this.props.setSearch('');
    }
    render() {
        return (
            <div className={'search-bar search-bar--modal' + (this.state.open ? ' search-bar--expanded' : '') + (this.state.opening ? ' search-bar--opening' : '')+ (this.state.closing ? ' search-bar--closing' : '') + (this.state.animate ? ' search-bar--animate' : '')}>
                <TextField outlined className="search-bar-field" value={this.props.search} autoComplete="off" placeholder="Search" icon="search" trailingIcon={{
                    icon: 'clear',
                    tabIndex: 0,
                    onClick: () => this.clearInput()
                }} name='search' onChange={this.handleChange}/>
            </div>
        )
    }
}

export default SearchBarPersistent;