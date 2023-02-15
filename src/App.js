import './App.css';
import {useEffect, useState} from "react";
import Post from "./Post";
import ImageUpload from "./ImageUpload";
import {Button, Input, makeStyles, Modal} from "@material-ui/core";

const BASE_URL = 'http://localhost:8000/'

function getModalStyle() {
    const top = 50;
    const left = 50;

    return {
        top: `${top}%`,
        left: `${left}%`,
        transform: `translate(-${top}%, -${left}%)`,
    };
}

const useStyles = makeStyles((theme) => ({
    paper: {
        backgroundColor: theme.palette.background.paper,
        position: 'absolute',
        width: 400,
        border: '2px solid #000',
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3)
    }
}))

function App() {
    const classes = useStyles();
    const [posts, setPosts] = useState([]);
    const [openSignIn, setOpenSignIn] = useState(false);
    const [openSignUp, setOpenSignUp] = useState(false);
    const [modalStyle, setModalStyle] = useState(getModalStyle)
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [email, setEmail] = useState('')
    const [authToken, setAuthToken] = useState(null)
    const [authTokenType, setAuthTokenType] = useState(null)
    const [userId, setUserId] = useState('')

    useEffect(() => {
        setAuthToken(window.localStorage.getItem('authToken'));
        setAuthTokenType(window.localStorage.getItem('authTokenType'));
        setUsername(window.localStorage.getItem('username'));
        setUserId(window.localStorage.getItem('userId'));
    }, [])

    useEffect(() => {
        authToken
            ? window.localStorage.setItem('authToken', authToken)
            : window.localStorage.removeItem('authToken');
        authTokenType
            ? window.localStorage.setItem('authTokenType', authTokenType)
            : window.localStorage.removeItem('authTokenType');
        userId
            ? window.localStorage.setItem('userId', userId)
            : window.localStorage.removeItem('userId');
        username
            ? window.localStorage.setItem('username', username)
            : window.localStorage.removeItem('username');
    }, [authToken, authTokenType, userId])


    useEffect(() => {
        fetch(BASE_URL + 'post/all')
            .then(response => {
                if (response.ok) {
                    return response.json()
                }
                throw response
            })
            .then(data => {
                return sortPosts(data)
            })
            .then(data => {
                setPosts(data)
            })
            .catch(error => {
                console.log(error)
            })
    }, [])

    const signIn = (event) => {
        event?.preventDefault();
        let formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);

        const requestOptions = {
            method: 'POST',
            body: formData
        }
        fetch(BASE_URL + 'login', requestOptions)
            .then(response => {
                if (response.ok) {
                    return response.json()
                }
                throw response
            })
            .then((data) => {
                setAuthToken(data.access_token);
                setAuthTokenType(data.token_type);
                setUserId(data.user_id);
                setUsername(data.username);
            })
            .catch(error => {
                console.log(error)
            })

        setOpenSignIn(false);
    }

    const signUp = (event) => {
        event?.preventDefault();
        const json_string = JSON.stringify({
            username: username,
            password: password,
            email: email
        });

        const requestOptions = {
            method: 'POST',
            body: json_string,
            headers: {'Content-Type': 'application/json'}
        }
        fetch(BASE_URL + 'user', requestOptions)
            .then(response => {
                if (response.ok) {
                    return response.json()
                }
                throw response
            })
            .then((data) => {
                signIn();
            })
            .catch(error => console.log(error))

        setOpenSignUp(false);
    }

    const logOutUser = (event) => {
        setAuthToken(null)
        setAuthTokenType(null)
        setUserId('')
        setUsername('')
    }

    return (
        <div className="app">
            <Modal
                open={openSignIn}
                onClose={() => setOpenSignIn(false)}>

                <div style={modalStyle} className={classes.paper}>
                    <form className="app_signin">
                        <center>
                            <img className="app_login_header_image"
                                 src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg"
                                 alt="Reactogram"/>
                        </center>
                        <Input
                            placeholder="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}/>
                        <Input
                            placeholder="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}/>
                        <Button
                            type="submit"
                            onClick={signIn}>Login</Button>
                    </form>
                </div>

            </Modal>

            <Modal
                open={openSignUp}
                onClose={() => setOpenSignUp(false)}>

                <div style={modalStyle} className={classes.paper}>
                    <form className="app_signup">
                        <center>
                            <img className="app_login_header_image"
                                 src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg"
                                 alt="Reactogram"/>
                        </center>
                        <Input
                            placeholder="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}/>
                        <Input
                            placeholder="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}/>
                        <Input
                            placeholder="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}/>
                        <Button
                            type="submit"
                            onClick={signUp}>Sign up</Button>
                    </form>
                </div>

            </Modal>

            <div className="app_header">
                <img className="app_header_image"
                     src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg" alt="Reactogram"/>
                {authToken ? (
                    <Button onClick={() => logOutUser()}>Logout</Button>
                ) : (
                    <div>
                        <Button onClick={() => setOpenSignIn(true)}>Login</Button>
                        <Button onClick={() => setOpenSignUp(true)}>Sign up</Button>
                    </div>)}
            </div>
            <div className="app_posts">
                {
                    posts.map(post => (
                        <Post
                            post={post}
                            authToken={authToken}
                            authTokenType={authTokenType}
                            userName={username}
                        />
                    ))
                }
            </div>
            {
                authToken ? (
                    <ImageUpload
                        authToken={authToken}
                        authTokenType={authTokenType}
                    />
                ) : (
                    <h3>You need to login to upload</h3>
                )
            }
        </div>
    );
}

function sortPosts(posts) {
    return posts.sort((a, b) => {
        const t_a = a.timestamp.split(/[-T:]/);
        const t_b = b.timestamp.split(/[-T:]/);
        const d_a = new Date(Date.UTC(t_a[0], t_a[1] - 1, t_a[2], t_a[3], t_a[4], t_a[5]));
        const d_b = new Date(Date.UTC(t_b[0], t_b[1] - 1, t_b[2], t_b[3], t_b[4], t_b[5]));
        return d_b - d_a
    })
}

export default App;
