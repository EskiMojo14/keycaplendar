import React from 'react';
import { TextField } from '@rmwc/textfield';
import { Typography } from '@rmwc/typography';
import { CircularProgress } from '@rmwc/circular-progress';
import { Card, CardActions, CardActionButtons, CardActionButton } from '@rmwc/card';
import './ImageUpload.scss';

export class ImageUpload extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            imageBase64: '',
            imageLink: '',
            imageFromURL: false,
            dragOver: false,
            loading: false,
            hasImage: false
        };
    }
    componentDidUpdate(prevProps) {
        if (this.props.image !== prevProps.image) {
            if (this.props.image) {
                this.previewImage(this.props.image);
            } else {
                this.setState({
                    imageBase64: '',
                    imageLink: '',
                    imageFromURL: false,
                    dragOver: false,
                    loading: false,
                    hasImage: false
                })
            }
        }
    }

    previewImage = (image) => {
        let reader = new FileReader();
        reader.readAsDataURL(image);
        reader.onloadend = () => {
            this.setState({
                imageBase64: reader.result,
                hasImage: true,
                loading: false
            });
        }
    }

    handleChange = e => {
        this.setState({
            [e.target.name]: e.target.value
        });
    };

    dragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.setState({ dragOver: true });
    }

    dragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.setState({ dragOver: false });
    }

    dragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    }

    onDrop = (e) => {
        if (!this.state.imageFromURL) {
            e.preventDefault();
            e.stopPropagation();
            this.setState({ loading: true });
            let dt = e.dataTransfer;
            let file = dt.files[0];
            this.props.setImage(file);
            this.setState({ dragOver: false });
        }
    }

    fileChange = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.setState({ loading: true });
        let file = e.target.files[0];
        this.props.setImage(file);
        this.setState({ dragOver: false });
    }

    fromUrl = () => {
        this.setState({ imageFromURL: true });
    }

    fromFile = () => {
        this.setState({ imageFromURL: false });
    }

    componentDidMount() {
        let dropArea = document.getElementById('drop-area')
        dropArea.addEventListener('dragenter', (e) => {if (!this.state.imageFromURL && this.state.desktop) {this.dragEnter(e)}}, false);
        dropArea.addEventListener('dragleave', (e) => {if (!this.state.imageFromURL && this.state.desktop) {this.dragLeave(e)}}, false);
        dropArea.addEventListener('dragover', (e) => {if (!this.state.imageFromURL && this.state.desktop) {this.dragOver(e)}}, false);
        dropArea.addEventListener('drop', (e) => {if (!this.state.imageFromURL && this.state.desktop) {this.onDrop(e)}}, false);
    }
    render() {
        const imageTextField = (this.state.imageFromURL ? (
            <TextField icon="link" outlined label="Image link" pattern="https?://.+" name="imageLink" value={this.state.imageLink} onChange={this.handleChange} helpText={{ persistent: false, validationMsg: true, children: 'Must be valid link' }} />
        ) : '')
        const dragLabel = (this.state.hasImage ? (
            <img className="image-display-image" src={this.state.imageBase64} alt="Render" />
        ) : (this.state.loading ? '' : (this.props.desktop && !this.state.imageFromURL ? (
            <div className="drag-label">
                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M10.21 16.83l-1.96-2.36L5.5 18h11l-3.54-4.71z" /><path d="M16.5 18h-11l2.75-3.53 1.96 2.36 2.75-3.54L16.5 18zM17 7h-3V6H4v14h14V10h-1V7z" opacity=".3" /><path d="M20 4V1h-2v3h-3v2h3v2.99h2V6h3V4zm-2 16H4V6h10V4H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V10h-2v10z" /></svg>
                <Typography use="body2" tag="p" className="caption">Drag image here</Typography>
            </div>
        ) : (
                <div className="drag-label">
                    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M10.21 16.83l-1.96-2.36L5.5 18h11l-3.54-4.71z" /><path d="M16.5 18h-11l2.75-3.53 1.96 2.36 2.75-3.54L16.5 18zM17 7h-3V6H4v14h14V10h-1V7z" opacity=".3" /><path d="M20 4V1h-2v3h-3v2h3v2.99h2V6h3V4zm-2 16H4V6h10V4H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V10h-2v10z" /></svg>
                </div>
            ))));
        const loadingIndicator = (this.state.loading ? (
            <div className={"loading-indicator" + (this.state.hasImage ? ' image' : '')}>
                <CircularProgress size="large" />
            </div>
        ) : '')
        const actions = (!this.state.imageFromURL ? (
            <CardActions>
                <CardActionButtons>
                    <div className="file-input">
                        <CardActionButton tag="label" htmlFor="file-upload" label="Browse" />
                        <input type="file" id="file-upload" accept=".png, .jpg, .jpeg" onChange={this.fileChange} />
                    </div>
                    <CardActionButton label="From URL" onClick={this.fromUrl} />
                </CardActionButtons>
            </CardActions>
        ) : (
                <CardActions>
                    <CardActionButtons>
                        <CardActionButton label="From file" onClick={this.fromFile} />
                    </CardActionButtons>
                </CardActions>
            ))
        return (
            <Card outlined className="image-upload">
                <Typography use="caption" tag="h3" className="image-upload-title">Image*</Typography>
                <div className="image-upload-form">
                    {loadingIndicator}
                    <div id="drop-area" className={"image-display" + (this.state.dragOver ? ' over' : '') + (this.state.hasImage ? ' image' : '')}>
                        {dragLabel}
                    </div>
                    {imageTextField}
                </div>
                {actions}
            </Card>
        )
    }
}

export default ImageUpload;