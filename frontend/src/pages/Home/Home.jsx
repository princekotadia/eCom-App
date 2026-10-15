import { useAuth } from "../../context/AuthContext";
import './Home.css';

function Home() {
    const { email, fullName, phone } = useAuth().user

    return (
        <div className="home-container">
            <div className="home-content">
                <h2>Hey {fullName}!, Welcome to the store</h2>
                <div className="user-info">
                    <p><strong>Email: </strong>{email}</p>
                    <p><strong>Phone: </strong>{phone}</p>
                </div>
            </div>
        </div>
    )
}

export default Home;