import React from 'react';
import { ImageListItem, ImageListImageAspectContainer, ImageListImage, ImageListSupporting, ImageListLabel } from '@rmwc/image-list';
import { Ripple } from '@rmwc/ripple';
import './ElementImage.scss';

export class ElementImage extends React.Component {
    render() {
        return (
            <Ripple>
                <ImageListItem tag="a" href={this.props.geekhack} target="_blank" rel="noreferrer" key={this.props.image} className="image-list-item">
                    <ImageListImageAspectContainer style={{ paddingBottom: 'calc(100% / 1.5)' }}>
                        <ImageListImage src={this.props.image} />
                    </ImageListImageAspectContainer>
                    <ImageListSupporting>
                        <ImageListLabel>
                            <div className="text-container">
                                <div className="primary-text">
                                    <div className="time-indicator">
                                        <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M12.07 6.01c-3.87 0-7 3.13-7 7s3.13 7 7 7 7-3.13 7-7-3.13-7-7-7zm1 8h-2v-6h2v6z" opacity=".3" /><path d="M9.07 1.01h6v2h-6zm2 7h2v6h-2zm8.03-.62l1.42-1.42c-.43-.51-.9-.99-1.41-1.41l-1.42 1.42C16.14 4.74 14.19 4 12.07 4c-4.97 0-9 4.03-9 9s4.02 9 9 9 9-4.03 9-9c0-2.11-.74-4.07-1.97-5.61zm-7.03 12.62c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" /></svg>
                                    </div>
                                    {this.props.title}</div>
                                <div className="secondary-text">{this.props.subtitle}</div>
                            </div>
                        </ImageListLabel>
                    </ImageListSupporting>
                </ImageListItem>
            </Ripple>
        )
    }
}

export default ElementImage;