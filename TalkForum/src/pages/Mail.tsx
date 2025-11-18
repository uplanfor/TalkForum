import Nav from "../components/Nav";
import "../assets/normalize.css"
import "./styles/style_mail.css"
import MessageSvg from "../assets/message.svg"
// import 


const Mail = () => {
  return (
    <>
      <Nav />
      <ul className="mail-list">
        <li className="mail-item">
          <img src={MessageSvg} alt="" />
          <div className="combo">
            <h3>Interactive Messages</h3>
            <p>[like]Jack liked your post.</p>
          </div>
        </li>

        
        <li className="mail-item">
          <img src={MessageSvg} alt="" />
          <div className="combo">
            <h3>Interactive Messages</h3>
            <p>[like]Jack liked your post.</p>
          </div>
        </li>

      </ul>
    </>
  )
}

export default Mail;