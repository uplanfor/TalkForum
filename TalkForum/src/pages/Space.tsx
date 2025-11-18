import Nav from "../components/Nav";
import InfoBackground from "../components/InfoBackground";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import NotFound from "../pages/NotFound";

const Space = () => {
    const { spaceType, id } = useParams();
    const num = Number(id);
    const ok = typeof spaceType === "string" && ["club", "user"].includes(spaceType) && !isNaN(num);

    return (
        ok ?
            <>
                <Nav />
                <InfoBackground infoType={spaceType} targetId={num} />
                <div>{id}</div>
            </>
            : <NotFound />

    )
}

export default Space;