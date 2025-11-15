// Organization profile.
import AdminInfo from "@/components/AdminInfo/AdminInfo";
import { auth } from "@/auth";
const OrganizationProfilePage = async () => {
    const session = await auth();
    let user = session;
    if (session === null || session === void 0 ? void 0 : session.user) {
        user = session.user.user;
    }
    return (<div className="p-2"> 
            <AdminInfo org={user}/>
        </div>);
};
export default OrganizationProfilePage;
