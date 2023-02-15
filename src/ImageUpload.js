import {useState} from "react";
import './ImageUpload.css';
import {Button} from "@material-ui/core";

const BASE_URL = 'http://localhost:8000/'

function ImageUpload({authToken, authTokenType}) {
    const [caption, setCaption] = useState('');
    const [image, setImage] = useState(null);
    const handleChange = (e) => {
        if (e.target.files[0]) {
            setImage(e.target.files[0]);
        }
    }

    const handleUpload = (e) => {
        e?.preventDefault();

        const formData = new FormData();
        formData.append('request', image)

        const requestOptions = {
            method: 'POST',
            headers: new Headers({'Authorization': authTokenType + ' ' + authToken}),
            body: formData
        }
        fetch(BASE_URL + 'image', requestOptions)
            .then(response => {
                if (response.ok) {
                    return response.json()
                }
                throw response
            })
            .then(response => {
                setImage(null);
                createPost(response)
            })
            .catch(error => console.log(error))
            .finally(() => {
                setImage(null);
                setCaption('');
                document.getElementById('file_input').value = null;
            })
    }

    const createPost = (imageUrl) => {

        const json_string = JSON.stringify({
                'image_url': imageUrl.filename,
                'image_url_type': 'relative',
                'caption': caption
            }
        )
        const requestOptions = {
            method: 'POST',
            headers: new Headers({
                'Authorization': authTokenType + ' ' + authToken,
                'Content-Type': 'application/json'
            }),
            body: json_string
        }
        fetch(BASE_URL + 'post', requestOptions)
            .then(response => {
                if (response.ok) {
                    return response.json()
                }
                throw response
            })
            .then(response => {
                window.location.reload();
                window.scrollTo(0,0);
            })
            .catch(error => {
                console.log(error)
            })

    }

    return (
        <div className="image_upload">
            <input type="text" placeholder="Enter a caption" onChange={(event) => setCaption(event.target.value)}
                   value={caption}/>
            <input type="file" id="file_input" onChange={handleChange}/>
            <Button className="image_upload_button" onClick={handleUpload}>Upload</Button>
        </div>
    )
}

export default ImageUpload;