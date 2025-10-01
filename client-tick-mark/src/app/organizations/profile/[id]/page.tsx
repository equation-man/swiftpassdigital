// Organization profile.
import AdminInfo from "@/components/AdminInfo/AdminInfo";
import { auth } from "@/auth";

const OrganizationProfilePage = async () => {
    const session = await auth();
    let user = session;

    if (session?.user) {
        user = session.user;
    }

    return (
        <div className="p-2"> 
            <AdminInfo org={user}/>
        </div>
    );
};

export default OrganizationProfilePage;
