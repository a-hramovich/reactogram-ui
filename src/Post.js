import {useEffect, useState} from "react";
import './Post.css';
import {Avatar} from '@material-ui/core'

const BASE_URL = 'http://localhost:8000/'

function Post({post, authToken, authTokenType, userName}) {
    const [imageUrl, setImageUrl] = useState("")
    const [comments, setComments] = useState([])
    const [comment, setComment] = useState('')
    useEffect(() => {
        if (post.image_url_type == 'absolute') {
            setImageUrl(post.image_url)
        } else {
            setImageUrl(BASE_URL + post.image_url)
        }
    }, [])
    useEffect(() => {
        setComments(post.comments)
    }, [])

    const deletePost = (event) => {
        event?.preventDefault();
        const requestOptions = {
            method: 'DELETE',
            headers: {'Authorization': authTokenType + ' ' + authToken}
        }
        fetch(BASE_URL + 'post/' + post.id, requestOptions)
            .then(response => {
                if (response.ok) {
                    window.location.reload();
                }
                throw response
            })
            .catch(error => console.log(error))
    }

    const postComment = (event) => {
        event?.preventDefault();
        const json_string = JSON.stringify({
                'text': comment,
                'post_id': post.id
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
        fetch(BASE_URL + 'comment/create', requestOptions)
            .then(response => {
                if (response.ok) {
                    return response.json()
                }
                throw response
            })
            .then(response => fetchComments())
            .catch(error => console.log(error))
            .finally(() => setComment(''))

        const fetchComments = () => {
            const requestOptions = {
                method: 'GET',
                headers: new Headers({
                    'Content-Type': 'application/json'
                }),
            }
            fetch(BASE_URL + 'comment/all/' + post.id, requestOptions)
                .then(response => {
                    if (response.ok) {
                        return response.json()
                    }
                    throw response
                })
                .then(data => setComments(data))
                .catch(error => console.log(error))

        }
    }
    return (<div className="post">
        <div className="post_header">
            <Avatar
                alt="Catalin"
                src=""/>
            <div className="post_header_info">
                <h3>{post.user.username}</h3>
                {authToken && userName == post.user.username ? (
                    <button className="post_delete" onClick={() => deletePost()}>Delete</button>
                ) : (
                    <div>
                    </div>)}
            </div>
        </div>
        <img className="post_image" src={imageUrl}/>

        <h4 className="post_text">{post.caption}</h4>
        <div className="post_comments">
            {comments.map((comment) => (
                <p>
                    <strong>{comment.username}:</strong> {comment.text}
                </p>
            ))
            }
        </div>
        {authToken && (
            <form className="post_comment_box">
                <input className="post_input"
                       type="text"
                       placeholder="Add Comment"
                       value={comment}
                       onChange={(e) => setComment(e.target.value)}/>
                <button className="post_button"
                        type="submit"
                        disabled={!comment}
                        onClick={postComment}>
                    Post
                </button>
            </form>
        )
        }
    </div>)
}

export default Post;