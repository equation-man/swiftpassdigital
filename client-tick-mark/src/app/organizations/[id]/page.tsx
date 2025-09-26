// Organizations page for organization activities.
import React from "react";
import OrgHeader from "@/components/OrgHeader/OrgHeader";
import MyEvents from "@/components/Events/MyEvents";
import EventCreationModal from "@/components/Events/CreateEventModal";
import { auth } from "@/auth";

const OrganizationActivityPage = async () => {
    const session = await auth();
    let user = session;

    if (session?.user) {
        user = session.user;
    }

    return (
        <div className="p-2">
            <OrgHeader org={user}/>
            <MyEvents owner={user}/>
            {/* MODALS */}
            <EventCreationModal eventOwner={user}/>
        </div>
    );
};

export default OrganizationActivityPage;
