/**
 * 消息页面组件
 * 用于展示用户的互动消息，包含：
 * - 导航栏
 * - 消息列表
 * - 消息项（包含图标、标题和内容）
 */
import Nav from "../components/Nav";
import { useTranslation } from "react-i18next";
import "../assets/normalize.css"
import "./styles/style_mail.css"
import MessageSvg from "../assets/message.svg"
// import 

/**
 * 消息页面组件
 * 展示用户的互动消息
 */
const Mail = () => {
  const { t } = useTranslation();
  
  return (
    <>
      {/* 导航栏组件 */}
      <Nav />
      
      {/* 消息列表 */}
      <ul className="mail-list">
        {/* 消息项 */}
        <li className="mail-item">
          <img src={MessageSvg} alt={t('mail.messageIconAlt')} />
          <div className="combo">
            <h3>{t('mail.interactiveMessagesTitle')}</h3>
            <p>{t('mail.likeMessage', { user: 'Jack' })}</p>
          </div>
        </li>

        
        {/* 消息项 */}
        <li className="mail-item">
          <img src={MessageSvg} alt={t('mail.messageIconAlt')} />
          <div className="combo">
            <h3>{t('mail.interactiveMessagesTitle')}</h3>
            <p>{t('mail.likeMessage', { user: 'Jack' })}</p>
          </div>
        </li>

      </ul>
    </>
  )
}

export default Mail;