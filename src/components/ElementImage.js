import React from 'react';
import { ImageListItem, ImageListImageAspectContainer, ImageListImage, ImageListSupporting, ImageListLabel } from '@rmwc/image-list';
import { Ripple } from '@rmwc/ripple';
import './ElementImage.scss';

export class ElementImage extends React.Component {
    render() {
        return (
            <Ripple>
            <ImageListItem
                tag="a"
                href={this.props.geekhack}
                target="_blank"
                rel="noreferrer"
                key={this.props.image}
                classNames="image-list-item"
            >
                <ImageListImageAspectContainer
                    style={{ paddingBottom: 'calc(100% / 1.5)' }}
                >
                    <ImageListImage src={this.props.image} />
                </ImageListImageAspectContainer>
                <ImageListSupporting>
                    <ImageListLabel>
                        <div>
                            {this.props.title}
                        </div>
                    </ImageListLabel>
                </ImageListSupporting>
            </ImageListItem>
            </Ripple>
        )
    }
}

export default ElementImage;