import { Suspense } from "react";
import Loading from "../pages/Loading";
import KeepAlive from "react-activation";

interface KeepAliveHelperProps {
    name: string;
    children: React.ReactNode;
};


const KeepAliveHelper = ({ name, children }: KeepAliveHelperProps) => {
    return (
        <Suspense fallback={<Loading></Loading>}>
            <KeepAlive name={name}>{children}</KeepAlive>
        </Suspense>
    )
}
export default KeepAliveHelper;