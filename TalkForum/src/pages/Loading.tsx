import "./styles/style_loading.css"
import logoIcon from '/logo.ico'


const Loading = () => {
    return (<div className="loading-cover">
        <img src={logoIcon} alt="" className="loading-icon" />
    </div>);
};


export default Loading;