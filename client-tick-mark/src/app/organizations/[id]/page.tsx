// Organizations page for organization activities.
import OrgHeader from "@/components/OrgHeader/OrgHeader";
import MyEvents from "@/components/Events/MyEvents";
import EventCreationModal from "@/components/Events/CreateEventModal";
import CreateTicketModal from "@/components/Events/CreateTicketModal";
import { auth } from "@/auth";

const OrganizationActivityPage = async () => {
    const session = await auth();
    let user = session;

    if (session?.user) {
        user = session.user;
    }

    return (
        <div className="p-2">
            {session?.user?.org_email && (<OrgHeader org={user}/>)}
            <h3 className="text-emerald-800 font-semibold text-xl p-2">My Events</h3>
            <MyEvents owner={user}/>
            {/* MODALS */}
            <EventCreationModal eventOwner={user}/>
            <CreateTicketModal />
        </div>
    );
};

export default OrganizationActivityPage;
