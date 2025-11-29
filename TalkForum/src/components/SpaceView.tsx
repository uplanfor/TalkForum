import Nav from "./Nav";
import InfoBackground from "./InfoBackground";
import { useParams, useNavigate } from "react-router-dom";
import NotFound from "../pages/NotFound";

interface SpaceViewProps {
    type: "club" | "user";
    id: number;
    onClose?: () => void;
}


const SpaceView = ({ type, id }: SpaceViewProps) => {

    return (
            <>
            </>

    )
}

export default SpaceView;